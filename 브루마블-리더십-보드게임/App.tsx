import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import TeamStatus from './components/TeamStatus';
import ControlPanel from './components/ControlPanel';
import CardModal from './components/CardModal';
import ReportView from './components/ReportView';
import Intro from './components/Intro';
import Lobby from './components/Lobby';
import MobileTeamView from './components/MobileTeamView';
import {
  Team,
  GamePhase,
  SquareType,
  GameCard,
  Choice,
  GameVersion,
  Session,
  SessionStatus,
  TeamColor,
  AIEvaluationResult,
  TurnRecord
} from './types';
import {
  BOARD_SQUARES,
  SAMPLE_CARDS,
  BOARD_SIZE,
  INITIAL_RESOURCES
} from './constants';
import { Smartphone, Monitor, QrCode, X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GoogleGenAI, Type } from "@google/genai";

// Firebase 연동
import * as firestoreService from './lib/firestore';

type AppView = 'intro' | 'lobby' | 'game' | 'participant';
type AdminViewMode = 'dashboard' | 'mobile_monitor';

const App: React.FC = () => {
  // --- Global App State ---
  const [view, setView] = useState<AppView>('intro');

  // --- Session Management State ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // --- Participant State ---
  const [participantTeamId, setParticipantTeamId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [isJoinedTeam, setIsJoinedTeam] = useState(false);
  const [initialAccessCode, setInitialAccessCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // --- Current Game State ---
  const [adminViewMode, setAdminViewMode] = useState<AdminViewMode>('dashboard');
  const [monitoringTeamId, setMonitoringTeamId] = useState<string | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.Idle);
  const [diceValue, setDiceValue] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [gameLogs, setGameLogs] = useState<string[]>([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState(120);
  const [showReport, setShowReport] = useState(false);

  // --- Active Card & Decision State (Shared between Admin & Mobile) ---
  const [activeCard, setActiveCard] = useState<GameCard | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [previewCard, setPreviewCard] = useState<GameCard | null>(null);

  // --- Preview Card State (관리자 미리보기용 - 게임에 반영 안됨) ---
  const [previewSelectedChoice, setPreviewSelectedChoice] = useState<Choice | null>(null);
  const [previewReasoning, setPreviewReasoning] = useState('');
  const [previewAiResult, setPreviewAiResult] = useState<AIEvaluationResult | null>(null);
  const [isPreviewProcessing, setIsPreviewProcessing] = useState(false);

  // --- Invite Modal State ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Shared Input State
  const [sharedSelectedChoice, setSharedSelectedChoice] = useState<Choice | null>(null);
  const [sharedReasoning, setSharedReasoning] = useState('');
  const [aiEvaluationResult, setAiEvaluationResult] = useState<AIEvaluationResult | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isTeamSaved, setIsTeamSaved] = useState(false);  // 팀이 입력을 저장했는지
  const [isSaving, setIsSaving] = useState(false);        // 저장 중 여부

  // Ref to track local operations in progress (to prevent Firebase from overriding local state)
  const localOperationInProgress = useRef(false);
  const localOperationTimestamp = useRef(0);

  // Ref to prevent saving data that was just received from Firebase (무한 루프 방지)
  const isReceivingFromFirebase = useRef(false);
  const lastReceivedTimestamp = useRef(0);
  const saveDebounceTimer = useRef<any>(null);

  // gameLogs를 ref로 관리하여 저장 시 최신 값 사용 (의존성 루프 방지)
  const gameLogsRef = useRef<string[]>([]);
  // gameLogs 변경 시 ref도 업데이트
  useEffect(() => {
    gameLogsRef.current = gameLogs;
  }, [gameLogs]);

  // Helper to get current session object
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const teams = currentSession ? currentSession.teams : [];
  const currentTeam = teams[currentTurnIndex];

  // 참가자 접속 URL 생성
  const getJoinUrl = (accessCode: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?join=${accessCode}`;
  };

  // 링크 복사 핸들러
  const handleCopyLink = async (accessCode: string) => {
    const url = getJoinUrl(accessCode);
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // --- AI Client Initialization ---
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // --- LocalStorage: 참가자 세션 복구 ---
  useEffect(() => {
    const savedSession = localStorage.getItem('bluemarble_participant_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.sessionId && parsed.teamId && parsed.name) {
          setCurrentSessionId(parsed.sessionId);
          setParticipantTeamId(parsed.teamId);
          setParticipantName(parsed.name);
          setIsJoinedTeam(true);
          setView('participant');
        }
      } catch (e) {
        console.error('세션 복구 실패:', e);
        localStorage.removeItem('bluemarble_participant_session');
      }
    }
  }, []);

  // --- LocalStorage: 참가자 세션 저장 ---
  useEffect(() => {
    if (isJoinedTeam && currentSessionId && participantTeamId && participantName) {
      localStorage.setItem('bluemarble_participant_session', JSON.stringify({
        sessionId: currentSessionId,
        teamId: participantTeamId,
        name: participantName,
        timestamp: Date.now()
      }));
    }
  }, [isJoinedTeam, currentSessionId, participantTeamId, participantName]);

  // --- URL 파라미터 확인 (접속 코드) ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setInitialAccessCode(joinCode);
      // URL로 접속한 경우 저장된 세션 무시
      localStorage.removeItem('bluemarble_participant_session');
    }
  }, []);

  // --- Firebase: 세션 실시간 구독 ---
  useEffect(() => {
    // Firebase가 설정되어 있으면 실시간으로 세션 목록 구독
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    if (isFirebaseConfigured) {
      const unsubscribe = firestoreService.subscribeToAllSessions((firebaseSessions) => {
        setSessions(firebaseSessions);
      });
      return () => unsubscribe();
    }
  }, []);

  // --- Firebase: 현재 세션 실시간 구독 (참가자/관리자 동기화) ---
  useEffect(() => {
    if (!currentSessionId) return;

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!isFirebaseConfigured) return;

    const unsubscribe = firestoreService.subscribeToSession(currentSessionId, (session) => {
      if (session) {
        setSessions(prev => prev.map(s => s.id === currentSessionId ? session : s));
      }
    });

    return () => unsubscribe();
  }, [currentSessionId]);

  // --- Firebase: 게임 상태 실시간 구독 ---
  useEffect(() => {
    if (!currentSessionId) return;

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!isFirebaseConfigured) return;

    console.log('[Firebase] 게임 상태 구독 시작:', currentSessionId);

    const unsubscribe = firestoreService.subscribeToGameState(currentSessionId, (state) => {
      if (state) {
        // 로컬 작업 진행 중이면 Firebase 상태 무시 (로컬 상태가 우선)
        if (localOperationInProgress.current) {
          console.log('[Firebase] 로컬 작업 진행 중 - 업데이트 스킵');

          // Decision 상태에서 다른 팀원의 입력만 업데이트
          if (state.currentCard && state.phase === GamePhase.Decision) {
            isReceivingFromFirebase.current = true;
            setActiveCard(state.currentCard);
            setSharedSelectedChoice(state.selectedChoice);
            setSharedReasoning(state.reasoning || '');
            setShowCardModal(true);
            // 짧은 지연 후 플래그 해제
            setTimeout(() => { isReceivingFromFirebase.current = false; }, 100);
          }
          return;
        }

        // 로컬 작업이 끝난 후 일정 시간 동안도 보호 (Firebase 지연 응답 방지)
        const timeSinceLocalOp = Date.now() - localOperationTimestamp.current;
        if (timeSinceLocalOp < 2000 && state.lastUpdated < localOperationTimestamp.current) {
          console.log('[Firebase] 오래된 Firebase 데이터 무시');
          return;
        }

        // 이미 같은 timestamp의 데이터를 받았으면 스킵 (중복 처리 방지)
        if (state.lastUpdated && state.lastUpdated === lastReceivedTimestamp.current) {
          return;
        }
        lastReceivedTimestamp.current = state.lastUpdated || 0;

        // Firebase 수신 플래그 설정 (무한 루프 방지)
        isReceivingFromFirebase.current = true;

        // 정상적인 Firebase 상태 동기화
        setGamePhase(state.phase as GamePhase);
        setCurrentTurnIndex(state.currentTeamIndex);

        // diceValue는 값이 실제로 다를 때만 업데이트
        const newDiceValue = state.diceValue || [1, 1];
        setDiceValue(prev => {
          if (prev[0] === newDiceValue[0] && prev[1] === newDiceValue[1]) {
            return prev;
          }
          return newDiceValue;
        });

        setActiveCard(state.currentCard);
        setSharedSelectedChoice(state.selectedChoice);
        setSharedReasoning(state.reasoning || '');
        // AI 결과는 관리자 로컬에서만 관리 (Firebase에서 동기화하지 않음)
        // setAiEvaluationResult(state.aiResult);
        setIsAiProcessing(state.isAiProcessing || false);
        setIsTeamSaved(state.isSubmitted || false);  // 팀 저장 완료 여부
        setIsRolling(state.phase === GamePhase.Rolling);

        // gameLogs는 길이가 다를 때만 업데이트 (배열 참조 비교로 인한 무한 루프 방지)
        if (state.gameLogs?.length) {
          setGameLogs(prev => {
            if (prev.length === state.gameLogs.length) {
              return prev; // 같은 길이면 기존 참조 유지
            }
            return state.gameLogs;
          });
        }

        // 카드가 있으면 모달 표시
        if (state.currentCard && state.phase === GamePhase.Decision) {
          setShowCardModal(true);
        }
        if (state.aiResult && state.phase !== GamePhase.Decision) {
          setShowCardModal(false);
        }

        // 짧은 지연 후 플래그 해제 (상태 업데이트가 완료된 후)
        setTimeout(() => { isReceivingFromFirebase.current = false; }, 100);
      }
    });

    return () => unsubscribe();
  }, [currentSessionId]);

  // --- Firebase: 게임 상태 저장 (변경 시) ---
  const saveGameStateToFirebase = useCallback(async () => {
    if (!currentSessionId) return;

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!isFirebaseConfigured) return;

    try {
      await firestoreService.updateGameState(currentSessionId, {
        sessionId: currentSessionId,
        phase: gamePhase,
        currentTeamIndex: currentTurnIndex,
        currentTurn: 0,
        diceValue: diceValue,
        currentCard: activeCard,
        selectedChoice: sharedSelectedChoice,
        reasoning: sharedReasoning,
        aiResult: aiEvaluationResult,
        isSubmitted: !!aiEvaluationResult,
        isAiProcessing: isAiProcessing,
        gameLogs: gameLogsRef.current, // ref 사용으로 의존성 루프 방지
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Firebase 게임 상태 저장 실패:', error);
    }
  }, [currentSessionId, gamePhase, currentTurnIndex, diceValue, activeCard, sharedSelectedChoice, sharedReasoning, aiEvaluationResult, isAiProcessing]);

  // 게임 상태 변경 시 Firebase에 저장 (디바운스 적용)
  useEffect(() => {
    // Firebase에서 방금 받은 데이터면 다시 저장하지 않음 (무한 루프 방지)
    if (isReceivingFromFirebase.current) {
      return;
    }

    // Rolling/Moving 상태는 handleRollDice()와 performMove()에서 직접 저장
    if (gamePhase === GamePhase.Rolling || gamePhase === GamePhase.Moving) {
      return;
    }

    // Decision 상태에서만 자동 저장 (사용자 입력 동기화)
    if (currentSessionId && gamePhase === GamePhase.Decision && activeCard) {
      // 기존 타이머 취소
      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current);
      }
      // 500ms 디바운스 (빠른 타이핑 중 연속 저장 방지)
      saveDebounceTimer.current = setTimeout(() => {
        if (!isReceivingFromFirebase.current) {
          saveGameStateToFirebase();
        }
      }, 500);
    }

    return () => {
      if (saveDebounceTimer.current) {
        clearTimeout(saveDebounceTimer.current);
      }
    };
  }, [sharedSelectedChoice, sharedReasoning, aiEvaluationResult, isAiProcessing, gamePhase, currentSessionId, activeCard, saveGameStateToFirebase]);

  // --- Session Logic ---

  const handleCreateSession = async (name: string, version: GameVersion, teamCount: number) => {
    const newSessionId = `sess_${Date.now()}`;
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate initial teams based on count
    const newTeams: Team[] = [];
    const colors = Object.values(TeamColor);

    for (let i = 0; i < teamCount; i++) {
      newTeams.push({
        id: `t_${newSessionId}_${i}`,
        name: `${i + 1}팀`,
        color: colors[i % colors.length],
        position: 0,
        resources: { ...INITIAL_RESOURCES },
        isBurnout: false,
        burnoutCounter: 0,
        lapCount: 0,
        members: [],
        currentMemberIndex: 0,
        history: [] // Init history
      });
    }

    const newSession: Session = {
      id: newSessionId,
      name,
      version,
      teamCount,
      status: 'active',
      accessCode,
      createdAt: Date.now(),
      teams: newTeams
    };

    // Firebase에 저장 (설정되어 있으면)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.createSession(newSession);
        // Firebase 구독이 자동으로 세션을 추가하므로 여기서는 추가하지 않음
        return;
      } catch (error) {
        console.error('Firebase 세션 생성 실패:', error);
        throw error; // 에러를 상위로 전달
      }
    }

    // Firebase 미설정 시에만 로컬 상태 업데이트
    setSessions(prev => [newSession, ...prev]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.deleteSession(sessionId);
        // Firebase 구독이 자동으로 세션을 제거하므로 여기서는 제거하지 않음
        return;
      } catch (error) {
        console.error('Firebase 세션 삭제 실패:', error);
      }
    }
    // Firebase 미설정 시에만 로컬 상태 업데이트
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: SessionStatus) => {
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateSessionStatus(sessionId, status);
      } catch (error) {
        console.error('Firebase 세션 상태 업데이트 실패:', error);
      }
    }
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s));
  };

  const handleEnterSession = (session: Session) => {
    setCurrentSessionId(session.id);
    setCurrentTurnIndex(0);
    setGamePhase(GamePhase.Idle);
    setMonitoringTeamId(session.teams[0]?.id || null);
    setGameLogs([`Entered Session: ${session.name}`, `Status: ${session.status}`]);
    setView('game');
  };

  // 참가자 세션 참여 핸들러
  const handleUserJoin = async (accessCode: string) => {
    setIsJoining(true);
    setJoinError('');

    try {
      // Firebase에서 세션 찾기
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;

      let foundSession: Session | null = null;

      if (isFirebaseConfigured) {
        // Firebase에서 접속 코드로 세션 검색
        foundSession = await firestoreService.getSessionByAccessCode(accessCode);
      } else {
        // 로컬 세션에서 검색
        foundSession = sessions.find(s => s.accessCode === accessCode) || null;
      }

      if (!foundSession) {
        setJoinError('세션을 찾을 수 없습니다. 접속 코드를 확인해주세요.');
        setIsJoining(false);
        return;
      }

      if (foundSession.status !== 'active') {
        setJoinError('이 세션은 현재 활성화되지 않았습니다.');
        setIsJoining(false);
        return;
      }

      // 세션 입장
      setCurrentSessionId(foundSession.id);

      // 로컬 세션 목록에 추가 (없으면)
      setSessions(prev => {
        if (prev.find(s => s.id === foundSession!.id)) return prev;
        return [...prev, foundSession!];
      });

      // URL에서 join 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);

      // 참가자 뷰로 이동
      setView('participant');

    } catch (error) {
      console.error('세션 참여 실패:', error);
      setJoinError('세션 참여 중 오류가 발생했습니다.');
    } finally {
      setIsJoining(false);
    }
  };

  // 참가자 팀 선택 핸들러
  const handleSelectTeam = (teamId: string) => {
    setParticipantTeamId(teamId);
  };

  // 참가자 팀 참여 핸들러 (이름 입력 후)
  const handleJoinTeam = async (teamId: string, playerName: string) => {
    if (!playerName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    // currentSession이 없으면 Firebase에서 직접 조회
    let sessionToUpdate = currentSession;

    if (!sessionToUpdate && currentSessionId) {
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (isFirebaseConfigured) {
        try {
          sessionToUpdate = await firestoreService.getSession(currentSessionId);
        } catch (error) {
          console.error('세션 조회 실패:', error);
        }
      }
    }

    if (!sessionToUpdate) {
      alert('세션을 찾을 수 없습니다. 다시 시도해주세요.');
      return;
    }

    const newPlayer = {
      id: `player_${Date.now()}`,
      name: playerName.trim()
    };

    // 팀에 멤버 추가
    const updatedTeams = sessionToUpdate.teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: [...team.members, newPlayer]
        };
      }
      return team;
    });

    // Firebase에 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateTeams(currentSessionId!, updatedTeams);
        console.log('[Firebase] 팀원 추가 완료:', playerName);
      } catch (error) {
        console.error('Firebase 팀원 추가 실패:', error);
        alert('팀 참여에 실패했습니다. 다시 시도해주세요.');
        return;
      }
    }

    // 로컬 상태 업데이트
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, teams: updatedTeams };
      }
      return s;
    }));

    setParticipantName(playerName.trim());
    setIsJoinedTeam(true);
  };

  const updateTeamsInSession = async (updatedTeams: Team[]) => {
    if (!currentSessionId) return;

    // Firebase에 저장 (설정되어 있으면)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateTeams(currentSessionId, updatedTeams);
      } catch (error) {
        console.error('Firebase 팀 업데이트 실패:', error);
      }
    }

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, teams: updatedTeams };
      }
      return s;
    }));
  };

  // Timer - gamePhase만 의존하여 불필요한 재생성 방지
  useEffect(() => {
    let interval: any;
    if (gamePhase === GamePhase.Decision) {
      interval = setInterval(() => {
        setTurnTimeLeft((prev) => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gamePhase]);

  const addLog = useCallback(async (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    const logEntry = `[${timestamp}] ${message}`;
    setGameLogs(prev => [...prev, logEntry]);

    // Firebase에도 로그 저장
    if (currentSessionId) {
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (isFirebaseConfigured) {
        try {
          await firestoreService.addGameLog(currentSessionId, logEntry);
        } catch (error) {
          console.error('Firebase 로그 저장 실패:', error);
        }
      }
    }
  }, [currentSessionId]);

  const nextTurn = useCallback(() => {
    if (!currentSession) return;

    // Reset Shared State
    setShowCardModal(false);
    setActiveCard(null);
    setSharedSelectedChoice(null);
    setSharedReasoning('');
    setAiEvaluationResult(null);
    setIsAiProcessing(false);
    setIsTeamSaved(false);
    setIsSaving(false);

    setGamePhase(GamePhase.Idle);
    setTurnTimeLeft(120);
    
    // Rotate team members
    const updatedTeams = currentSession.teams.map((team, idx) => {
      if (idx === currentTurnIndex && team.members.length > 0) {
        const nextMemberIndex = (team.currentMemberIndex + 1) % team.members.length;
        return { ...team, currentMemberIndex: nextMemberIndex };
      }
      return team;
    });
    
    updateTeamsInSession(updatedTeams);
    setCurrentTurnIndex((prev) => (prev + 1) % currentSession.teams.length);
  }, [currentSession, currentTurnIndex, currentSessionId]);

  // 게임 리셋 함수
  const handleResetGame = useCallback(async () => {
    if (!currentSession || !currentSessionId) return;

    const confirmed = window.confirm('게임을 초기화하시겠습니까? 모든 팀의 점수와 히스토리가 리셋됩니다.');
    if (!confirmed) return;

    // 모든 팀 초기화
    const resetTeams = currentSession.teams.map(team => ({
      ...team,
      position: 0,
      resources: { ...INITIAL_RESOURCES },
      isBurnout: false,
      burnoutCounter: 0,
      lapCount: 0,
      currentMemberIndex: 0,
      history: []
    }));

    // 로컬 상태 초기화
    setShowCardModal(false);
    setActiveCard(null);
    setSharedSelectedChoice(null);
    setSharedReasoning('');
    setAiEvaluationResult(null);
    setIsAiProcessing(false);
    setIsTeamSaved(false);
    setIsSaving(false);
    setGamePhase(GamePhase.Idle);
    setCurrentTurnIndex(0);
    setDiceValue([1, 1]);
    setTurnTimeLeft(120);
    setGameLogs(['[시스템] 게임이 리셋되었습니다.']);
    gameLogsRef.current = ['[시스템] 게임이 리셋되었습니다.'];

    // Firebase 업데이트
    await updateTeamsInSession(resetTeams);

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Idle,
          currentTeamIndex: 0,
          currentTurn: 0,
          diceValue: [1, 1],
          currentCard: null,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          gameLogs: ['[시스템] 게임이 리셋되었습니다.'],
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 리셋 실패:', err);
      }
    }

    alert('게임이 초기화되었습니다!');
  }, [currentSession, currentSessionId]);

  const updateTeamHistory = (teamId: string, record: TurnRecord) => {
    if (!currentSession) return;
    const updatedTeams = currentSession.teams.map(team => {
      if (team.id !== teamId) return team;
      return { ...team, history: [...team.history, record] };
    });
    updateTeamsInSession(updatedTeams);
  };

  const updateTeamResources = async (teamId: string, changes: any) => {
    if (!currentSession) return;
    const updatedTeams = currentSession.teams.map(team => {
      if (team.id !== teamId) return team;

      const newResources = { ...team.resources };

      // Update resources without capping (allow negative and >100)
      if (changes.capital !== undefined) newResources.capital += changes.capital;
      if (changes.energy !== undefined) newResources.energy += changes.energy;
      if (changes.reputation !== undefined) newResources.reputation += changes.reputation;
      if (changes.trust !== undefined) newResources.trust += changes.trust;
      if (changes.competency !== undefined) newResources.competency += changes.competency;
      if (changes.insight !== undefined) newResources.insight += changes.insight;

      return { ...team, resources: newResources };
    });
    await updateTeamsInSession(updatedTeams);
  };

  // --- Core Game Actions ---

  // GameVersion을 카드 타입으로 변환하는 헬퍼 함수
  const getCardTypeFromVersion = (version: GameVersion | string | undefined): string => {
    switch (version) {
      case GameVersion.Self:
      case 'Self Leadership':
        return 'Self';
      case GameVersion.Follower:
      case 'Followership':
        return 'Follower';
      case GameVersion.Leader:
      case 'Leadership (Manager)':
        return 'Leader';
      case GameVersion.Team:
      case 'Teamship':
        return 'Team';
      default:
        return 'Self'; // 기본값
    }
  };

  // 역량 ID를 한글 이름으로 변환하는 헬퍼 함수
  const getCompetencyName = (competencyId: string | undefined): string => {
    if (!competencyId) return '일반';
    const square = BOARD_SQUARES.find(s => s.competency === competencyId);
    if (square) {
      // 이름에서 한글 부분만 추출 (예: '자기 인식 (Self-Awareness)' → '자기 인식')
      const match = square.name.match(/^([^(]+)/);
      return match ? match[1].trim() : square.name;
    }
    return competencyId;
  };

  const handleLandOnSquare = (team: Team, squareIndex: number) => {
    const square = BOARD_SQUARES.find(s => s.index === squareIndex);
    if (!square) return;

    // 세션 모드에 맞는 카드 타입 결정
    const sessionCardType = getCardTypeFromVersion(currentSession?.version);

    // Helper to pick random card
    const pickRandomCard = (type: string, fallbackId: string = 'E-001') => {
      const candidates = SAMPLE_CARDS.filter(c => c.type === type);
      return candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : SAMPLE_CARDS.find(c => c.id === fallbackId) || SAMPLE_CARDS[0];
    };

    let selectedCard: GameCard | null = null;

    if (square.type === SquareType.City) {
      // 세션 모드(version)와 칸의 역량(competency)에 맞는 카드 선택
      // 예: Leader 세션 + time-management 칸 → LEAD-TM-001 카드
      const exactCard = SAMPLE_CARDS.find(c => c.type === sessionCardType && c.competency === square.competency);
      selectedCard = exactCard || SAMPLE_CARDS.find(c => c.type === sessionCardType) || SAMPLE_CARDS[0];
    }
    else if (square.type === SquareType.GoldenKey) {
      selectedCard = pickRandomCard('Event');
    }
    else if (square.type === SquareType.Fund) {
      const fundCards = SAMPLE_CARDS.filter(c => c.title.includes("사내 벤처") || c.type === 'Event');
      selectedCard = fundCards[Math.floor(Math.random() * fundCards.length)];
    }
    else if (square.type === SquareType.Space) {
      selectedCard = pickRandomCard('Challenge', 'C-001');
    }
    else if (square.type === SquareType.WorldTour) {
      selectedCard = pickRandomCard('CoreValue', 'V-001');
    }
    else if (square.type === SquareType.Island) {
      selectedCard = pickRandomCard('Burnout', 'B-001');
    }
    else if (square.type === SquareType.Start) {
      updateTeamResources(team.id, { capital: 50 });
      nextTurn();
      return;
    }
    else {
      nextTurn();
      return;
    }

    if (selectedCard) {
      setActiveCard(selectedCard);
      setSharedSelectedChoice(null);
      setSharedReasoning('');
      setAiEvaluationResult(null);
      setGamePhase(GamePhase.Decision);
      setShowCardModal(true);

      // 즉시 Firebase에 게임 상태 저장 (팀원들이 카드를 볼 수 있도록)
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (isFirebaseConfigured && currentSessionId) {
        firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Decision,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: selectedCard,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        }).catch(err => console.error('Firebase 상태 저장 실패:', err));
      }
    }
  };

  const handleRollDice = () => {
    if (isRolling || gamePhase === GamePhase.Rolling) return;

    // 로컬 작업 시작 - Firebase가 이 상태를 덮어쓰지 않도록 보호
    localOperationInProgress.current = true;
    localOperationTimestamp.current = Date.now();

    setIsRolling(true);
    setGamePhase(GamePhase.Rolling);

    // Firebase에 Rolling 상태 저장 시도 (실패해도 로컬 게임은 계속 진행)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      firestoreService.updateGameState(currentSessionId, {
        sessionId: currentSessionId,
        phase: GamePhase.Rolling,
        currentTeamIndex: currentTurnIndex,
        currentTurn: 0,
        diceValue: diceValue,
        currentCard: null,
        selectedChoice: null,
        reasoning: '',
        aiResult: null,
        isSubmitted: false,
        isAiProcessing: false,
        gameLogs: gameLogsRef.current,
        lastUpdated: Date.now()
      }).catch(err => console.warn('[Firebase] Rolling 상태 저장 실패 (게임은 계속 진행):', err.message));
    }

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 100);
  };

  const finalizeRoll = () => {
    const die1 = Math.ceil(Math.random() * 6);
    const die2 = Math.ceil(Math.random() * 6);
    performMove(die1, die2);
  };

  const handleManualRoll = (total: number) => {
    const die1 = Math.floor(total / 2);
    const die2 = total - die1;
    performMove(die1, die2);
  };

  const performMove = (die1: number, die2: number) => {
    setDiceValue([die1, die2]);
    setIsRolling(false);
    setGamePhase(GamePhase.Moving);

    // 로컬 작업 완료 - Firebase 동기화 다시 허용
    localOperationInProgress.current = false;
    localOperationTimestamp.current = Date.now();

    if (!currentTeam) return;

    // Firebase에 주사위 결과와 Moving 상태 저장 (실패해도 로컬 게임은 계속 진행)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      firestoreService.updateGameState(currentSessionId, {
        sessionId: currentSessionId,
        phase: GamePhase.Moving,
        currentTeamIndex: currentTurnIndex,
        currentTurn: 0,
        diceValue: [die1, die2],
        currentCard: null,
        selectedChoice: null,
        reasoning: '',
        aiResult: null,
        isSubmitted: false,
        isAiProcessing: false,
        gameLogs: gameLogsRef.current,
        lastUpdated: Date.now()
      }).catch(err => console.warn('[Firebase] Moving 상태 저장 실패 (게임은 계속 진행):', err.message));
    }

    // 주사위 로그는 리포트에 불필요하므로 제거
    moveTeamLogic(currentTeam, die1 + die2);
  };

  const moveTeamLogic = (teamToMove: Team, steps: number) => {
    setGamePhase(GamePhase.Moving);
    let newPos = teamToMove.position + steps;
    let passedStart = false;

    if (newPos >= BOARD_SIZE) {
      newPos = newPos % BOARD_SIZE;
      passedStart = true;
    }

    if (currentSession) {
        const updatedTeams = currentSession.teams.map(t => {
            if (t.id === teamToMove.id) {
                let newResources = { ...t.resources };
                if (passedStart) {
                    newResources.capital += 20; // Salary
                }
                return { ...t, position: newPos, resources: newResources };
            }
            return t;
        });
        updateTeamsInSession(updatedTeams);
    }
    
    setTimeout(() => {
        const updatedTeam = { ...teamToMove, position: newPos };
        handleLandOnSquare(updatedTeam, newPos);
    }, 1000);
  };

  // --- 팀 입력 저장 (AI 호출 없이) ---

  const handleTeamSaveOnly = async () => {
    if (!currentTeam || !activeCard) return;
    if (isSaving || isTeamSaved) return;

    const isOpenEnded = !activeCard.choices || activeCard.choices.length === 0;
    if (isOpenEnded && !sharedReasoning) return;
    if (!isOpenEnded && (!sharedSelectedChoice || !sharedReasoning)) return;

    setIsSaving(true);

    // Firebase에 팀 입력 저장 (AI 결과 없이)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: gamePhase,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: activeCard,
          selectedChoice: sharedSelectedChoice,
          reasoning: sharedReasoning,
          aiResult: null,
          isSubmitted: true,      // 팀이 저장 완료
          isAiProcessing: false,  // AI는 아직 실행 안됨
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 팀 입력 저장 실패:', err);
        setIsSaving(false);
        return;
      }
    }

    setIsTeamSaved(true);
    setIsSaving(false);
  };

  // --- 관리자용 AI 평가 실행 ---

  const handleAdminAISubmit = async () => {
    if (!currentTeam || !activeCard) return;
    if (isAiProcessing) return;
    if (!isTeamSaved) return;  // 팀이 먼저 저장해야 함

    const isOpenEnded = !activeCard.choices || activeCard.choices.length === 0;

    setIsAiProcessing(true);

    // 역량명 가져오기
    const competencyName = getCompetencyName(activeCard.competency);

    // 리포트용 구조화된 로그 기록 (역량/상황/선택/이유 포함)
    addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    addLog(`📋 [${currentTeam.name}] ${activeCard.title}`);
    addLog(`🎯 [역량] ${competencyName}`);
    addLog(`📖 [상황] ${activeCard.situation}`);
    if (!isOpenEnded && sharedSelectedChoice) {
      addLog(`✅ [선택] ${sharedSelectedChoice.text}`);
    }
    addLog(`💭 [이유] ${sharedReasoning}`);

    if (!process.env.API_KEY) {
       alert("API Key가 설정되지 않았습니다. Vercel 환경변수에 VITE_GEMINI_API_KEY를 설정해주세요.");
       setIsAiProcessing(false);
       return;
    }

    try {
      const prompt = `
        Role: Strict, insightful, financially savvy Leadership Assessor.
        Context:
        - Card Type: "${activeCard.type}"
        - Scenario: "${activeCard.situation}"
        - Learning Point: "${activeCard.learningPoint}"
        ${isOpenEnded 
          ? `- User Open-Ended Answer: "${sharedReasoning}"` 
          : `- User Choice: "${sharedSelectedChoice?.text}" \n- User Reasoning: "${sharedReasoning}"`
        }
        
        Evaluation Rules:
        1. IF Card Type is 'Event' (Chance/Golden Key):
           - ALL outcomes MUST be POSITIVE scores. Award HIGHER positive scores for logical/strategic reasoning.

        2. IF Card Type is 'Burnout':
           - ALL outcomes MUST be NEGATIVE scores. Award SMALLER penalties for good damage control.

        3. IF Card Type is 'Challenge' (Open-Ended Innovation):
           - Evaluate the creativity, feasibility, and strategic alignment of the user's answer.
           - High Quality Answer: Award substantial Competency and Insight.
           - Low Quality Answer: No change or slight deduction in Insight.

        4. IF Card Type is 'CoreValue' (Dilemma):
           - Evaluate how well the choice aligns with the value described in the choice text.
           - Ensure reasoning reflects the chosen value.
        
        5. General:
           - Deduct Capital if spending is mentioned.
        
        Output JSON:
        - feedback: Detailed paragraph (Korean).
        - scores: { capital, energy, trust, competency, insight } (integers)
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: { type: Type.STRING },
              scores: {
                type: Type.OBJECT,
                properties: {
                  capital: { type: Type.INTEGER },
                  energy: { type: Type.INTEGER },
                  trust: { type: Type.INTEGER },
                  competency: { type: Type.INTEGER },
                  insight: { type: Type.INTEGER },
                }
              }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const result: AIEvaluationResult = {
        feedback: parsed.feedback,
        scoreChanges: parsed.scores
      };

      setAiEvaluationResult(result);
      setIsAiProcessing(false);

      // AI 결과는 관리자만 로컬에서 확인 (Firebase에 저장하지 않음)
      // ACCEPT & CONTINUE 시 점수가 적용되고 로그에 기록됨

      // 리포트용 AI 평가 결과 로그
      const scores = result.scoreChanges;
      addLog(`🤖 [AI 분석] ${result.feedback}`);
      addLog(`📊 [점수변화] 자본:${scores.capital || 0} | 에너지:${scores.energy || 0} | 신뢰:${scores.trust || 0} | 역량:${scores.competency || 0} | 통찰:${scores.insight || 0}`);
      addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    } catch (e) {
      console.error(e);
      alert("AI 오류가 발생했습니다. 다시 시도해주세요.");
      setIsAiProcessing(false);
    }
  };

  const handleApplyResult = async () => {
    if (!currentSession || !aiEvaluationResult || !currentTeam || !activeCard) {
      // 조건 미충족 시에도 다음 턴으로 넘어감
      nextTurn();
      return;
    }

    // 1. 팀 리소스, 히스토리, 멤버 인덱스를 한 번에 업데이트 (Race Condition 방지)
    const turnRecord: TurnRecord = {
      turnNumber: currentSession.teams[currentTurnIndex].history.length + 1,
      cardId: activeCard.id,
      cardTitle: activeCard.title,
      situation: activeCard.situation,
      choiceId: sharedSelectedChoice?.id || 'OPEN',
      choiceText: sharedSelectedChoice?.text || 'Free Text Input',
      reasoning: sharedReasoning,
      aiFeedback: aiEvaluationResult.feedback,
      scoreChanges: aiEvaluationResult.scoreChanges,
      timestamp: Date.now()
    };

    const scoreChanges = aiEvaluationResult.scoreChanges;
    const updatedTeams = currentSession.teams.map((team, idx) => {
      // 현재 팀: 점수와 히스토리 업데이트 + 멤버 인덱스 회전
      if (team.id === currentTeam.id) {
        const newResources = { ...team.resources };
        if (scoreChanges.capital !== undefined) newResources.capital += scoreChanges.capital;
        if (scoreChanges.energy !== undefined) newResources.energy += scoreChanges.energy;
        if (scoreChanges.reputation !== undefined) newResources.reputation += scoreChanges.reputation;
        if (scoreChanges.trust !== undefined) newResources.trust += scoreChanges.trust;
        if (scoreChanges.competency !== undefined) newResources.competency += scoreChanges.competency;
        if (scoreChanges.insight !== undefined) newResources.insight += scoreChanges.insight;

        // 멤버 인덱스 회전 (팀원이 있는 경우)
        const nextMemberIndex = team.members.length > 0
          ? (team.currentMemberIndex + 1) % team.members.length
          : 0;

        return {
          ...team,
          resources: newResources,
          history: [...team.history, turnRecord],
          currentMemberIndex: nextMemberIndex
        };
      }
      return team;
    });

    // Firebase에 팀 업데이트 저장 (await로 완료 대기)
    await updateTeamsInSession(updatedTeams);

    addLog(`[턴완료] ${currentTeam.name} 턴 종료 - 점수 적용됨`);
    addLog(`---`); // 턴 구분선

    // 2. 로컬 상태 초기화 (nextTurn 대신 직접 처리 - 팀 덮어쓰기 방지)
    setShowCardModal(false);
    setActiveCard(null);
    setSharedSelectedChoice(null);
    setSharedReasoning('');
    setAiEvaluationResult(null);
    setIsAiProcessing(false);
    setIsTeamSaved(false);
    setIsSaving(false);
    setGamePhase(GamePhase.Idle);
    setTurnTimeLeft(120);

    const nextTeamIndex = (currentTurnIndex + 1) % currentSession.teams.length;

    // 3. Firebase에 Idle 상태 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Idle,
          currentTeamIndex: nextTeamIndex,
          currentTurn: 0,
          diceValue: [1, 1],
          currentCard: null,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 턴 종료 상태 저장 실패:', err);
      }
    }

    // 4. 다음 팀으로 전환 (nextTurn 호출 없이 직접 업데이트)
    setCurrentTurnIndex(nextTeamIndex);
  };

  const handleBoardSquareClick = (index: number) => {
    const square = BOARD_SQUARES.find(s => s.index === index);
    if (!square) return;

    // 세션 모드에 맞는 카드 타입 결정
    const sessionCardType = getCardTypeFromVersion(currentSession?.version);

    let cardToPreview: GameCard | undefined;

    // Helper to find card (City는 정확한 매칭, 나머지는 랜덤)
    const findCard = (filter: (c: GameCard) => boolean) => {
      const candidates = SAMPLE_CARDS.filter(filter);
      return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : undefined;
    };

    switch (square.type) {
      case SquareType.City:
        // 미리보기: 세션 모드와 칸의 역량에 맞는 특정 카드 표시
        // 예: Leader 세션 + time-management 칸 → LEAD-TM-001 카드
        cardToPreview = SAMPLE_CARDS.find(c => c.type === sessionCardType && c.competency === square.competency);
        break;
      case SquareType.GoldenKey:
        // Exclude ventures, keep general events or chance
        cardToPreview = findCard(c => c.type === 'Event' && !c.title.includes('사내 벤처'));
        break;
      case SquareType.Fund:
        // Specifically look for Internal Venture cards
        cardToPreview = findCard(c => c.title.includes('사내 벤처'));
        break;
      case SquareType.Space:
        cardToPreview = findCard(c => c.type === 'Challenge');
        break;
      case SquareType.WorldTour:
        cardToPreview = findCard(c => c.type === 'CoreValue');
        break;
      case SquareType.Island:
        cardToPreview = findCard(c => c.type === 'Burnout');
        break;
    }

    if (cardToPreview) {
      // 미리보기 상태 초기화
      setPreviewSelectedChoice(null);
      setPreviewReasoning('');
      setPreviewAiResult(null);
      setIsPreviewProcessing(false);
      setPreviewCard(cardToPreview);
    }
  };

  // --- 미리보기 카드 AI 평가 (게임에 반영 안됨) ---
  const handlePreviewSubmit = async () => {
    if (!previewCard) return;
    if (isPreviewProcessing) return;

    const isOpenEnded = !previewCard.choices || previewCard.choices.length === 0;
    if (isOpenEnded && !previewReasoning) return;
    if (!isOpenEnded && (!previewSelectedChoice || !previewReasoning)) return;

    setIsPreviewProcessing(true);

    if (!process.env.API_KEY) {
      alert("API Key가 설정되지 않았습니다.");
      setIsPreviewProcessing(false);
      return;
    }

    try {
      const prompt = `
        Role: Strict, insightful, financially savvy Leadership Assessor.
        Context:
        - Card Type: "${previewCard.type}"
        - Scenario: "${previewCard.situation}"
        - Learning Point: "${previewCard.learningPoint}"
        ${isOpenEnded
          ? `- User Open-Ended Answer: "${previewReasoning}"`
          : `- User Choice: "${previewSelectedChoice?.text}" \n- User Reasoning: "${previewReasoning}"`
        }

        Evaluation Rules:
        1. IF Card Type is 'Event' (Chance/Golden Key):
           - ALL outcomes MUST be POSITIVE scores. Award HIGHER positive scores for logical/strategic reasoning.

        2. IF Card Type is 'Burnout':
           - ALL outcomes MUST be NEGATIVE scores. Award SMALLER penalties for good damage control.

        3. IF Card Type is 'Challenge' (Open-Ended Innovation):
           - Evaluate the creativity, feasibility, and strategic alignment of the user's answer.
           - High Quality Answer: Award substantial Competency and Insight.
           - Low Quality Answer: No change or slight deduction in Insight.

        4. IF Card Type is 'CoreValue' (Dilemma):
           - Evaluate how well the choice aligns with the value described in the choice text.
           - Ensure reasoning reflects the chosen value.

        5. General:
           - Deduct Capital if spending is mentioned.

        Output JSON:
        - feedback: Detailed paragraph (Korean).
        - scores: { capital, energy, trust, competency, insight } (integers)
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: { type: Type.STRING },
              scores: {
                type: Type.OBJECT,
                properties: {
                  capital: { type: Type.INTEGER },
                  energy: { type: Type.INTEGER },
                  trust: { type: Type.INTEGER },
                  competency: { type: Type.INTEGER },
                  insight: { type: Type.INTEGER },
                }
              }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const result: AIEvaluationResult = {
        feedback: parsed.feedback,
        scoreChanges: parsed.scores
      };

      setPreviewAiResult(result);
    } catch (e) {
      console.error(e);
      alert("AI 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsPreviewProcessing(false);
    }
  };

  // 미리보기 모달 닫기 핸들러
  const handleClosePreview = () => {
    setPreviewCard(null);
    setPreviewSelectedChoice(null);
    setPreviewReasoning('');
    setPreviewAiResult(null);
    setIsPreviewProcessing(false);
  };

  // --- Views ---

  if (view === 'intro') {
    return (
      <Intro
        onAdminLogin={() => setView('lobby')}
        onUserJoin={handleUserJoin}
        initialAccessCode={initialAccessCode}
        isLoading={isJoining}
        joinError={joinError}
      />
    );
  }

  if (view === 'lobby') {
    return (
      <Lobby
        sessions={sessions}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        onUpdateStatus={handleUpdateSessionStatus}
        onEnterSession={handleEnterSession}
      />
    );
  }

  // --- 참가자 뷰 ---
  if (view === 'participant') {
    const participantSession = currentSession;
    const participantTeam = participantSession?.teams.find(t => t.id === participantTeamId);

    // 세션 로딩 중 (localStorage에서 복구됐지만 Firebase에서 아직 로드 안됨)
    if (isJoinedTeam && participantTeamId && !participantSession) {
      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8 text-center">
            <h1 className="text-2xl font-black mb-4">게임 로딩 중...</h1>
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">잠시만 기다려주세요</p>
            <button
              onClick={() => {
                localStorage.removeItem('bluemarble_participant_session');
                setView('intro');
                setCurrentSessionId(null);
                setParticipantTeamId(null);
                setIsJoinedTeam(false);
              }}
              className="mt-4 text-sm text-gray-400 underline"
            >
              처음부터 다시 시작
            </button>
          </div>
        </div>
      );
    }

    // 팀 선택 화면
    if (!participantTeamId) {
      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8">
            <h1 className="text-2xl font-black text-center mb-2">
              {participantSession?.name || '게임'}
            </h1>
            <p className="text-center text-gray-500 font-bold mb-6">
              참여할 팀을 선택하세요
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {participantSession?.teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className="p-4 border-4 border-black font-black text-lg hover:bg-yellow-400 transition-colors flex flex-col items-center gap-2"
                >
                  <div className={`w-8 h-8 rounded-full bg-${team.color.toLowerCase()}-500 border-2 border-black`}></div>
                  <span>{team.name}</span>
                  {team.members.length > 0 && (
                    <span className="text-xs font-normal text-gray-500">
                      ({team.members.map(m => m.name).join(', ')})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('bluemarble_participant_session');
                setView('intro');
                setCurrentSessionId(null);
                setParticipantTeamId(null);
                setIsJoinedTeam(false);
              }}
              className="w-full py-3 bg-gray-200 border-4 border-black font-bold"
            >
              나가기
            </button>
          </div>
        </div>
      );
    }

    // 이름 입력 화면 (팀 선택 후, 참여 전)
    if (participantTeamId && !isJoinedTeam) {
      const selectedTeam = participantSession?.teams.find(t => t.id === participantTeamId);

      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8">
            <h1 className="text-2xl font-black text-center mb-2">
              {selectedTeam?.name} 참여
            </h1>
            <p className="text-center text-gray-500 font-bold mb-6">
              이름을 입력해주세요
            </p>

            {/* 현재 팀원 표시 */}
            {selectedTeam && selectedTeam.members.length > 0 && (
              <div className="mb-4 p-3 bg-gray-100 border-2 border-black">
                <p className="text-xs font-bold text-gray-500 mb-1">현재 참여 중인 팀원:</p>
                <p className="font-bold">{selectedTeam.members.map(m => m.name).join(', ')}</p>
              </div>
            )}

            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="이름 입력"
              className="w-full p-4 border-4 border-black text-lg font-bold mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nameInput.trim()) {
                  handleJoinTeam(participantTeamId, nameInput);
                }
              }}
            />

            <button
              onClick={() => handleJoinTeam(participantTeamId, nameInput)}
              disabled={!nameInput.trim()}
              className="w-full py-4 bg-blue-500 text-white border-4 border-black font-black text-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
            >
              참여하기
            </button>

            <button
              onClick={() => { setParticipantTeamId(null); setNameInput(''); }}
              className="w-full py-3 bg-gray-200 border-4 border-black font-bold"
            >
              다른 팀 선택
            </button>
          </div>
        </div>
      );
    }

    // 팀이 없으면 (세션에서 팀이 삭제된 경우) 처리
    if (!participantTeam) {
      return (
        <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8 text-center">
            <h1 className="text-2xl font-black mb-4">팀을 찾을 수 없습니다</h1>
            <p className="text-gray-500 mb-4">세션이 변경되었을 수 있습니다.</p>
            <button
              onClick={() => {
                localStorage.removeItem('bluemarble_participant_session');
                setParticipantTeamId(null);
                setIsJoinedTeam(false);
              }}
              className="w-full py-3 bg-blue-500 text-white border-4 border-black font-bold"
            >
              다시 팀 선택하기
            </button>
          </div>
        </div>
      );
    }

    // 팀 게임 화면
    const isMyTurn = participantSession?.teams[currentTurnIndex]?.id === participantTeamId;
    const activeTeamForViewer = participantSession?.teams[currentTurnIndex];

    // 참가자 로그아웃 핸들러
    const handleParticipantLogout = () => {
      localStorage.removeItem('bluemarble_participant_session');
      setCurrentSessionId(null);
      setParticipantTeamId(null);
      setParticipantName('');
      setIsJoinedTeam(false);
      setNameInput('');
      setView('intro');
    };

    return (
      <div className="min-h-screen bg-gray-900">
        <MobileTeamView
          team={participantTeam}
          activeTeamName={participantSession?.teams[currentTurnIndex]?.name || ''}
          isMyTurn={isMyTurn}
          gamePhase={gamePhase}
          onRollDice={handleRollDice}
          onLogout={handleParticipantLogout}
          activeCard={activeCard}
          activeInput={{
            choice: sharedSelectedChoice,
            reasoning: sharedReasoning
          }}
          onInputChange={(choice, reason) => {
            setSharedSelectedChoice(choice);
            setSharedReasoning(reason);
          }}
          onSubmit={handleTeamSaveOnly}
          isTeamSaved={isTeamSaved}
          isSaving={isSaving}
        />

        {/* 다른 팀 턴 뷰어 모드: 현재 진행 중인 카드가 있고 내 턴이 아니면 읽기 전용 모달 표시 */}
        {!isMyTurn && activeCard && gamePhase === GamePhase.Decision && (
          <CardModal
            card={activeCard}
            visible={true}
            timeLeft={turnTimeLeft}
            selectedChoice={sharedSelectedChoice}
            reasoning={sharedReasoning}
            onSelectionChange={() => {}} // 읽기 전용
            onReasoningChange={() => {}} // 읽기 전용
            onSubmit={async () => {}} // 읽기 전용
            result={aiEvaluationResult}
            isProcessing={isAiProcessing}
            readOnly={true}
            teamName={activeTeamForViewer?.name}
          />
        )}
      </div>
    );
  }

  // --- Game View ---
  const monitoredTeam = teams.find(t => t.id === monitoringTeamId);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 p-2 md:p-6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 bg-white border-4 border-black p-2 shadow-sm">
         <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2 md:mb-0">
           <button 
             onClick={() => { if(window.confirm("Exit?")) { setView('lobby'); setCurrentSessionId(null); } }}
             className="text-sm font-bold underline text-gray-500 hover:text-black"
           >
             ← Dashboard
           </button>
           <h1 className="text-xl font-black italic">{currentSession?.name}</h1>
           <span className="bg-yellow-400 px-2 py-0.5 text-xs font-bold border border-black">{currentSession?.version} Mode</span>
         </div>
         
         <div className="flex gap-2">
            <button
              onClick={() => setAdminViewMode('dashboard')}
              className={`px-4 py-2 border-2 border-black font-bold flex items-center gap-2 ${adminViewMode === 'dashboard' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            >
              <Monitor size={18} /> Board
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 border-2 border-black font-bold flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500"
              title="참가자 초대 QR/링크"
            >
              <QrCode size={18} /> 초대
            </button>
            <div className="flex border-2 border-black bg-gray-100 overflow-x-auto max-w-[200px] md:max-w-none">
               {teams.map((t) => (
                 <button
                   key={t.id}
                   onClick={() => { setAdminViewMode('mobile_monitor'); setMonitoringTeamId(t.id); }}
                   className={`px-3 py-1 text-sm font-bold border-r border-black last:border-r-0 hover:bg-white whitespace-nowrap ${adminViewMode === 'mobile_monitor' && monitoringTeamId === t.id ? `bg-${t.color.toLowerCase()}-200` : ''}`}
                 >
                   {t.name}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Content */}
      {adminViewMode === 'dashboard' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
          <div className="lg:col-span-2 order-2 lg:order-1 h-full min-h-0 overflow-y-auto">
             {currentTeam && (
               <ControlPanel 
                  currentTeam={currentTeam}
                  phase={gamePhase}
                  diceValue={diceValue}
                  rolling={isRolling}
                  onRoll={handleRollDice}
                  onManualRoll={handleManualRoll}
                  onSkip={() => { addLog(`${currentTeam.name} skipped turn.`); nextTurn(); }}
                  onOpenReport={() => setShowReport(true)}
                  onReset={handleResetGame}
                  logs={gameLogs}
                />
             )}
          </div>
          <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col items-center justify-center">
            <GameBoard 
              teams={teams} 
              onSquareClick={handleBoardSquareClick} 
              gameMode={currentSession?.version || 'Leadership Simulation'} 
            />
          </div>
          <div className="lg:col-span-2 order-3 h-full min-h-0 overflow-y-auto pr-2">
            <div className="grid gap-4">
              {teams.map((team, idx) => (
                <TeamStatus key={team.id} team={team} active={idx === currentTurnIndex} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 p-8">
           <div className="text-white mb-4 font-bold flex items-center gap-2">
             <Smartphone /> Viewing {monitoredTeam?.name}'s Mobile Screen
           </div>
           {monitoredTeam && (
             <div className="w-full max-w-md h-full overflow-y-auto rounded-3xl border-8 border-gray-900 bg-black shadow-2xl">
               <MobileTeamView
                 team={monitoredTeam}
                 activeTeamName={currentTeam?.name || ''}
                 isMyTurn={currentTeam?.id === monitoredTeam.id}
                 gamePhase={gamePhase}
                 onRollDice={handleRollDice}
                 activeCard={activeCard}
                 activeInput={{
                   choice: sharedSelectedChoice,
                   reasoning: sharedReasoning
                 }}
                 onInputChange={(choice, reason) => {
                   setSharedSelectedChoice(choice);
                   setSharedReasoning(reason);
                 }}
                 onSubmit={handleTeamSaveOnly}
                 isTeamSaved={isTeamSaved}
                 isSaving={isSaving}
               />
             </div>
           )}
        </div>
      )}

      {/* Admin Modal (Controlled by Shared State) */}
      {activeCard && showCardModal && (
        <CardModal
          card={activeCard}
          visible={true}
          timeLeft={turnTimeLeft}
          // Shared State Props
          selectedChoice={sharedSelectedChoice}
          reasoning={sharedReasoning}
          onSelectionChange={setSharedSelectedChoice}
          onReasoningChange={setSharedReasoning}
          onSubmit={handleTeamSaveOnly}
          result={aiEvaluationResult}
          isProcessing={isAiProcessing}
          onClose={handleApplyResult}
          teamName={currentTeam?.name}
          // 관리자 뷰 전용 props
          isAdminView={true}
          isTeamSaved={isTeamSaved}
          onAISubmit={handleAdminAISubmit}
        />
      )}

      {previewCard && !activeCard && (
        <CardModal
           card={previewCard}
           visible={true}
           timeLeft={0}
           selectedChoice={previewSelectedChoice}
           reasoning={previewReasoning}
           onSelectionChange={setPreviewSelectedChoice}
           onReasoningChange={setPreviewReasoning}
           onSubmit={handlePreviewSubmit}
           result={previewAiResult}
           isProcessing={isPreviewProcessing}
           onClose={handleClosePreview}
           isPreviewMode={true}
        />
      )}

      {showReport && (
        <ReportView teams={teams} onClose={() => setShowReport(false)} />
      )}

      {/* Invite Modal - 참가자 초대 QR/링크 */}
      {showInviteModal && currentSession && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full border-4 border-black shadow-[10px_10px_0_0_#fff] p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 hover:bg-gray-100 p-1 rounded-full border-2 border-transparent hover:border-black transition-all"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black uppercase text-center mb-2">참가자 초대</h2>
            <p className="text-center text-gray-500 font-bold mb-6">{currentSession.name}</p>

            <div className="bg-gray-100 border-4 border-black p-8 mb-6 flex flex-col items-center justify-center">
               {/* QR 코드 */}
               <div className="bg-white p-4 border-2 border-black mb-4">
                 <QRCodeSVG
                   value={getJoinUrl(currentSession.accessCode)}
                   size={200}
                   level="H"
                   includeMargin={true}
                 />
               </div>

               <p className="font-bold text-sm text-gray-500 mb-2 uppercase">Access Code</p>
               <div className="text-5xl font-black tracking-widest font-mono bg-white border-2 border-black px-6 py-2 shadow-hard-sm">
                 {currentSession.accessCode}
               </div>
            </div>

            <div className="space-y-3">
              <button
                 className={`w-full py-3 border-4 border-black font-black uppercase shadow-hard hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 ${linkCopied ? 'bg-green-400' : 'bg-yellow-400'}`}
                 onClick={() => handleCopyLink(currentSession.accessCode)}
              >
                {linkCopied ? (
                  <><Check size={20} /> 복사 완료!</>
                ) : (
                  <><Copy size={20} /> 초대 링크 복사</>
                )}
              </button>
              <p className="text-xs text-center font-bold text-gray-500">
                참가자들에게 위 QR코드 또는 접속 코드를 공유하세요.
              </p>
              <p className="text-xs text-center font-mono text-gray-400 break-all">
                {getJoinUrl(currentSession.accessCode)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;