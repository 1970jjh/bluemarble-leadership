import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/GameBoard';
import TeamStatus from './components/TeamStatus';
import ControlPanel from './components/ControlPanel';
import CardModal from './components/CardModal';
import ReportView from './components/ReportView';
import Intro from './components/Intro';
import Lobby from './components/Lobby';
import MobileTeamView from './components/MobileTeamView';
import DiceResultOverlay from './components/DiceResultOverlay';
import CompetencyCardPreview from './components/CompetencyCardPreview';
import LapBonusPopup from './components/LapBonusPopup';
import LotteryBonusPopup from './components/LotteryBonusPopup';
import RiskCardPopup from './components/RiskCardPopup';
import TollPopup from './components/TollPopup';
import AdminDashboard from './components/AdminDashboard';
import GameRulesModal from './components/GameRulesModal';
import SimultaneousResponseView from './components/SimultaneousResponseView';
import { soundEffects } from './lib/soundEffects';
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
  TurnRecord,
  TeamResponse,
  AIComparativeResult,
  TeamRanking
} from './types';
import {
  BOARD_SQUARES,
  SAMPLE_CARDS,
  BOARD_SIZE,
  INITIAL_RESOURCES,
  INITIAL_SCORE,
  LAP_BONUS_POINTS,
  EVENT_CARDS,
  getChanceCardType,
  CHANCE_CARD_SQUARES,
  DEFAULT_AI_EVALUATION_GUIDELINES
} from './constants';
import { getSquareMultiplier, DOUBLE_SQUARES, TRIPLE_SQUARES } from './components/GameBoard';
import { Smartphone, Monitor, QrCode, X, Copy, Check, Settings, BookOpen } from 'lucide-react';
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
  const [turnVersion, setTurnVersion] = useState(0);  // 턴 버전 (증가만 함 - 동기화 충돌 방지)
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.WaitingToStart);
  const [diceValue, setDiceValue] = useState<[number, number]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [gameLogs, setGameLogs] = useState<string[]>([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState(120);
  const [showReport, setShowReport] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);  // 게임 시작 여부
  const [phaseBeforePause, setPhaseBeforePause] = useState<GamePhase>(GamePhase.Idle);  // 일시정지 전 상태

  // 3D 주사위 및 연출 관련 상태
  const [showDiceOverlay, setShowDiceOverlay] = useState(false);  // 3D 주사위 오버레이 표시
  const [pendingDice, setPendingDice] = useState<[number, number]>([1, 1]);  // 대기 중인 주사위 결과
  const [showCompetencyPreview, setShowCompetencyPreview] = useState(false);  // 역량카드 미리보기
  const [pendingSquare, setPendingSquare] = useState<any>(null);  // 도착 예정 칸
  const [showLapBonus, setShowLapBonus] = useState(false);  // 한 바퀴 완주 보너스 팝업
  const [lapBonusInfo, setLapBonusInfo] = useState<{ teamName: string; teamId: string; lapCount: number } | null>(null);  // 보너스 받을 팀 정보
    const [showLotteryBonus, setShowLotteryBonus] = useState(false);  // 복권 보너스 팝업
  const [lotteryBonusInfo, setLotteryBonusInfo] = useState<{ teamName: string; chanceCardNumber: number } | null>(null);
  const [showRiskCard, setShowRiskCard] = useState(false);  // 리스크 카드 팝업
  const [riskCardInfo, setRiskCardInfo] = useState<{ teamName: string; chanceCardNumber: number } | null>(null);
  const [isRiskCardMode, setIsRiskCardMode] = useState(false);  // 리스크 카드 상황 (모든 점수 마이너스)
  const [showTollPopup, setShowTollPopup] = useState(false);  // 통행료 팝업
  const [tollPopupInfo, setTollPopupInfo] = useState<{
    payerTeamName: string;
    payerTeamId: string;  // 🎯 지불 팀 ID
    receiverTeamName: string;
    receiverTeamId: string;  // 🎯 수령 팀 ID
    tollAmount: number;
    squareIndex: number;
    pendingTeam: Team;
    pendingNewPos: number;
  } | null>(null);

  // 커스텀 모드 특수 효과 상태
  const [customScoreMultiplier, setCustomScoreMultiplier] = useState(1);  // 커스텀 모드 점수 배수 (2배 찬스, 3배 찬스)
  const [isSharingMode, setIsSharingMode] = useState(false);  // 나눔카드 모드 (모든 팀에 동일 점수 적용)
  const [showMultiplierAlert, setShowMultiplierAlert] = useState(false);  // x2/x3 알림 팝업
  const [pendingCardAfterAlert, setPendingCardAfterAlert] = useState<GameCard | null>(null);  // 알림 후 표시할 카드

  // --- Active Card & Decision State (Shared between Admin & Mobile) ---
  const [activeCard, setActiveCard] = useState<GameCard | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [previewCard, setPreviewCard] = useState<GameCard | null>(null);
  const [currentCardSquareIndex, setCurrentCardSquareIndex] = useState<number | null>(null);  // 현재 카드가 표시된 칸 인덱스
  // 🎯 영토 설정용 칸 인덱스 ref (AI 평가 중 다른 이동이 발생해도 변경되지 않도록)
  const territorySquareIndexRef = useRef<number | null>(null);

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

  // 레거시 관람자 투표 상태 (동시 응답 시스템으로 대체됨 - 호환성 유지용)
  const [spectatorVotes, setSpectatorVotes] = useState<{ [optionId: string]: string[] }>({});
  const [mySpectatorVote, setMySpectatorVote] = useState<Choice | null>(null);

  // ============================================================
  // 동시 응답 시스템 상태 (모든 팀이 동시에 응답)
  // ============================================================
  const [allTeamResponses, setAllTeamResponses] = useState<{ [teamId: string]: TeamResponse }>({});
  const [isResponsesRevealed, setIsResponsesRevealed] = useState(false);  // 관리자가 공개 버튼 클릭했는지
  const [aiComparativeResult, setAiComparativeResult] = useState<AIComparativeResult | null>(null);
  const [isComparingTeams, setIsComparingTeams] = useState(false);  // AI 비교 분석 중

  // 영토 소유권 시스템 (최고 점수 팀이 칸 소유)
  const [territories, setTerritories] = useState<{ [squareIndex: string]: {
    ownerTeamId: string;
    ownerTeamName: string;
    ownerTeamColor: string;
    acquiredAt: number;
  } }>({});
  const TOLL_AMOUNT = 30;  // 통행료 금액

  // 관리자 대시보드 상태
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // 게임 규칙서 모달 상태
  const [showGameRules, setShowGameRules] = useState(false);

  // Ref to track local operations in progress (to prevent Firebase from overriding local state)
  const localOperationInProgress = useRef(false);
  const localOperationTimestamp = useRef(0);

  // Ref to prevent saving data that was just received from Firebase (무한 루프 방지)
  const isReceivingFromFirebase = useRef(false);
  const lastReceivedTimestamp = useRef(0);
  const saveDebounceTimer = useRef<any>(null);

  // 마지막으로 수락한 타임스탬프 추적 (오래된 데이터 거부용)
  const lastAcceptedGameStateTimestamp = useRef(0);
  const lastAcceptedSessionTimestamp = useRef(0);

  // 턴 버전 추적 (로컬에서 관리하는 최신 턴 버전)
  const localTurnVersion = useRef(0);

  // gameLogs를 ref로 관리하여 저장 시 최신 값 사용 (의존성 루프 방지)
  const gameLogsRef = useRef<string[]>([]);
  // gameLogs 변경 시 ref도 업데이트
  useEffect(() => {
    gameLogsRef.current = gameLogs;
  }, [gameLogs]);

  // isRolling을 ref로도 추적 (Firebase 동기화 시 stale closure 방지)
  const isRollingRef = useRef(false);
  useEffect(() => {
    isRollingRef.current = isRolling;
  }, [isRolling]);

  // showDiceOverlay를 ref로도 추적
  const showDiceOverlayRef = useRef(false);
  useEffect(() => {
    showDiceOverlayRef.current = showDiceOverlay;
  }, [showDiceOverlay]);

  // 🎯 롤링 중인 팀 캡처 (Firebase stale 데이터로 인한 잘못된 팀 이동 방지)
  const rollingTeamRef = useRef<Team | null>(null);

  // Helper to get current session object
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const teams = currentSession ? currentSession.teams : [];
  const currentTeam = teams[currentTurnIndex] || teams[0]; // fallback to first team

  // 세션의 커스텀 카드 가져오기 (세션별로 저장됨)
  const sessionCustomCards = currentSession?.customCards || [];

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

  // --- URL 파라미터 확인 (접속 코드 및 관리자 모드) ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    const adminMode = urlParams.get('admin');

    // ?admin=true: 관리자 모드 강제 진입 (참가자 세션 삭제)
    if (adminMode === 'true') {
      localStorage.removeItem('bluemarble_participant_session');
      setCurrentSessionId(null);
      setParticipantTeamId(null);
      setParticipantName('');
      setIsJoinedTeam(false);
      setView('intro');
      // URL에서 admin 파라미터 제거 (새로고침 시 반복 방지)
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('admin');
      window.history.replaceState({}, '', newUrl.toString());
    }

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
        // 현재 세션이 있으면 항상 보호 로직 적용
        if (currentSessionId) {
          // 로컬 작업 진행 중이면 현재 세션 데이터는 보호
          if (localOperationInProgress.current) {
            console.log('[All Sessions] 로컬 작업 진행 중 - 현재 세션 보호');
            setSessions(prev => {
              const currentSession = prev.find(s => s.id === currentSessionId);
              const otherSessions = firebaseSessions.filter(s => s.id !== currentSessionId);
              return currentSession
                ? [...otherSessions, currentSession]
                : firebaseSessions;
            });
            return;
          }

          // Firebase에서 받은 현재 세션의 lastUpdated가 로컬 타임스탬프보다 이전이면 보호
          const firebaseCurrentSession = firebaseSessions.find(s => s.id === currentSessionId);
          if (firebaseCurrentSession?.lastUpdated &&
              firebaseCurrentSession.lastUpdated < localOperationTimestamp.current) {
            console.log('[All Sessions] 오래된 현재 세션 데이터 보호:', {
              firebaseLastUpdated: firebaseCurrentSession.lastUpdated,
              localTimestamp: localOperationTimestamp.current
            });
            setSessions(prev => {
              const currentSession = prev.find(s => s.id === currentSessionId);
              const otherSessions = firebaseSessions.filter(s => s.id !== currentSessionId);
              return currentSession
                ? [...otherSessions, currentSession]
                : firebaseSessions;
            });
            return;
          }
        }

        console.log('[All Sessions] 전체 세션 목록 수신:', firebaseSessions.map(s => ({
          id: s.id,
          name: s.name,
          hasCustomCards: !!s.customCards,
          customCardsCount: s.customCards?.length || 0
        })));
        setSessions(firebaseSessions);
      });
      return () => unsubscribe();
    }
  }, [currentSessionId]);

  // --- Firebase: 현재 세션 실시간 구독 (참가자/관리자 동기화) ---
  useEffect(() => {
    if (!currentSessionId) return;

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!isFirebaseConfigured) return;

    console.log('[Session Subscribe] 세션 구독 시작:', currentSessionId);

    const unsubscribe = firestoreService.subscribeToSession(currentSessionId, (session) => {
      if (session) {
        const sessionTimestamp = session.lastUpdated || 0;

        // === 1단계: 로컬 작업 진행 중 보호 ===
        if (localOperationInProgress.current) {
          console.log('[Session Subscribe] 로컬 작업 진행 중 - 세션 업데이트 스킵');
          return;
        }

        // === 2단계: 타임스탬프 기반 오래된 데이터 거부 ===
        if (sessionTimestamp <= lastAcceptedSessionTimestamp.current) {
          console.log('[Session Subscribe] 오래된/중복 세션 데이터 무시:', {
            received: sessionTimestamp,
            lastAccepted: lastAcceptedSessionTimestamp.current
          });
          return;
        }

        // === 3단계: 로컬 작업 직후 보호 (5초) ===
        const timeSinceLocalOp = Date.now() - localOperationTimestamp.current;
        if (timeSinceLocalOp < 5000 && sessionTimestamp < localOperationTimestamp.current) {
          console.log('[Session Subscribe] 로컬 작업 이전 세션 데이터 무시:', {
            sessionTimestamp,
            localOpTimestamp: localOperationTimestamp.current
          });
          return;
        }

        // 타임스탬프 업데이트
        lastAcceptedSessionTimestamp.current = sessionTimestamp;

        console.log('[Session Subscribe] 세션 데이터 수신:', {
          sessionId: session.id,
          lastUpdated: session.lastUpdated,
          teamsPositions: session.teams?.map(t => ({ name: t.name, pos: t.position }))
        });
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
        const stateTimestamp = state.lastUpdated || 0;

        // === 1단계: 로컬 작업 진행 중 보호 ===
        if (localOperationInProgress.current) {
          console.log('[Firebase GameState] 로컬 작업 진행 중 - 업데이트 스킵');
          // 🎯 로컬 작업 중에는 Firebase 상태를 무시 (카드 팝업이 다시 뜨는 버그 방지)
          return;
        }

        // === 2단계: 타임스탬프 기반 오래된 데이터 거부 ===
        // lastUpdated가 없거나 마지막 수락 타임스탬프보다 이전/같으면 무시
        if (stateTimestamp <= lastAcceptedGameStateTimestamp.current) {
          console.log('[Firebase GameState] 오래된/중복 데이터 무시:', {
            received: stateTimestamp,
            lastAccepted: lastAcceptedGameStateTimestamp.current
          });
          return;
        }

        // === 3단계: 로컬 작업 직후 보호 (5초) ===
        const timeSinceLocalOp = Date.now() - localOperationTimestamp.current;
        if (timeSinceLocalOp < 5000 && stateTimestamp < localOperationTimestamp.current) {
          console.log('[Firebase GameState] 로컬 작업 이전 데이터 무시:', {
            stateTimestamp,
            localOpTimestamp: localOperationTimestamp.current
          });
          return;
        }

        // 타임스탬프 업데이트
        lastAcceptedGameStateTimestamp.current = stateTimestamp;
        lastReceivedTimestamp.current = stateTimestamp;

        // Firebase 수신 플래그 설정 (무한 루프 방지)
        isReceivingFromFirebase.current = true;

        // 정상적인 Firebase 상태 동기화
        setGamePhase(state.phase as GamePhase);

        // 턴 인덱스 동기화 - 버전이 더 높을 때만 업데이트 (엄격한 조건)
        // ⚠️ 같은 버전일 때는 무시! (Firestore가 stale 데이터를 재전송할 수 있음)
        const firebaseTurnVersion = state.turnVersion || 0;
        const firebaseTurnIndex = state.currentTeamIndex ?? 0;

        if (firebaseTurnVersion > localTurnVersion.current) {
          console.log('[Firebase] 턴 버전 업데이트:', {
            firebase: firebaseTurnVersion,
            local: localTurnVersion.current,
            newTurnIndex: firebaseTurnIndex
          });
          localTurnVersion.current = firebaseTurnVersion;
          setTurnVersion(firebaseTurnVersion);
          setCurrentTurnIndex(firebaseTurnIndex);
        } else {
          // 같거나 낮은 버전은 무시 (stale 데이터로 인한 버그 방지)
          if (firebaseTurnVersion < localTurnVersion.current) {
            console.log('[Firebase] 오래된 턴 버전 무시:', {
              firebase: firebaseTurnVersion,
              local: localTurnVersion.current
            });
          }
        }

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

        // Rolling 상태 동기화 - 이미 롤링 중이면 무시 (무한 루프 방지)
        // 새로고침 시 stale Rolling 상태는 무시 (lastUpdated가 5초 이상 지났으면 stale)
        const isStaleRollingState = state.phase === GamePhase.Rolling &&
          state.lastUpdated && (Date.now() - state.lastUpdated > 5000);

        if (!isStaleRollingState) {
          setIsRolling(state.phase === GamePhase.Rolling);
        }

        // 주사위 롤링 상태 동기화 (모바일에서 굴렸을 때 관리자 대시보드에서도 표시)
        // 조건: stale 상태 아님 + 로컬 작업 없음 + 오버레이 미표시 + 현재 롤링 중 아님
        if (state.phase === GamePhase.Rolling && !isStaleRollingState &&
            !localOperationInProgress.current && !showDiceOverlayRef.current && !isRollingRef.current) {
          // 다른 클라이언트에서 주사위를 굴린 경우 - 주사위 오버레이 표시
          setPendingDice(state.diceValue || [1, 1]);
          setShowDiceOverlay(true);
        }

        // 게임 시작 여부 동기화 (참가자가 주사위 굴릴 수 있도록)
        if (state.isGameStarted !== undefined) {
          setIsGameStarted(state.isGameStarted);
        }

        // 동시 응답 시스템 상태 동기화
        if (state.teamResponses) {
          setAllTeamResponses(state.teamResponses as unknown as { [teamId: string]: TeamResponse });
        }
        if (state.isRevealed !== undefined) {
          setIsResponsesRevealed(state.isRevealed);
        }
        if (state.aiComparativeResult) {
          setAiComparativeResult(state.aiComparativeResult as unknown as AIComparativeResult);
        }
        if (state.isAnalyzing !== undefined) {
          setIsComparingTeams(state.isAnalyzing);
        }

        // 영토 소유권 동기화 (새로고침 시에도 유지)
        if (state.territories) {
          setTerritories(state.territories as { [squareIndex: string]: {
            ownerTeamId: string;
            ownerTeamName: string;
            ownerTeamColor: string;
            acquiredAt: number;
          } });
        }

        // gameLogs는 길이가 다를 때만 업데이트 (배열 참조 비교로 인한 무한 루프 방지)
        if (state.gameLogs?.length) {
          setGameLogs(prev => {
            if (prev.length === state.gameLogs.length) {
              return prev; // 같은 길이면 기존 참조 유지
            }
            return state.gameLogs;
          });
        }

        // Idle 상태에서는 카드 관련 상태 명시적 초기화 (턴 전환 시 중요)
        if (state.phase === GamePhase.Idle) {
          setActiveCard(null);
          setShowCardModal(false);
          setSharedSelectedChoice(null);
          setSharedReasoning('');
          setIsTeamSaved(false);
          // 동시 응답 시스템 초기화
          setAllTeamResponses({});
          setIsResponsesRevealed(false);
          setAiComparativeResult(null);
          setIsComparingTeams(false);
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
        isGameStarted: isGameStarted,  // 게임 시작 여부 저장
        gameLogs: gameLogsRef.current, // ref 사용으로 의존성 루프 방지
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Firebase 게임 상태 저장 실패:', error);
    }
  }, [currentSessionId, gamePhase, currentTurnIndex, diceValue, activeCard, sharedSelectedChoice, sharedReasoning, aiEvaluationResult, isAiProcessing, isGameStarted]);

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

  // --- 세션의 customCards 변경 시 activeCard 실시간 업데이트 ---
  useEffect(() => {
    // activeCard가 있고, 세션에 customCards가 있을 때
    if (activeCard && sessionCustomCards.length > 0) {
      // 현재 activeCard의 ID로 최신 카드 찾기
      const updatedCard = sessionCustomCards.find((c: GameCard) => c.id === activeCard.id);
      if (updatedCard) {
        // 카드 내용이 변경되었는지 확인 (깊은 비교)
        const hasChanged =
          updatedCard.title !== activeCard.title ||
          updatedCard.situation !== activeCard.situation ||
          updatedCard.learningPoint !== activeCard.learningPoint ||
          JSON.stringify(updatedCard.choices) !== JSON.stringify(activeCard.choices);

        if (hasChanged) {
          console.log('[Card Sync] 카드 내용이 업데이트됨:', updatedCard.title);
          setActiveCard(updatedCard);

          // Firebase gameState의 currentCard도 업데이트
          if (currentSessionId) {
            const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
            if (isFirebaseConfigured) {
              firestoreService.updateGameState(currentSessionId, {
                currentCard: updatedCard,
                lastUpdated: Date.now()
              }).catch(err => console.error('Firebase 카드 동기화 실패:', err));
            }
          }
        }
      }
    }
  }, [sessionCustomCards, activeCard?.id, currentSessionId]);

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
        score: INITIAL_SCORE,
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
    // 턴 버전과 인덱스 초기화 (Firebase에서 동기화될 때까지 기본값)
    localTurnVersion.current = 0;
    setTurnVersion(0);
    setCurrentTurnIndex(0);
    setGamePhase(GamePhase.WaitingToStart);
    setIsGameStarted(false);
    setMonitoringTeamId(session.teams[0]?.id || null);
    setGameLogs([`Entered Session: ${session.name}`, `Status: ${session.status}`]);
    setView('game');
  };

  // 게임 시작 핸들러 (항상 1팀부터 시작)
  const handleStartGame = async () => {
    // 턴 버전 1로 시작 (게임 시작 = 첫 번째 턴)
    const newTurnVersion = 1;
    localTurnVersion.current = newTurnVersion;
    setTurnVersion(newTurnVersion);
    setCurrentTurnIndex(0);  // 항상 1팀(인덱스 0)부터 시작
    setIsGameStarted(true);
    setGamePhase(GamePhase.Idle);

    const startingTeam = teams[0];
    // 🎯 보고서용 로그만 - 일반 시스템 로그 제거
    soundEffects.playGameStart();

    // Firebase에 게임 상태 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Idle,
          currentTeamIndex: 0,  // 항상 1팀부터 시작
          turnVersion: newTurnVersion,  // 턴 버전 저장
          currentTurn: 0,
          diceValue: [1, 1],
          currentCard: null,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          isGameStarted: true,
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 게임 시작 상태 저장 실패:', err);
      }
    }
  };

  // 게임 일시정지 핸들러
  const handlePauseGame = async () => {
    setPhaseBeforePause(gamePhase);
    setGamePhase(GamePhase.Paused);
    soundEffects.playPause();

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Paused,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: activeCard,
          selectedChoice: sharedSelectedChoice,
          reasoning: sharedReasoning,
          aiResult: aiEvaluationResult,
          isSubmitted: isTeamSaved,
          isAiProcessing: isAiProcessing,
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 일시정지 상태 저장 실패:', err);
      }
    }
  };

  // 게임 재개 핸들러
  const handleResumeGame = async () => {
    setGamePhase(phaseBeforePause || GamePhase.Idle);

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: phaseBeforePause || GamePhase.Idle,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: activeCard,
          selectedChoice: sharedSelectedChoice,
          reasoning: sharedReasoning,
          aiResult: aiEvaluationResult,
          isSubmitted: isTeamSaved,
          isAiProcessing: isAiProcessing,
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 재개 상태 저장 실패:', err);
      }
    }
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

    const updateTimestamp = Date.now();

    // 로컬 작업 타임스탬프 갱신 (Firebase 구독 보호용)
    localOperationTimestamp.current = updateTimestamp;
    // 현재 타임스탬프보다 오래된 세션 데이터 거부
    lastAcceptedSessionTimestamp.current = updateTimestamp;

    // 🎯 로컬 상태 먼저 업데이트 (즉시 점수 반영)
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, teams: updatedTeams, lastUpdated: updateTimestamp };
      }
      return s;
    }));

    // Firebase에 저장 (설정되어 있으면) - lastUpdated 포함
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateSession(currentSessionId, {
          teams: updatedTeams,
          lastUpdated: updateTimestamp
        });
      } catch (error) {
        console.error('Firebase 팀 업데이트 실패:', error);
      }
    }
  };

  // 세션에 커스텀 카드 및 배경 이미지, AI 지침 저장 (세션별 맞춤형 카드)
  const updateCustomCardsInSession = async (cards: GameCard[], customBoardImage?: string, aiEvaluationGuidelines?: string) => {
    if (!currentSessionId) return;

    // Firebase는 undefined 값을 지원하지 않으므로 제거
    const cleanCard = (card: any): any => {
      const cleaned: any = {};
      Object.keys(card).forEach(key => {
        const value = card[key];
        if (value !== undefined) {
          if (Array.isArray(value)) {
            cleaned[key] = value.map(item =>
              typeof item === 'object' && item !== null ? cleanCard(item) : item
            );
          } else if (typeof value === 'object' && value !== null) {
            cleaned[key] = cleanCard(value);
          } else {
            cleaned[key] = value;
          }
        }
      });
      return cleaned;
    };

    const cleanedCards = cards.map(card => cleanCard(card));

    const updateData: { customCards: GameCard[]; customBoardImage?: string; aiEvaluationGuidelines?: string } = { customCards: cleanedCards };
    if (customBoardImage !== undefined && customBoardImage !== '') {
      updateData.customBoardImage = customBoardImage;
    }
    if (aiEvaluationGuidelines !== undefined && aiEvaluationGuidelines !== '') {
      updateData.aiEvaluationGuidelines = aiEvaluationGuidelines;
    }

    console.log('[Card Save] 카드 저장 시작:', { sessionId: currentSessionId, cardCount: cleanedCards.length });

    // Firebase에 저장 (설정되어 있으면)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateSession(currentSessionId, updateData);
        console.log('[Card Save] Firebase 저장 성공:', { cardCount: cleanedCards.length, firstCardTitle: cleanedCards[0]?.title });

        // 저장 후 즉시 확인 - 제대로 저장되었는지 검증
        const savedSession = await firestoreService.getSession(currentSessionId);
        if (savedSession?.customCards?.length !== cleanedCards.length) {
          console.error('[Card Save] 저장 확인 실패: 카드 수 불일치', {
            expected: cleanedCards.length,
            actual: savedSession?.customCards?.length
          });
          alert('카드 저장이 완료되지 않았습니다. 다시 시도해주세요.');
          return;
        }
        console.log('[Card Save] 저장 확인 완료:', { savedCardsCount: savedSession.customCards.length });
      } catch (error) {
        console.error('[Card Save] Firebase 커스텀 카드 업데이트 실패:', error);
        alert('카드 저장에 실패했습니다. 다시 시도해주세요.');
        return;
      }
    }

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, ...updateData };
      }
      return s;
    }));

    console.log('[Card Save] 로컬 상태 업데이트 완료');
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

  const nextTurn = useCallback(async () => {
    if (!currentSession) return;

    // 로컬 작업 시작 - Firebase가 이 상태를 덮어쓰지 않도록 보호
    const timestamp = Date.now();
    localOperationInProgress.current = true;
    localOperationTimestamp.current = timestamp;
    lastAcceptedGameStateTimestamp.current = timestamp;
    lastAcceptedSessionTimestamp.current = timestamp;

    // Reset Shared State
    setShowCardModal(false);
    setActiveCard(null);
    setSharedSelectedChoice(null);
    setSharedReasoning('');
    setAiEvaluationResult(null);
    setIsAiProcessing(false);
    setIsTeamSaved(false);
    setIsSaving(false);
    // 동시 응답 시스템 초기화
    setAllTeamResponses({});
    setIsResponsesRevealed(false);
    setAiComparativeResult(null);
    setIsComparingTeams(false);

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

    const nextTeamIndex = (currentTurnIndex + 1) % currentSession.teams.length;

    // 턴 버전 증가 (핵심!)
    const newTurnVersion = localTurnVersion.current + 1;
    localTurnVersion.current = newTurnVersion;
    setTurnVersion(newTurnVersion);
    setCurrentTurnIndex(nextTeamIndex);

    console.log('[NextTurn] 턴 전환:', {
      from: currentTurnIndex,
      to: nextTeamIndex,
      turnVersion: newTurnVersion
    });

    updateTeamsInSession(updatedTeams);

    // Firebase에 다음 턴 상태 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          phase: GamePhase.Idle,
          currentTeamIndex: nextTeamIndex,
          turnVersion: newTurnVersion,  // 턴 버전 저장
          currentCard: null,
          selectedChoice: null,
          reasoning: '',
          isSubmitted: false,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.warn('[Firebase] nextTurn 상태 저장 실패:', err);
      }
    }

    // 로컬 작업 완료 - Firebase 동기화 다시 허용
    localOperationInProgress.current = false;
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
      score: INITIAL_SCORE,
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
    // 동시 응답 시스템 초기화
    setAllTeamResponses({});
    setIsResponsesRevealed(false);
    setAiComparativeResult(null);
    setIsComparingTeams(false);
    setGamePhase(GamePhase.Idle);

    // 턴 버전과 인덱스 초기화
    localTurnVersion.current = 0;
    setTurnVersion(0);
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
          turnVersion: 0,  // 턴 버전 초기화
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

  const handleLandOnSquare = async (team: Team, squareIndex: number) => {
    const square = BOARD_SQUARES.find(s => s.index === squareIndex);
    if (!square) return;

    console.log(`[LandOnSquare] ${team.name} → ${squareIndex}번 칸 도착`);

    // ============================================================
    // 1단계: 이미 푼 문제인지 확인 (영토 소유권 = 누군가 풀었음)
    // ============================================================
    const territory = territories[squareIndex.toString()];

    // City 칸이고 영토 소유자가 있는 경우 = 이미 푼 문제
    if (square.type === SquareType.City && territory) {
      console.log(`[LandOnSquare] 영토 소유자: ${territory.ownerTeamName}`);

      // ===== 케이스 A: 다른 팀 소유 → 통행료 팝업 (버튼 클릭 시 지불) =====
      if (territory.ownerTeamId !== team.id && currentSession) {
        const multiplier = getSquareMultiplier(squareIndex);
        const tollAmount = TOLL_AMOUNT * multiplier;

        // 🎯 위치만 업데이트 (통행료는 버튼 클릭 시 지불)
        const updatedTeams = currentSession.teams.map(t => {
          if (t.id === team.id) {
            return { ...t, position: squareIndex };
          }
          return t;
        });
        await updateTeamsInSession(updatedTeams);

        // 통행료 팝업 표시 (버튼 클릭 시 통행료 지불)
        setTollPopupInfo({
          payerTeamName: team.name,
          payerTeamId: team.id,  // 🎯 지불 팀 ID 저장
          receiverTeamName: territory.ownerTeamName,
          receiverTeamId: territory.ownerTeamId,  // 🎯 수령 팀 ID 저장
          tollAmount: tollAmount,
          squareIndex: squareIndex,
          pendingTeam: team,
          pendingNewPos: squareIndex
        });
        setShowTollPopup(true);
        return;
      }

      // ===== 케이스 B: 자기 소유 → 통행료 없이 관리자 주사위 입력 대기 =====
      // 🎯 위치 업데이트 (캐릭터가 도착한 칸에 유지)
      if (currentSession) {
        const updatedTeams = currentSession.teams.map(t => {
          if (t.id === team.id) {
            return { ...t, position: squareIndex };
          }
          return t;
        });
        await updateTeamsInSession(updatedTeams);
      }
      setGamePhase(GamePhase.Idle);
      return;
    }

    // 커스텀 모드: 세션의 커스텀 카드 사용, 없으면 이벤트 카드 사용
    const sessionCards = currentSession?.customCards || [];
    const allCards = sessionCards.length > 0 ? sessionCards : EVENT_CARDS;

    let selectedCard: GameCard | null = null;

    // 출발 칸 처리 (보너스만 주고 넘어감)
    if (square.type === SquareType.Start) {
      updateTeamResources(team.id, { capital: 50 });
      nextTurn();
      return;
    }

    // 커스텀 모드: boardIndex로 카드 찾기 (모든 칸에서)
    if (sessionCards.length > 0) {
      const customCard = sessionCards.find((c: any) => c.boardIndex === square.index);
      selectedCard = customCard || sessionCards[0];
      console.log(`[Card Selection] City Square - Index: ${square.index}, Found: ${customCard?.title || 'fallback'}`);
    }

    if (selectedCard) {
      // x2/x3 배율 확인
      const multiplier = getSquareMultiplier(squareIndex);
      setCustomScoreMultiplier(multiplier);
      setCurrentCardSquareIndex(squareIndex);  // 현재 카드가 표시된 칸 인덱스 저장
      territorySquareIndexRef.current = squareIndex;  // 🎯 ref에도 저장 (AI 평가 중 변경 방지)
      console.log(`[Territory] 영토 칸 인덱스 설정: ${squareIndex}`);

      // 동시 응답 시스템 초기화 - 새 카드 시작
      setSharedSelectedChoice(null);
      setSharedReasoning('');
      setAiEvaluationResult(null);
      setAllTeamResponses({});
      setIsResponsesRevealed(false);
      setAiComparativeResult(null);
      setIsComparingTeams(false);

      // x2/x3 칸이면 알림 먼저 표시
      if (multiplier > 1) {
        setPendingCardAfterAlert(selectedCard);
        setShowMultiplierAlert(true);
        // Firebase 업데이트는 알림 확인 후 handleMultiplierAlertComplete에서 수행
      } else {
        // 로컬 작업 완료 - 카드 표시 전에 Firebase 동기화 다시 허용
        localOperationInProgress.current = false;

        // 일반 칸이면 바로 카드 표시
        setActiveCard(selectedCard);
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
            spectatorVotes: {},  // 관람자 투표 초기화
            gameLogs: gameLogsRef.current,
            lastUpdated: Date.now()
          }).catch(err => console.error('Firebase 상태 저장 실패:', err));
        }
      }
    } else {
      // 카드가 없으면 (예: 출발 칸 외 특수 칸) 플래그 해제
      localOperationInProgress.current = false;
    }
  };


  // 3D 주사위 롤 완료 핸들러
  const handleDiceRollComplete = () => {
    setIsRolling(false);
    setDiceValue(pendingDice);

    // 주사위 결과 음향 재생
    soundEffects.playDiceResult();
  };

  // 주사위 결과 표시 완료 핸들러 (3초 후)
  const handleDiceResultComplete = () => {
    setShowDiceOverlay(false);

    // ⚠️ 핵심 수정: 로컬에서 시작한 롤일 때만 이동 실행
    // Firebase 수신으로 표시된 오버레이는 애니메이션만 표시하고 이동 로직은 실행 안 함
    // (이동은 롤을 시작한 클라이언트에서만 처리해야 함)
    if (localOperationInProgress.current) {
      console.log('[DiceResult] 로컬 롤 완료 - 이동 실행');
      performMove(pendingDice[0], pendingDice[1]);
    } else {
      console.log('[DiceResult] Firebase 수신 롤 - 이동 스킵 (애니메이션만 표시)');
    }
  };

  const finalizeRoll = () => {
    const die1 = Math.ceil(Math.random() * 6);
    const die2 = Math.ceil(Math.random() * 6);
    performMove(die1, die2);
  };

  // 관리자 주사위 입력 (오프라인 주사위)
  const handleManualRoll = (total: number, teamIndex: number) => {
    if (isRolling || gamePhase !== GamePhase.Idle) return;

    // 선택된 팀 캡처
    const selectedTeam = teams[teamIndex];
    if (!selectedTeam) return;

    rollingTeamRef.current = selectedTeam;
    console.log('[ManualRoll] 선택된 팀:', selectedTeam.name, '(index:', teamIndex, '), 이동 칸:', total);

    // 로컬 작업 시작 - Firebase가 이 상태를 덮어쓰지 않도록 보호
    const timestamp = Date.now();
    localOperationInProgress.current = true;
    localOperationTimestamp.current = timestamp;
    lastAcceptedGameStateTimestamp.current = timestamp;
    lastAcceptedSessionTimestamp.current = timestamp;

    // 현재 턴 인덱스를 선택된 팀으로 설정
    setCurrentTurnIndex(teamIndex);

    // 주사위 값 계산 (2~12를 두 개의 주사위로 분배)
    const die1 = Math.floor(total / 2);
    const die2 = total - die1;

    performMove(die1, die2);
  };

  const performMove = (die1: number, die2: number) => {
    setDiceValue([die1, die2]);
    setIsRolling(false);
    setGamePhase(GamePhase.Moving);

    // 🎯 캡처된 팀 사용 (Firebase stale 데이터로 currentTurnIndex가 변경되어도 안전)
    const teamToMove = rollingTeamRef.current || currentTeam;
    console.log('[PerformMove] 이동할 팀:', teamToMove?.name);

    // 주의: 로컬 작업 플래그는 이동이 완전히 완료될 때까지 유지
    // (handleLandOnSquare 완료 또는 턴 전환 시점에 해제)

    if (!teamToMove) return;

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
    moveTeamLogic(teamToMove, die1 + die2);
  };

  const moveTeamLogic = (teamToMove: Team, steps: number) => {
    setGamePhase(GamePhase.Moving);
    const startPos = teamToMove.position;
    let finalPos = startPos + steps;
    let passedStart = false;

    if (finalPos >= BOARD_SIZE) {
      finalPos = finalPos % BOARD_SIZE;
      passedStart = true;
    }

    // 스타트 지점을 통과하는 스텝 번호 계산 (0-indexed)
    const stepsToStart = passedStart ? (BOARD_SIZE - startPos) : -1;

    // 한 칸씩 이동 애니메이션 (재귀적으로 처리하여 중간에 일시정지 가능)
    let currentStep = 0;

    const moveOneStep = () => {
      currentStep++;
      const previousPos = (startPos + currentStep - 1) % BOARD_SIZE;
      const intermediatePos = (startPos + currentStep) % BOARD_SIZE;

      // 이동 음향 효과
      soundEffects.playMove();

      // 팀 위치 업데이트 (중간 위치) - 최신 세션 상태 가져오기 (closure 문제 해결)
      setSessions(prevSessions => {
        const session = prevSessions.find(s => s.id === currentSessionId);
        if (!session) return prevSessions;

        const updatedTeams = session.teams.map(t => {
          if (t.id === teamToMove.id) {
            return { ...t, position: intermediatePos };
          }
          return t;
        });

        // Firebase 업데이트 (비동기로 처리)
        const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        if (isFirebaseConfigured && currentSessionId) {
          firestoreService.updateTeams(currentSessionId, updatedTeams).catch(err =>
            console.warn('Firebase 위치 업데이트 실패:', err)
          );
        }

        return prevSessions.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, teams: updatedTeams };
          }
          return s;
        });
      });

      // 스타트 지점 통과 체크 (이전 위치가 31이고 현재 위치가 0인 경우)
      const justPassedStart = previousPos === BOARD_SIZE - 1 && intermediatePos === 0;

      if (justPassedStart && currentStep < steps) {
        // 스타트 지점을 통과했고 아직 이동할 칸이 남아있음 → 보너스 팝업 표시
        const newLapCount = teamToMove.lapCount + 1;

        // 🎯 보너스는 버튼 클릭 시 지급 - 팝업만 표시
        // 팝업 표시
        setLapBonusInfo({ teamName: teamToMove.name, teamId: teamToMove.id, lapCount: newLapCount });
        setShowLapBonus(true);

        // 팝업이 닫힌 후 나머지 이동 계속 (handleLapBonusComplete에서 처리)
        // 남은 스텝 수를 저장
        const remainingSteps = steps - currentStep;
        pendingMoveRef.current = { teamToMove: { ...teamToMove, position: intermediatePos, lapCount: newLapCount }, remainingSteps, finalPos };
        return;
      }

      // 모든 칸 이동 완료
      if (currentStep >= steps) {
        // 마지막 칸이 정확히 스타트 지점인 경우 (finalPos === 0이고 passedStart)
        if (passedStart && finalPos === 0) {
          const newLapCount = teamToMove.lapCount + 1;

          // 🎯 보너스는 버튼 클릭 시 지급 - 팝업만 표시
          setLapBonusInfo({ teamName: teamToMove.name, teamId: teamToMove.id, lapCount: newLapCount });
          setShowLapBonus(true);
          pendingMoveRef.current = { teamToMove: { ...teamToMove, position: finalPos, lapCount: newLapCount }, remainingSteps: 0, finalPos };
          return;
        }

        // 이동 완료 처리
        finishMove(teamToMove, finalPos);
        return;
      }

      // 다음 스텝 예약 (1.5초에 한 칸)
      setTimeout(moveOneStep, 1500);
    };

    // 첫 스텝 시작
    setTimeout(moveOneStep, 1500);
  };

  // 이동 완료 후 처리
  const finishMove = (teamToMove: Team, finalPos: number) => {
    // 도착 칸 정보 저장 (카드 미리보기용)
    const landingSquare = BOARD_SQUARES.find(s => s.index === finalPos);

    // 미리보기를 표시할 칸 타입 (출발 칸 제외, 모든 City 칸에서 카드 표시)
    const previewSquareTypes = [
      SquareType.City,       // 모든 카드 칸
    ];

    if (landingSquare && previewSquareTypes.includes(landingSquare.type)) {
      // 도착 후 1초 대기 후 카드 미리보기 표시
      setTimeout(() => {
        setPendingSquare(landingSquare);
        setShowCompetencyPreview(true);

        // 3초 후 자동으로 진행 (모바일에서 주사위 굴린 경우 대비)
        setTimeout(() => {
          // 아직 미리보기가 표시 중이면 자동으로 진행
          setShowCompetencyPreview(prev => {
            if (prev) {
              const updatedTeam = { ...teamToMove, position: finalPos };
              handleLandOnSquare(updatedTeam, finalPos);
              return false;
            }
            return prev;
          });
        }, 3000);
      }, 1000);
    } else {
      // 출발 칸 등은 1초 대기 후 handleLandOnSquare 호출
      setTimeout(() => {
        const updatedTeam = { ...teamToMove, position: finalPos };
        handleLandOnSquare(updatedTeam, finalPos);
      }, 1000);
    }
  };

  // 보류 중인 이동 정보 (한 바퀴 보너스 팝업 후 계속 이동하기 위함)
  const pendingMoveRef = useRef<{ teamToMove: Team; remainingSteps: number; finalPos: number } | null>(null);

  // 추가 주사위 굴리기 (이미 푼 카드 도착 시)
  const rollExtraDiceAndMove = (team: Team, fromPos: number) => {
    const extraDie1 = Math.ceil(Math.random() * 6);
    const extraDie2 = Math.ceil(Math.random() * 6);
    const extraSteps = extraDie1 + extraDie2;

    // 새 위치 계산
    let newPos = fromPos + extraSteps;
    let passedStart = false;
    if (newPos >= BOARD_SIZE) {
      newPos = newPos % BOARD_SIZE;
      passedStart = true;
    }

    // 팀 위치 업데이트
    if (currentSession) {
      const newLapCount = team.lapCount + (passedStart ? 1 : 0);

      if (passedStart) {
        // 한바퀴 보너스: 완주한 팀에게만 +60점 - score 필드 업데이트
        const updatedTeams = currentSession.teams.map(t => {
          if (t.id === team.id) {
            // 완주한 팀: +60점
            const currentScore = t.score ?? INITIAL_SCORE;
            return { ...t, position: newPos, score: currentScore + LAP_BONUS_POINTS, lapCount: newLapCount };
          }
          return t;
        });
        updateTeamsInSession(updatedTeams);
        soundEffects.playCelebration();
      } else {
        // 한바퀴 통과 없이 위치만 업데이트
        const updatedTeams = currentSession.teams.map(t => {
          if (t.id === team.id) {
            return { ...t, position: newPos };
          }
          return t;
        });
        updateTeamsInSession(updatedTeams);
      }
    }

    // 새 위치에서 다시 handleLandOnSquare 호출 (재귀)
    setTimeout(() => {
      handleLandOnSquare({ ...team, position: newPos }, newPos);
    }, 1000);
  };

  // 통행료 팝업 완료 핸들러 (버튼 클릭 시 호출)
  const handleTollPopupComplete = async () => {
    if (!tollPopupInfo || !currentSession) {
      setShowTollPopup(false);
      setTollPopupInfo(null);
      return;
    }

    const { payerTeamId, receiverTeamId, tollAmount, pendingTeam, payerTeamName, receiverTeamName } = tollPopupInfo;

    // 🎯 통행료 지불 (버튼 클릭 시에만 실행) - score 필드 업데이트
    const updatedTeams = currentSession.teams.map(t => {
      if (t.id === payerTeamId) {
        // 지불 팀: 30점 차감
        const currentScore = t.score ?? INITIAL_SCORE;
        const newScore = Math.max(0, currentScore - tollAmount);
        return { ...t, score: newScore };
      } else if (t.id === receiverTeamId) {
        // 소유권 팀: 30점 획득
        const currentScore = t.score ?? INITIAL_SCORE;
        return { ...t, score: currentScore + tollAmount };
      }
      return t;
    });

    // 즉시 점수 반영
    await updateTeamsInSession(updatedTeams);

    // 🎯 보고서용 로그: 통행료 지불 내역
    addLog(`━━━━━━ [통행료 지불] ━━━━━━`);
    addLog(`💰 ${payerTeamName} → ${receiverTeamName}: ${tollAmount}점`);
    addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    setShowTollPopup(false);
    setTollPopupInfo(null);
    setGamePhase(GamePhase.Idle);
  };

  // 한 바퀴 보너스 팝업 완료 핸들러 (버튼 클릭 시 호출)
  const handleLapBonusComplete = async () => {
    if (!lapBonusInfo || !currentSession) {
      setShowLapBonus(false);
      setLapBonusInfo(null);
      return;
    }

    const { teamId, teamName, lapCount } = lapBonusInfo;

    // 🎯 한바퀴 보너스 지급 (버튼 클릭 시에만 실행) - 완주한 팀에게만 +60점
    const updatedTeams = currentSession.teams.map(t => {
      if (t.id === teamId) {
        // 완주한 팀: +60점 + lapCount 업데이트
        const currentScore = t.score ?? INITIAL_SCORE;
        return { ...t, score: currentScore + LAP_BONUS_POINTS, lapCount: lapCount };
      }
      return t;
    });

    // 즉시 점수 반영
    await updateTeamsInSession(updatedTeams);
    soundEffects.playCelebration();

    setShowLapBonus(false);
    setLapBonusInfo(null);

    // 보류 중인 이동이 있으면 계속
    if (pendingMoveRef.current) {
      const { teamToMove, remainingSteps, finalPos } = pendingMoveRef.current;
      pendingMoveRef.current = null;

      if (remainingSteps > 0) {
        // 남은 스텝 이동 계속
        continueMove(teamToMove, remainingSteps, finalPos);
      } else {
        // 이동 완료 (스타트 지점에 정확히 도착한 경우)
        finishMove(teamToMove, finalPos);
      }
    }
  };

  // x2/x3 배율 알림 완료 핸들러
  const handleMultiplierAlertComplete = () => {
    setShowMultiplierAlert(false);

    // 로컬 작업 완료 - 카드 표시 전에 Firebase 동기화 다시 허용
    localOperationInProgress.current = false;

    // 보류 중인 카드가 있으면 표시
    if (pendingCardAfterAlert) {
      setActiveCard(pendingCardAfterAlert);
      setPendingCardAfterAlert(null);
      setGamePhase(GamePhase.Decision);
      setShowCardModal(true);

      // Firebase에 게임 상태 저장
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (isFirebaseConfigured && currentSessionId) {
        firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Decision,
          currentTeamIndex: currentTurnIndex,
          currentTurn: 0,
          diceValue: diceValue,
          currentCard: pendingCardAfterAlert,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          spectatorVotes: {},
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        }).catch(err => console.error('Firebase 상태 저장 실패:', err));
      }
    }
  };

  // 남은 스텝 계속 이동
  const continueMove = (teamToMove: Team, remainingSteps: number, finalPos: number) => {
    let currentStep = 0;
    const startPos = teamToMove.position;

    const moveOneStep = () => {
      currentStep++;
      const intermediatePos = (startPos + currentStep) % BOARD_SIZE;

      soundEffects.playMove();

      // 최신 세션 상태 가져오기 (closure 문제 해결)
      setSessions(prevSessions => {
        const session = prevSessions.find(s => s.id === currentSessionId);
        if (!session) return prevSessions;

        const updatedTeams = session.teams.map(t => {
          if (t.id === teamToMove.id) {
            return { ...t, position: intermediatePos };
          }
          return t;
        });

        // Firebase 업데이트 (비동기로 처리)
        const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        if (isFirebaseConfigured && currentSessionId) {
          firestoreService.updateTeams(currentSessionId, updatedTeams).catch(err =>
            console.warn('Firebase 위치 업데이트 실패:', err)
          );
        }

        return prevSessions.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, teams: updatedTeams };
          }
          return s;
        });
      });

      if (currentStep >= remainingSteps) {
        finishMove({ ...teamToMove, position: finalPos }, finalPos);
        return;
      }

      // 다음 스텝 예약 (1.5초에 한 칸)
      setTimeout(moveOneStep, 1500);
    };

    setTimeout(moveOneStep, 1500);
  };

  // 역량카드 미리보기 완료 핸들러
  const handleCompetencyPreviewComplete = () => {
    setShowCompetencyPreview(false);
    if (currentTeam && pendingSquare) {
      const finalPos = pendingSquare.index;
      handleLandOnSquare({ ...currentTeam, position: finalPos }, finalPos);
    }
  };

  // --- 팀 입력 저장 (AI 호출 없이) ---
  // 파라미터가 전달되면 그 값을 사용, 아니면 현재 상태값 사용

  const handleTeamSaveOnly = async (directChoice?: Choice | null, directReasoning?: string) => {
    if (!currentTeam || !activeCard) return;
    if (isSaving || isTeamSaved) return;

    // 직접 전달된 값이 있으면 사용, 없으면 현재 상태값 사용
    const choiceToSave = directChoice !== undefined ? directChoice : sharedSelectedChoice;
    const reasoningToSave = directReasoning !== undefined ? directReasoning : sharedReasoning;

    const isOpenEnded = !activeCard.choices || activeCard.choices.length === 0;
    if (isOpenEnded && !reasoningToSave) return;
    if (!isOpenEnded && (!choiceToSave || !reasoningToSave)) return;

    setIsSaving(true);

    // 직접 전달된 값으로 상태도 업데이트 (UI 동기화)
    if (directChoice !== undefined) setSharedSelectedChoice(directChoice);
    if (directReasoning !== undefined) setSharedReasoning(directReasoning);

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
          selectedChoice: choiceToSave,
          reasoning: reasoningToSave,
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

  // ============================================================
  // 동시 응답 시스템 함수들
  // ============================================================

  // 팀 응답 제출 (모든 팀이 각자 제출)
  const handleTeamSubmitResponse = async (
    teamId: string,
    teamName: string,
    selectedChoice: Choice | null,
    reasoning: string
  ) => {
    if (!currentSessionId || !activeCard) return;

    // 검증
    const isOpenEnded = !activeCard.choices || activeCard.choices.length === 0;
    if (isOpenEnded && !reasoning.trim()) {
      alert('선택 이유를 작성해주세요.');
      return;
    }
    if (!isOpenEnded && (!selectedChoice || !reasoning.trim())) {
      alert('옵션을 선택하고 선택 이유를 작성해주세요.');
      return;
    }

    const response: TeamResponse = {
      teamId,
      teamName,
      selectedChoice,
      reasoning,
      submittedAt: Date.now(),
      isSubmitted: true
    };

    // 로컬 상태 업데이트
    setAllTeamResponses(prev => ({
      ...prev,
      [teamId]: response
    }));

    // Firebase에 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateTeamResponse(currentSessionId, teamId, {
          teamId,
          teamName,
          selectedChoice,
          reasoning,
          submittedAt: Date.now(),
          isSubmitted: true
        });
        // 🎯 상세 로그 기록 (보고서용 - 선택과 이유 포함)
        addLog(`━━━━━━ [${teamName} 응답 제출] ━━━━━━`);
        if (selectedChoice) {
          addLog(`✅ [선택] ${selectedChoice.text}`);
        }
        addLog(`💭 [이유] ${reasoning}`);
        addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      } catch (err) {
        console.error('팀 응답 저장 실패:', err);
      }
    }
  };

  // 관리자: 모든 팀 응답 공개
  const handleRevealAllResponses = async () => {
    if (!currentSessionId) return;

    setIsResponsesRevealed(true);

    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.setResponsesRevealed(currentSessionId, true);
        soundEffects.playDiceResult();  // 공개 효과음
      } catch (err) {
        console.error('응답 공개 상태 저장 실패:', err);
      }
    }
  };

  // 관리자: 모든 팀 AI 비교 평가
  const handleCompareAllTeams = async () => {
    if (!currentSessionId || !activeCard || !currentSession) return;
    if (Object.keys(allTeamResponses).length === 0) {
      alert('제출된 응답이 없습니다.');
      return;
    }

    setIsComparingTeams(true);

    // Firebase에 분석 중 상태 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      await firestoreService.updateGameState(currentSessionId, {
        isAnalyzing: true
      });
    }

    try {
      // 모든 팀 응답 정리
      const teamResponsesList = Object.values(allTeamResponses);

      // 디버깅: 팀 응답 확인
      console.log('=== AI 비교 분석 시작 ===');
      console.log('allTeamResponses:', allTeamResponses);
      console.log('teamResponsesList:', teamResponsesList);

      // ===== 성의없는 답변 사전 감지 =====
      const lazyPatterns = [
        /^[ㄱ-ㅎㅏ-ㅣ\s]+$/,  // 자음/모음만
        /^[a-zA-Z]{1,5}$/,   // 짧은 영문 (예: GG, ok, hi)
        /^[ㅋㅎㅠㅜ]+$/,      // ㅋㅋㅋ, ㅎㅎㅎ, ㅠㅠ
        /^\.+$/,             // ...
        /^[0-9\s]+$/,        // 숫자만
        /^(ㅇㅇ|ㄴㄴ|ㄱㄱ|gg|ok|no|yes|네|응|아|음)$/i,  // 단답
      ];

      const isLazyAnswer = (text: string): boolean => {
        if (!text || text.trim().length < 5) return true;  // 5글자 미만
        const trimmed = text.trim();
        return lazyPatterns.some(pattern => pattern.test(trimmed));
      };

      // 각 팀의 성의도 분석
      const teamQualityInfo = teamResponsesList.map(resp => ({
        teamId: resp.teamId,
        teamName: resp.teamName,
        reasoning: resp.reasoning,
        reasoningLength: resp.reasoning?.length || 0,
        isLazy: isLazyAnswer(resp.reasoning || ''),
        qualityHint: isLazyAnswer(resp.reasoning || '')
          ? '⚠️ 성의없음 (0-20점 강제)'
          : resp.reasoning?.length < 20
            ? '⚠️ 너무 짧음 (감점 필요)'
            : '✓ 정상'
      }));

      console.log('팀별 품질 분석:', teamQualityInfo);

      // 세션별 커스텀 AI 평가 지침 사용 (없으면 기본값)
      const evaluationGuidelines = currentSession?.aiEvaluationGuidelines || DEFAULT_AI_EVALUATION_GUIDELINES;

      // Gemini AI에 비교 평가 요청 (강화된 프롬프트)
      const prompt = `
당신은 리더십 교육 게임의 **엄격한** AI 평가자입니다.
다음 상황에 대해 여러 팀의 응답을 비교 평가해주세요.

## 카드 정보
- 제목: ${activeCard.title}
- 역량: ${activeCard.competency || '일반'}
- 상황: ${activeCard.situation}
${activeCard.choices ? `- 선택지:\n${activeCard.choices.map((c, i) => `  ${c.id}. ${c.text}`).join('\n')}` : '- (개방형 질문)'}

## 팀별 응답 (품질 분석 포함)
${teamResponsesList.map((resp) => {
  const quality = teamQualityInfo.find(q => q.teamId === resp.teamId);
  return `
### ${resp.teamName} (ID: ${resp.teamId})
- 선택: ${resp.selectedChoice?.text || '(개방형 응답)'}
- 이유: "${resp.reasoning}"
- 글자수: ${resp.reasoning?.length || 0}자
- 품질: ${quality?.qualityHint || '분석 필요'}
`;
}).join('\n')}

${evaluationGuidelines}

## 🚨🚨🚨 절대 규칙 (반드시 준수!) 🚨🚨🚨

**1. 성의없는 답변 = 무조건 최하위 (0~20점)**
다음은 성의없는 답변의 예시입니다:
- "ㅋㅋㅋ", "ㅎㅎ", "ㅠㅠ", "ㅇㅇ" 등 자음/모음만
- "GG", "ok", "ㅐㅐ", "asdf" 등 무의미한 입력
- "..." , "네", "응" 등 단답
- 5글자 미만의 답변

**2. 글자수와 성의에 따른 점수 범위:**
- 5글자 미만 → 0~10점 (무조건)
- 5~15글자 → 10~30점 (매우 짧음)
- 15~30글자 → 30~50점 (짧음)
- 30~50글자 → 50~70점 (보통)
- 50글자 이상 + 논리적 → 70~100점 (우수)

**3. 긴 답변이 짧은 답변보다 항상 높아야 함!**
- 100자 논리적 답변 > 20자 답변 (무조건!)
- 성의있는 답변이 대충 쓴 답변보다 반드시 높은 점수

## 응답 형식 (JSON)
{
  "rankings": [
    {
      "teamId": "위에서 제공된 ID를 정확히 복사",
      "teamName": "팀이름",
      "rank": 1,
      "score": 100,
      "feedback": "이 팀의 응답에 대한 구체적인 피드백 (2-3문장)"
    }
  ],
  "guidance": "이 상황에서 가장 좋은 접근 방법에 대한 종합적인 가이드 (3-4문장). '이럴 땐, 이렇게...' 형식으로 시작"
}

## 점수 배점
- 팀 수에 따라 점수 차등:
  - 2팀: 1등 100점, 2등 60점
  - 3팀: 1등 100점, 2등 70점, 3등 40점
  - 4팀: 1등 100점, 2등 75점, 3등 50점, 4등 25점
- **성의 없는 답변은 무조건 0~20점 범위로 제한 (절대 규칙!)**

최종 확인:
- 짧은 답변(20자 미만)이 긴 답변(50자 이상)보다 높은 점수를 받으면 안 됩니다!
- 모든 팀에 대해 rankings 배열에 포함해야 합니다.
- teamId는 위에서 제공된 ID를 정확히 그대로 사용하세요.
`;

      const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = result.text || '';
      const parsed = JSON.parse(responseText);

      // 디버깅: AI 응답 확인
      console.log('AI 응답:', parsed);

      // teamId 매핑 수정: 팀 이름으로 매칭 시도 (AI가 ID를 정확히 복사하지 않을 경우 대비)
      let rankings = parsed.rankings.map((r: any) => {
        // 먼저 teamId로 찾기
        let teamResponse = allTeamResponses[r.teamId];
        console.log(`팀 "${r.teamName}" (ID: ${r.teamId}) - teamId로 찾기:`, teamResponse ? '성공' : '실패');

        // 못 찾으면 팀 이름으로 찾기
        if (!teamResponse) {
          const foundEntry = Object.entries(allTeamResponses).find(
            ([_, resp]) => resp.teamName === r.teamName
          );
          if (foundEntry) {
            teamResponse = foundEntry[1];
            r.teamId = foundEntry[0]; // 실제 teamId로 교체
            console.log(`팀 "${r.teamName}" - teamName으로 찾기: 성공 (새 ID: ${r.teamId})`);
          } else {
            console.log(`팀 "${r.teamName}" - teamName으로도 찾기 실패`);
          }
        }

        // ===== 성의없는 답변 점수 강제 조정 =====
        const reasoning = teamResponse?.reasoning || '';
        const reasoningLength = reasoning.trim().length;
        let adjustedScore = r.score;
        let scoreAdjusted = false;

        // 성의없는 답변 패턴 체크
        const lazyPatterns = [
          /^[ㄱ-ㅎㅏ-ㅣ\s]+$/,  // 자음/모음만
          /^[a-zA-Z]{1,5}$/,   // 짧은 영문 (예: GG, ok, hi)
          /^[ㅋㅎㅠㅜ]+$/,      // ㅋㅋㅋ, ㅎㅎㅎ, ㅠㅠ
          /^\.+$/,             // ...
          /^[0-9\s]+$/,        // 숫자만
          /^(ㅇㅇ|ㄴㄴ|ㄱㄱ|gg|ok|no|yes|네|응|아|음)$/i,  // 단답
        ];
        const isLazy = reasoningLength < 5 || lazyPatterns.some(p => p.test(reasoning.trim()));

        if (isLazy) {
          // 성의없는 답변: 0~20점으로 강제 제한
          adjustedScore = Math.min(r.score, Math.floor(Math.random() * 15) + 5); // 5~20점
          scoreAdjusted = true;
          console.log(`⚠️ ${r.teamName}: 성의없는 답변 감지! ${r.score}점 → ${adjustedScore}점`);
        } else if (reasoningLength < 15) {
          // 매우 짧은 답변: 최대 35점
          adjustedScore = Math.min(r.score, 35);
          scoreAdjusted = adjustedScore !== r.score;
        } else if (reasoningLength < 30) {
          // 짧은 답변: 최대 55점
          adjustedScore = Math.min(r.score, 55);
          scoreAdjusted = adjustedScore !== r.score;
        }

        if (scoreAdjusted) {
          console.log(`📊 ${r.teamName} 점수 조정: ${r.score}점 → ${adjustedScore}점 (글자수: ${reasoningLength})`);
        }

        return {
          teamId: r.teamId,
          teamName: r.teamName,
          rank: r.rank,
          score: adjustedScore,
          originalScore: r.score,  // 원래 AI 점수 저장
          feedback: r.feedback + (scoreAdjusted ? ` (답변 길이 ${reasoningLength}자 - 점수 조정됨)` : ''),
          selectedChoice: teamResponse?.selectedChoice || null,
          reasoning: reasoning
        };
      });

      // 점수 기준으로 순위 재정렬
      rankings.sort((a: any, b: any) => b.score - a.score);

      // 🎯 동점 방지: 같은 점수가 있으면 1점씩 차이나도록 조정
      for (let i = 1; i < rankings.length; i++) {
        if (rankings[i].score >= rankings[i - 1].score) {
          // 이전 순위보다 같거나 높으면 1점 낮게 조정
          rankings[i].score = Math.max(0, rankings[i - 1].score - 1);
        }
      }
      console.log('동점 방지 후 점수:', rankings.map((r: any) => `${r.teamName}: ${r.score}점`));

      rankings = rankings.map((r: any, idx: number) => ({ ...r, rank: idx + 1 }));

      console.log('최종 순위 (점수 조정 후):', rankings.map((r: any) => `${r.rank}. ${r.teamName}: ${r.score}점`));

      const comparativeResult: AIComparativeResult = {
        rankings,
        guidance: parsed.guidance,
        analysisTimestamp: Date.now()
      };

      setAiComparativeResult(comparativeResult);

      // Firebase에 결과 저장
      if (isFirebaseConfigured) {
        await firestoreService.saveAIComparativeResult(currentSessionId, {
          rankings: comparativeResult.rankings,
          guidance: comparativeResult.guidance,
          analysisTimestamp: comparativeResult.analysisTimestamp
        });
      }

      soundEffects.playCelebration();

    } catch (error) {
      console.error('AI 비교 평가 실패:', error);
    } finally {
      setIsComparingTeams(false);
    }
  };

  // 점수 결과 팝업 상태
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [scorePopupData, setScorePopupData] = useState<{ teamName: string; oldScore: number; addedScore: number; newScore: number; rank: number }[]>([]);

  // 관리자: 비교 평가 결과를 점수에 적용
  const handleApplyComparativeResult = async () => {
    if (!currentSessionId || !currentSession || !aiComparativeResult) return;

    // 로컬 작업 시작 - Firebase가 이 상태를 덮어쓰지 않도록 보호
    // (점수 팝업이 닫힐 때까지 유지 - handleCloseScorePopupAndNextTurn에서 해제)
    const timestamp = Date.now();
    localOperationInProgress.current = true;
    localOperationTimestamp.current = timestamp;
    // 현재 타임스탬프보다 오래된 데이터 모두 거부
    lastAcceptedGameStateTimestamp.current = timestamp;
    lastAcceptedSessionTimestamp.current = timestamp;

    const rankings = aiComparativeResult.rankings;

    // x2/x3 배율 적용 (ref 사용 - AI 평가 중 다른 이동이 발생해도 올바른 칸 기준)
    const squareForMultiplier = territorySquareIndexRef.current ?? currentCardSquareIndex;
    const multiplier = squareForMultiplier !== null ? getSquareMultiplier(squareForMultiplier) : 1;
    const multiplierText = multiplier > 1 ? ` (x${multiplier} 특수칸!)` : '';

    // 점수 변경 정보 수집 (팝업용)
    const scoreChanges: { teamName: string; oldScore: number; addedScore: number; newScore: number; rank: number }[] = [];

    // 1등 팀 찾기 (영토 소유권 부여용)
    const firstPlaceRanking = rankings.find(r => r.rank === 1);

    // 각 팀에 점수 적용 (단일 점수 체계) - teamId 또는 teamName으로 매칭
    const updatedTeams = currentSession.teams.map(team => {
      // 먼저 teamId로 찾기
      let ranking = rankings.find(r => r.teamId === team.id);

      // 못 찾으면 teamName으로 찾기 (fallback)
      if (!ranking) {
        ranking = rankings.find(r => r.teamName === team.name);
      }

      if (ranking) {
        const currentScore = team.score ?? INITIAL_SCORE;
        const appliedScore = ranking.score * multiplier;  // 배율 적용
        const newScore = currentScore + appliedScore;

        scoreChanges.push({
          teamName: team.name,
          oldScore: currentScore,
          addedScore: appliedScore,
          newScore: newScore,
          rank: ranking.rank
        });

        // 🎯 팀 히스토리 업데이트 (리포트 생성용)
        const turnRecord: TurnRecord = {
          turnNumber: team.history.length + 1,
          cardId: activeCard?.id || '',
          cardTitle: activeCard?.title || '',
          situation: activeCard?.situation || '',
          choiceId: ranking.selectedChoice?.id || 'OPEN',
          choiceText: ranking.selectedChoice?.text || '',
          reasoning: ranking.reasoning || '',
          aiFeedback: ranking.feedback || '',
          scoreChanges: { capital: appliedScore },
          timestamp: Date.now(),
          position: team.position
        };

        return { ...team, score: newScore, history: [...team.history, turnRecord] };
      }
      return team;
    });

    await updateTeamsInSession(updatedTeams);

    // 영토 소유권 설정 (1등 팀이 해당 칸 소유)
    // 🎯 ref 사용 - AI 평가 중 다른 이동이 발생해도 올바른 칸 인덱스 유지
    const territorySquareIndex = territorySquareIndexRef.current;
    console.log(`[Territory] 영토 설정 시점 - ref: ${territorySquareIndex}, state: ${currentCardSquareIndex}`);

    if (territorySquareIndex !== null && territorySquareIndex !== 0 && firstPlaceRanking) {
      const winnerTeam = currentSession.teams.find(t =>
        t.id === firstPlaceRanking.teamId || t.name === firstPlaceRanking.teamName
      );
      if (winnerTeam) {
        // 로컬 상태 업데이트
        setTerritories(prev => ({
          ...prev,
          [territorySquareIndex.toString()]: {
            ownerTeamId: winnerTeam.id,
            ownerTeamName: winnerTeam.name,
            ownerTeamColor: winnerTeam.color,
            acquiredAt: Date.now()
          }
        }));

        // Firebase에 영토 소유권 저장 (새로고침 시에도 유지되도록)
        const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        if (isFirebaseConfigured && currentSessionId) {
          firestoreService.updateTerritoryOwnership(
            currentSessionId,
            territorySquareIndex,
            winnerTeam.id,
            winnerTeam.name,
            winnerTeam.color
          ).catch(err => console.warn('Firebase 영토 소유권 저장 실패:', err));
        }

      }
    }

    // 상세 로그 기록 (리포트용)
    addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    if (activeCard) {
      addLog(`📋 [문제] ${activeCard.title}`);
      addLog(`📖 [상황] ${activeCard.situation}`);
    }

    // 각 팀별 선택, 이유, AI 피드백 기록
    rankings.forEach(r => {
      const appliedScore = r.score * multiplier;
      addLog(`---`);
      addLog(`🏆 [${r.rank}등] ${r.teamName} (+${appliedScore}점${multiplierText})`);
      if (r.selectedChoice) {
        addLog(`✅ [선택] ${r.selectedChoice.text}`);
      }
      if (r.reasoning) {
        addLog(`💭 [이유] ${r.reasoning}`);
      }
      if (r.feedback) {
        addLog(`🤖 [AI 평가] ${r.feedback}`);
      }
    });

    // Best Practice 기록
    if (aiComparativeResult.guidance) {
      addLog(`---`);
      addLog(`💡 [Best Practice] ${aiComparativeResult.guidance}`);
    }
    addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // 점수 변경 팝업 표시 (정렬: 순위별)
    setScorePopupData(scoreChanges.sort((a, b) => a.rank - b.rank));
    setShowScorePopup(true);
  };

  // 점수 팝업 닫고 다음 턴으로 전환
  const handleCloseScorePopupAndNextTurn = async () => {
    if (!currentSessionId || !currentSession) return;

    // 로컬 작업 시작 - Firebase가 이 상태를 덮어쓰지 않도록 보호
    const timestamp = Date.now();
    localOperationInProgress.current = true;
    localOperationTimestamp.current = timestamp;
    lastAcceptedGameStateTimestamp.current = timestamp;
    lastAcceptedSessionTimestamp.current = timestamp;

    setShowScorePopup(false);
    setScorePopupData([]);

    // 상태 초기화 및 다음 턴
    setShowCardModal(false);
    setActiveCard(null);
    setAllTeamResponses({});
    setIsResponsesRevealed(false);
    setAiComparativeResult(null);
    setIsComparingTeams(false);
    setGamePhase(GamePhase.Idle);
    setTurnTimeLeft(120);

    // 다음 턴으로 (턴 버전 증가!)
    const nextTeamIndex = (currentTurnIndex + 1) % currentSession.teams.length;
    const newTurnVersion = localTurnVersion.current + 1;
    localTurnVersion.current = newTurnVersion;
    setTurnVersion(newTurnVersion);
    setCurrentTurnIndex(nextTeamIndex);

    console.log('[ScorePopup → NextTurn] 턴 전환:', {
      from: currentTurnIndex,
      to: nextTeamIndex,
      turnVersion: newTurnVersion
    });

    // Firebase 업데이트
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      await firestoreService.resetTeamResponses(currentSessionId);
      await firestoreService.updateGameState(currentSessionId, {
        phase: GamePhase.Idle,
        currentTeamIndex: nextTeamIndex,
        turnVersion: newTurnVersion,  // 턴 버전 저장
        currentCard: null,
        isRevealed: false,
        aiComparativeResult: null,
        isAnalyzing: false,
        lastUpdated: Date.now()
      });
    }

    // 로컬 작업 완료 - Firebase 동기화 다시 허용
    localOperationInProgress.current = false;
  };

  // ============================================================
  // (레거시) 관람자 투표 핸들러 - 더 이상 사용하지 않음
  // ============================================================
  const handleSpectatorVote = async (choice: Choice, voterTeamName: string) => {
    if (!currentSessionId || !voterTeamName) return;

    const previousVoteId = mySpectatorVote?.id || null;

    // 같은 옵션을 다시 클릭하면 무시
    if (previousVoteId === choice.id) return;

    // 로컬 상태 업데이트
    setMySpectatorVote(choice);

    // Firebase에 투표 업데이트 (팀 이름 포함)
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.updateSpectatorVote(currentSessionId, choice.id, previousVoteId, voterTeamName);
      } catch (err) {
        console.error('관람자 투표 저장 실패:', err);
      }
    }
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
        Role: Strict, insightful, and empathetic Career and Life Coach. You are a fair but critical evaluator who analyzes choices from the PROTAGONIST'S PERSPECTIVE in the given situation - not from a manager's or leader's viewpoint. Evaluate how this decision affects the protagonist personally: their growth, well-being, relationships, and career development.

        Context:
        - Card Type: "${activeCard.type}"
        - Scenario: "${activeCard.situation}"
        - Learning Point: "${activeCard.learningPoint}"
        ${isOpenEnded
          ? `- Protagonist's Open-Ended Answer: "${sharedReasoning}"`
          : `- Protagonist's Choice: "${sharedSelectedChoice?.text}" \n- Protagonist's Reasoning: "${sharedReasoning}"`
        }

        IMPORTANT: Analyze from the PROTAGONIST'S perspective - the person facing the situation described. Consider their personal growth, work-life balance, emotional well-being, and career development.

        CRITICAL SCORING PRINCIPLES:
        **FIRST: CHECK FOR LOW-EFFORT/INSINCERE RESPONSES**
        - If the reasoning is less than 10 characters, random letters (like "asdf", "sdaf", "ㅁㄴㅇㄹ"),
          or clearly meaningless (numbers only, repeated characters, gibberish),
          IMMEDIATELY give ALL NEGATIVE scores: -5 to -10 in EVERY category.
        - Short, lazy answers like "몰라", "그냥", "ㅇㅇ", "ok", single words without explanation
          should receive -3 to -6 in every category.
        - The feedback should clearly state: "성의 없는 응답입니다. 구체적인 이유를 작성해주세요."

        1. ALWAYS identify BOTH advantages AND disadvantages/trade-offs of the choice.
        2. Score Range: Each category should be between -10 to +10.
           - +8~+10: Exceptional strategic thinking with minimal downsides
           - +4~+7: Good decision but with notable trade-offs
           - 0~+3: Average or neutral impact
           - -3~-1: Poor decision with some merit
           - -10~-4: Seriously flawed approach OR low-effort response
        3. Total score for sincere, well-reasoned answers should be POSITIVE (+8 to +20 total).
        4. Do NOT give all positive scores. Every choice has opportunity costs or potential risks - reflect them.
        5. Be specific about what could go wrong or what was sacrificed by this choice.
        6. RESPONSE QUALITY MATTERS: A good choice with poor reasoning deserves LOWER scores than a mediocre choice with excellent reasoning.

        Evaluation Rules by Card Type:
        1. IF Card Type is 'Event' (Chance/Golden Key):
           - Outcomes lean POSITIVE but still identify risks. Good reasoning gets +4~+7 per category.

        2. IF Card Type is 'Burnout':
           - Outcomes lean NEGATIVE. Good damage control reduces penalties. Poor handling: -6~-10 per category.

        3. IF Card Type is 'Challenge' (Open-Ended Innovation):
           - Evaluate creativity, feasibility, and strategic alignment.
           - High Quality: +6~+8 Competency, +4~+6 Insight. BUT identify implementation risks.
           - Low Quality: 0 or -2 in relevant categories.

        4. IF Card Type is 'CoreValue' (Dilemma):
           - Dilemmas inherently involve trade-offs. The choice MUST show both value gained AND value sacrificed.
           - If choosing efficiency over relationships: +Competency but -Trust.
           - If choosing safety over innovation: +Trust but -Insight.

        5. General (Self, Team, Leader, Follower types):
           - Identify at least ONE negative impact or risk from the choice.
           - If the choice might damage relationships, reflect in Trust.

        **MANDATORY RESOURCE & ENERGY CONSUMPTION RULE:**
        IMPORTANT: Almost ALL activities in real workplace require TIME and EFFORT.
        - Resource (capital) represents TIME investment. Most decisions require time to implement.
          → Give -1 to -5 Resource for activities that take significant time (meetings, projects, training)
          → Only give +Resource if the decision explicitly SAVES time or gains resources
        - Energy represents PHYSICAL/EMOTIONAL effort. Most decisions require energy to execute.
          → Give -1 to -5 Energy for activities requiring effort, emotional labor, or concentration
          → Only give +Energy if the decision explicitly reduces workload or provides rest
        - Be REALISTIC: A decision to "work harder", "have more meetings", "take on more responsibility"
          should ALWAYS have negative Resource and/or Energy scores, even if the outcome is positive.
        - Trade-off principle: Good decisions often sacrifice Resource/Energy for Trust, Competency, or Insight gains.

        Feedback Format (in Korean) - USE CLEAR SECTION MARKERS:
        **[장점]** What was good about the decision from the protagonist's perspective (1-2 sentences)
        **[리스크]** What could go wrong or what trade-offs exist for the protagonist (1-2 sentences)
        **[총평]** Overall assessment and learning point (1 sentence)
        **[모범답안]** Provide a model answer - what would be the ideal choice and reasoning in this situation? Be specific and actionable. (2-3 sentences)

        Output JSON:
        - feedback: Detailed paragraph with **[장점]**, **[리스크]**, **[총평]**, **[모범답안]** section markers (Korean).
        - scores: { capital, energy, trust, competency, insight } (integers between -10 and +10)
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
      addLog(`📊 [점수변화] 자원(시간):${scores.capital || 0} | 에너지:${scores.energy || 0} | 신뢰:${scores.trust || 0} | 역량:${scores.competency || 0} | 통찰:${scores.insight || 0}`);
      addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    } catch (e) {
      console.error(e);
      alert("AI 오류가 발생했습니다. 다시 시도해주세요.");
      setIsAiProcessing(false);
    }
  };

  const handleApplyResult = async () => {
    // 로컬 작업 시작 - Firebase가 이 상태를 덮어쓰지 않도록 보호
    const timestamp = Date.now();
    localOperationInProgress.current = true;
    localOperationTimestamp.current = timestamp;
    // 현재 타임스탬프보다 오래된 데이터 모두 거부
    lastAcceptedGameStateTimestamp.current = timestamp;
    lastAcceptedSessionTimestamp.current = timestamp;

    if (!currentSession || !aiEvaluationResult || !currentTeam || !activeCard) {
      // 조건 미충족 시에도 다음 턴으로 넘어감
      nextTurn();
      localOperationInProgress.current = false;
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
      timestamp: Date.now(),
      position: currentTeam.position  // 현재 위치 저장 (이미 푼 카드 체크용)
    };

    const baseScoreChanges = aiEvaluationResult.scoreChanges;

    // 리스크 카드: 모든 점수를 음수로 변환 (절대값 유지)
    const applyRiskCard = (score?: number) => {
      if (score === undefined) return undefined;
      // 양수이면 음수로 변환, 음수이면 그대로 유지
      return score > 0 ? -score : score;
    };

    // 커스텀 배수 적용 (x2, x3 특수 칸 효과)
    const customMultiplier = customScoreMultiplier > 1 ? customScoreMultiplier : 1;

    let scoreChanges = {
      capital: baseScoreChanges.capital !== undefined ? baseScoreChanges.capital * customMultiplier : undefined,
      energy: baseScoreChanges.energy !== undefined ? baseScoreChanges.energy * customMultiplier : undefined,
      reputation: baseScoreChanges.reputation !== undefined ? baseScoreChanges.reputation * customMultiplier : undefined,
      trust: baseScoreChanges.trust !== undefined ? baseScoreChanges.trust * customMultiplier : undefined,
      competency: baseScoreChanges.competency !== undefined ? baseScoreChanges.competency * customMultiplier : undefined,
      insight: baseScoreChanges.insight !== undefined ? baseScoreChanges.insight * customMultiplier : undefined,
    };

    // 리스크 카드: 모든 점수를 음수로 강제 변환
    if (isRiskCardMode) {
      scoreChanges = {
        capital: applyRiskCard(scoreChanges.capital),
        energy: applyRiskCard(scoreChanges.energy),
        reputation: applyRiskCard(scoreChanges.reputation),
        trust: applyRiskCard(scoreChanges.trust),
        competency: applyRiskCard(scoreChanges.competency),
        insight: applyRiskCard(scoreChanges.insight),
      };
    }

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
      // 나눔카드 모드: 다른 팀에도 동일한 점수 적용
      else if (isSharingMode) {
        const newResources = { ...team.resources };
        if (scoreChanges.capital !== undefined) newResources.capital += scoreChanges.capital;
        if (scoreChanges.energy !== undefined) newResources.energy += scoreChanges.energy;
        if (scoreChanges.reputation !== undefined) newResources.reputation += scoreChanges.reputation;
        if (scoreChanges.trust !== undefined) newResources.trust += scoreChanges.trust;
        if (scoreChanges.competency !== undefined) newResources.competency += scoreChanges.competency;
        if (scoreChanges.insight !== undefined) newResources.insight += scoreChanges.insight;
        return { ...team, resources: newResources };
      }
      return team;
    });

    // Firebase에 팀 업데이트 저장 (await로 완료 대기)
    await updateTeamsInSession(updatedTeams);

    // 2. 로컬 상태 초기화 (nextTurn 대신 직접 처리 - 팀 덮어쓰기 방지)
    setShowCardModal(false);
    setActiveCard(null);
    setSharedSelectedChoice(null);
    setSharedReasoning('');
    setAiEvaluationResult(null);
    setIsAiProcessing(false);
    setIsTeamSaved(false);
    setIsSaving(false);
    // 동시 응답 시스템 초기화
    setAllTeamResponses({});
    setIsResponsesRevealed(false);
    setAiComparativeResult(null);
    setIsComparingTeams(false);
    setIsRiskCardMode(false);  // 리스크 카드 모드 초기화
    setCustomScoreMultiplier(1);  // 커스텀 모드 점수 배수 초기화
    setIsSharingMode(false);  // 나눔카드 모드 초기화
    setGamePhase(GamePhase.Idle);
    setTurnTimeLeft(120);

    // 다음 턴으로 (턴 버전 증가!)
    const nextTeamIndex = (currentTurnIndex + 1) % currentSession.teams.length;
    const newTurnVersion = localTurnVersion.current + 1;
    localTurnVersion.current = newTurnVersion;
    setTurnVersion(newTurnVersion);
    setCurrentTurnIndex(nextTeamIndex);

    console.log('[ApplyResult → NextTurn] 턴 전환:', {
      from: currentTurnIndex,
      to: nextTeamIndex,
      turnVersion: newTurnVersion
    });

    // 3. Firebase에 Idle 상태 저장
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured && currentSessionId) {
      try {
        await firestoreService.updateGameState(currentSessionId, {
          sessionId: currentSessionId,
          phase: GamePhase.Idle,
          currentTeamIndex: nextTeamIndex,
          turnVersion: newTurnVersion,  // 턴 버전 저장
          currentTurn: 0,
          diceValue: [1, 1],
          currentCard: null,
          selectedChoice: null,
          reasoning: '',
          aiResult: null,
          isSubmitted: false,
          isAiProcessing: false,
          spectatorVotes: {},  // 관람자 투표 초기화
          gameLogs: gameLogsRef.current,
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Firebase 턴 종료 상태 저장 실패:', err);
      }
    }

    // 로컬 작업 완료 - Firebase 동기화 다시 허용
    localOperationInProgress.current = false;
  };

  const handleBoardSquareClick = (index: number) => {
    const square = BOARD_SQUARES.find(s => s.index === index);
    if (!square) return;

    // 커스텀 모드: 세션의 커스텀 카드 사용
    const sessionCards = currentSession?.customCards || [];
    const allCards = sessionCards.length > 0 ? sessionCards : EVENT_CARDS;

    let cardToPreview: GameCard | undefined;

    // Helper to find card by type
    const findCardByType = (type: string) => {
      const candidates = allCards.filter(c => c.type === type);
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      // EVENT_CARDS에서도 찾기
      const eventCandidates = EVENT_CARDS.filter(c => c.type === type);
      return eventCandidates.length > 0 ? eventCandidates[Math.floor(Math.random() * eventCandidates.length)] : undefined;
    };

    switch (square.type) {
      case SquareType.City:
        // boardIndex로 카드 찾기 (모든 City 칸에서 사용)
        if (sessionCards.length > 0) {
          cardToPreview = sessionCards.find((c: any) => c.boardIndex === index);
        }
        break;
      case SquareType.Start:
        // 출발 칸 - 특별한 카드 없음
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
        Role: Strict, insightful, and empathetic Career and Life Coach. You are a fair but critical evaluator who analyzes choices from the PROTAGONIST'S PERSPECTIVE in the given situation - not from a manager's or leader's viewpoint. Evaluate how this decision affects the protagonist personally: their growth, well-being, relationships, and career development.

        Context:
        - Card Type: "${previewCard.type}"
        - Scenario: "${previewCard.situation}"
        - Learning Point: "${previewCard.learningPoint}"
        ${isOpenEnded
          ? `- Protagonist's Open-Ended Answer: "${previewReasoning}"`
          : `- Protagonist's Choice: "${previewSelectedChoice?.text}" \n- Protagonist's Reasoning: "${previewReasoning}"`
        }

        IMPORTANT: Analyze from the PROTAGONIST'S perspective - the person facing the situation described. Consider their personal growth, work-life balance, emotional well-being, and career development.

        CRITICAL SCORING PRINCIPLES:
        **FIRST: CHECK FOR LOW-EFFORT/INSINCERE RESPONSES**
        - If the reasoning is less than 10 characters, random letters (like "asdf", "sdaf", "ㅁㄴㅇㄹ"),
          or clearly meaningless (numbers only, repeated characters, gibberish),
          IMMEDIATELY give ALL NEGATIVE scores: -5 to -10 in EVERY category.
        - Short, lazy answers like "몰라", "그냥", "ㅇㅇ", "ok", single words without explanation
          should receive -3 to -6 in every category.
        - The feedback should clearly state: "성의 없는 응답입니다. 구체적인 이유를 작성해주세요."

        1. ALWAYS identify BOTH advantages AND disadvantages/trade-offs of the choice.
        2. Score Range: Each category should be between -10 to +10.
           - +8~+10: Exceptional strategic thinking with minimal downsides
           - +4~+7: Good decision but with notable trade-offs
           - 0~+3: Average or neutral impact
           - -3~-1: Poor decision with some merit
           - -10~-4: Seriously flawed approach OR low-effort response
        3. Total score for sincere, well-reasoned answers should be POSITIVE (+8 to +20 total).
        4. Do NOT give all positive scores. Every choice has opportunity costs or potential risks - reflect them.
        5. Be specific about what could go wrong or what was sacrificed by this choice.
        6. RESPONSE QUALITY MATTERS: A good choice with poor reasoning deserves LOWER scores than a mediocre choice with excellent reasoning.

        Evaluation Rules by Card Type:
        1. IF Card Type is 'Event' (Chance/Golden Key):
           - Outcomes lean POSITIVE but still identify risks. Good reasoning gets +4~+7 per category.

        2. IF Card Type is 'Burnout':
           - Outcomes lean NEGATIVE. Good damage control reduces penalties. Poor handling: -6~-10 per category.

        3. IF Card Type is 'Challenge' (Open-Ended Innovation):
           - Evaluate creativity, feasibility, and strategic alignment.
           - High Quality: +6~+8 Competency, +4~+6 Insight. BUT identify implementation risks.
           - Low Quality: 0 or -2 in relevant categories.

        4. IF Card Type is 'CoreValue' (Dilemma):
           - Dilemmas inherently involve trade-offs. The choice MUST show both value gained AND value sacrificed.
           - If choosing efficiency over relationships: +Competency but -Trust.
           - If choosing safety over innovation: +Trust but -Insight.

        5. General (Self, Team, Leader, Follower types):
           - Identify at least ONE negative impact or risk from the choice.
           - If the choice might damage relationships, reflect in Trust.

        **MANDATORY RESOURCE & ENERGY CONSUMPTION RULE:**
        IMPORTANT: Almost ALL activities in real workplace require TIME and EFFORT.
        - Resource (capital) represents TIME investment. Most decisions require time to implement.
          → Give -1 to -5 Resource for activities that take significant time (meetings, projects, training)
          → Only give +Resource if the decision explicitly SAVES time or gains resources
        - Energy represents PHYSICAL/EMOTIONAL effort. Most decisions require energy to execute.
          → Give -1 to -5 Energy for activities requiring effort, emotional labor, or concentration
          → Only give +Energy if the decision explicitly reduces workload or provides rest
        - Be REALISTIC: A decision to "work harder", "have more meetings", "take on more responsibility"
          should ALWAYS have negative Resource and/or Energy scores, even if the outcome is positive.
        - Trade-off principle: Good decisions often sacrifice Resource/Energy for Trust, Competency, or Insight gains.

        Feedback Format (in Korean) - USE CLEAR SECTION MARKERS:
        **[장점]** What was good about the decision from the protagonist's perspective (1-2 sentences)
        **[리스크]** What could go wrong or what trade-offs exist for the protagonist (1-2 sentences)
        **[총평]** Overall assessment and learning point (1 sentence)
        **[모범답안]** Provide a model answer - what would be the ideal choice and reasoning in this situation? Be specific and actionable. (2-3 sentences)

        Output JSON:
        - feedback: Detailed paragraph with **[장점]**, **[리스크]**, **[총평]**, **[모범답안]** section markers (Korean).
        - scores: { capital, energy, trust, competency, insight } (integers between -10 and +10)
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
          isGameStarted={isGameStarted}
          isAiProcessing={isAiProcessing}
          teamNumber={(participantSession?.teams.findIndex(t => t.id === participantTeamId) ?? 0) + 1}
          onShowRules={() => setShowGameRules(true)}
          allTeams={participantSession?.teams || []}
        />

        {/* 게임 규칙서 모달 (참가자 화면용) */}
        <GameRulesModal
          visible={showGameRules}
          onClose={() => setShowGameRules(false)}
          gameMode={participantSession?.version || GameVersion.Custom}
        />

        {/* 동시 응답 모드: 카드가 표시되면 모든 팀이 응답 가능 */}
        {activeCard && gamePhase === GamePhase.Decision && participantTeam && (
          <SimultaneousResponseView
            card={activeCard}
            team={participantTeam}
            myResponse={allTeamResponses[participantTeam.id]}
            isRevealed={isResponsesRevealed}
            allResponses={allTeamResponses}
            allTeams={participantSession?.teams || []}
            aiResult={aiComparativeResult}
            onSubmit={(choice, reasoning) => handleTeamSubmitResponse(participantTeam.id, participantTeam.name, choice, reasoning)}
            onClose={() => {}}
            onLogout={handleParticipantLogout}
          />
        )}

        {/* 3D 주사위 오버레이 (모바일 참가자 화면용) */}
        <DiceResultOverlay
          visible={showDiceOverlay}
          dice1={pendingDice[0]}
          dice2={pendingDice[1]}
          isRolling={isRolling}
          onRollComplete={handleDiceRollComplete}
          onShowResultComplete={handleDiceResultComplete}
          isDouble={pendingDice[0] === pendingDice[1]}
        />
      </div>
    );
  }

  // --- Game View ---
  const monitoredTeam = teams.find(t => t.id === monitoringTeamId);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 p-2 md:p-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-2 bg-white border-4 border-black p-2 shadow-sm">
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
            <button
              onClick={() => setShowAdminDashboard(true)}
              className="px-4 py-2 border-2 border-black font-bold flex items-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
              title="카드 관리"
            >
              <Settings size={18} /> 카드관리
            </button>
            <button
              onClick={() => setShowGameRules(true)}
              className="px-4 py-2 border-2 border-black font-bold flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
              title="게임 규칙서"
            >
              <BookOpen size={18} /> 규칙서
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-1 h-full min-h-0">
          <div className="lg:col-span-2 order-2 lg:order-1 h-full min-h-0 overflow-y-auto">
             {currentTeam && (
               <ControlPanel
                  currentTeam={currentTeam}
                  teams={teams}
                  phase={gamePhase}
                  diceValue={diceValue}
                  rolling={isRolling}
                  onManualRoll={handleManualRoll}
                  onSkip={() => { nextTurn(); }}
                  onOpenReport={() => setShowReport(true)}
                  onReset={handleResetGame}
                  logs={gameLogs}
                  isGameStarted={isGameStarted}
                  onStartGame={handleStartGame}
                  onPauseGame={handlePauseGame}
                  onResumeGame={handleResumeGame}
                />
             )}
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center justify-start pt-1">
            <GameBoard
              teams={teams}
              onSquareClick={handleBoardSquareClick}
              gameMode={currentSession?.version || 'Leadership Simulation'}
              customBoardImage={currentSession?.customBoardImage}
              customCards={sessionCustomCards}
              territories={territories}
            />
          </div>
          <div className="lg:col-span-3 order-3 h-full min-h-0 overflow-y-auto flex flex-col items-start gap-2 pl-1">
            {/* 참가자 접속 QR 코드 */}
            {currentSession && (
              <div className="bg-white border-3 border-black p-3 shadow-hard w-full">
                <div className="text-sm font-bold text-center mb-2 text-gray-700">참가자 접속</div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <QRCodeSVG
                    value={getJoinUrl(currentSession.accessCode)}
                    size={160}
                    level="M"
                    includeMargin={false}
                  />
                  <div className="text-center">
                    <div className="text-3xl font-black text-blue-600">{currentSession.accessCode}</div>
                    <div className="text-xs text-gray-500">접속코드</div>
                  </div>
                </div>
              </div>
            )}
            {/* 팀별 점수판 */}
            <div className="flex flex-col gap-2 w-full">
              {(() => {
                // 팀별 점수 기준 순위 정렬
                const sortedByScore = [...teams].sort((a, b) => (b.score ?? INITIAL_SCORE) - (a.score ?? INITIAL_SCORE));

                return teams.map((team, idx) => {
                  const rank = sortedByScore.findIndex(t => t.id === team.id) + 1;

                  return (
                    <TeamStatus
                      key={team.id}
                      team={team}
                      active={idx === currentTurnIndex}
                      rank={rank}
                      totalTeams={teams.length}
                    />
                  );
                });
              })()}
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
                 isGameStarted={isGameStarted}
                 isAiProcessing={isAiProcessing}
                 teamNumber={(teams.findIndex(t => t.id === monitoredTeam.id) ?? 0) + 1}
                 onShowRules={() => setShowGameRules(true)}
                 allTeams={teams}
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
          isRiskCardMode={isRiskCardMode}
          scoreMultiplier={customScoreMultiplier}
          // 동시 응답 시스템 props
          allTeamResponses={allTeamResponses}
          allTeams={currentSession?.teams.map(t => ({ id: t.id, name: t.name, score: t.score ?? INITIAL_SCORE })) || []}
          isResponsesRevealed={isResponsesRevealed}
          aiComparativeResult={aiComparativeResult}
          isComparingTeams={isComparingTeams}
          onRevealResponses={handleRevealAllResponses}
          onCompareTeams={handleCompareAllTeams}
          onApplyResults={handleApplyComparativeResult}
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
        <ReportView
          teams={teams}
          onClose={() => setShowReport(false)}
          reportGenerationGuidelines={currentSession?.reportGenerationGuidelines}
        />
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

      {/* 3D 주사위 오버레이 */}
      <DiceResultOverlay
        visible={showDiceOverlay}
        dice1={pendingDice[0]}
        dice2={pendingDice[1]}
        isRolling={isRolling}
        onRollComplete={handleDiceRollComplete}
        onShowResultComplete={handleDiceResultComplete}
        isDouble={pendingDice[0] === pendingDice[1]}
      />

      {/* 역량카드 미리보기 팝업 */}
      <CompetencyCardPreview
        visible={showCompetencyPreview}
        card={activeCard || (pendingSquare && sessionCustomCards.length > 0 ?
          sessionCustomCards.find((c: GameCard) => c.boardIndex === pendingSquare.index) || sessionCustomCards[0]
          : null)}
        square={pendingSquare}
        onComplete={handleCompetencyPreviewComplete}
        duration={5000}
      />

      {/* 한 바퀴 완주 보너스 팝업 */}
      <LapBonusPopup
        visible={showLapBonus}
        teamName={lapBonusInfo?.teamName || ''}
        lapCount={lapBonusInfo?.lapCount || 1}
        bonusAmount={LAP_BONUS_POINTS}
        onPayBonus={handleLapBonusComplete}
      />

      {/* 통행료 팝업 (이미 푼 카드 도착 시) */}
      <TollPopup
        visible={showTollPopup}
        payerTeamName={tollPopupInfo?.payerTeamName || ''}
        receiverTeamName={tollPopupInfo?.receiverTeamName || ''}
        tollAmount={tollPopupInfo?.tollAmount || 0}
        squareIndex={tollPopupInfo?.squareIndex || 0}
        onPayToll={handleTollPopupComplete}
      />

      {/* x2/x3 배율 알림 팝업 */}
      {showMultiplierAlert && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-8 rounded-3xl border-8 border-black shadow-2xl text-center max-w-md">
            <div className="text-8xl mb-4 animate-bounce">
              {customScoreMultiplier === 2 ? '✨' : '🔥'}
            </div>
            <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">
              x{customScoreMultiplier} 찬스!
            </h2>
            <p className="text-xl font-bold text-white/90 mb-6">
              이번 문제의 점수가 <span className="text-yellow-200 text-2xl">{customScoreMultiplier}배</span>로 적용됩니다!
            </p>
            <button
              onClick={handleMultiplierAlertComplete}
              className="px-8 py-4 bg-white text-orange-600 font-black text-xl rounded-xl border-4 border-black hover:bg-yellow-100 transition-all shadow-hard"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 복권 보너스 팝업 (1/3/5번째 찬스카드) */}
      <LotteryBonusPopup
        visible={showLotteryBonus}
        teamName={lotteryBonusInfo?.teamName || ''}
        chanceCardNumber={lotteryBonusInfo?.chanceCardNumber || 1}
        onComplete={() => {
          setShowLotteryBonus(false);
          setLotteryBonusInfo(null);
        }}
        duration={5000}
      />

      {/* 리스크 카드 팝업 (2/4번째 찬스카드) */}
      <RiskCardPopup
        visible={showRiskCard}
        teamName={riskCardInfo?.teamName || ''}
        chanceCardNumber={riskCardInfo?.chanceCardNumber || 2}
        teams={teams}
        currentTeamId={currentTeam?.id || ''}
        onSelectTeam={(targetTeamId) => {
          setShowRiskCard(false);
          setRiskCardInfo(null);
        }}
        onSkip={() => {
          setShowRiskCard(false);
          setRiskCardInfo(null);
        }}
        duration={15000}
      />

      {/* 점수 적용 결과 팝업 */}
      {showScorePopup && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full border-4 border-black shadow-[16px_16px_0px_0px_rgba(255,255,255,0.2)] animate-in fade-in zoom-in duration-200 p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-3xl font-black uppercase text-blue-900">점수 적용 완료!</h2>
              <p className="text-gray-600 font-bold mt-2">각 팀의 점수가 업데이트되었습니다</p>
            </div>

            <div className="space-y-3 mb-8">
              {scorePopupData.map((item, index) => (
                <div
                  key={item.teamName}
                  className={`flex items-center justify-between p-4 rounded-xl border-4 ${
                    index === 0 ? 'bg-yellow-100 border-yellow-500' :
                    index === 1 ? 'bg-gray-100 border-gray-400' :
                    index === 2 ? 'bg-orange-100 border-orange-400' :
                    'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-4xl font-black ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-500' :
                      index === 2 ? 'text-orange-500' : 'text-gray-400'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${item.rank}`}
                    </span>
                    <span className="font-black text-2xl">{item.teamName}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-blue-800">{item.newScore}점</div>
                    <div className="text-base font-bold text-green-600">
                      ({item.oldScore} + {item.addedScore})
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCloseScorePopupAndNextTurn}
              className="w-full py-4 bg-blue-900 text-white text-xl font-black uppercase border-4 border-black hover:bg-blue-800 shadow-hard transition-all"
            >
              다음 턴으로 →
            </button>
          </div>
        </div>
      )}

      {/* 관리자 대시보드 */}
      <AdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
        gameMode={currentSession?.version || GameVersion.Custom}
        customCards={sessionCustomCards}
        customBoardImage={currentSession?.customBoardImage}
        sessionId={currentSessionId || undefined}
        aiEvaluationGuidelines={currentSession?.aiEvaluationGuidelines}
        onSaveCards={(cards, customBoardImage, aiEvaluationGuidelines) => {
          updateCustomCardsInSession(cards, customBoardImage, aiEvaluationGuidelines);
        }}
      />

      {/* 게임 규칙서 모달 (관리자 화면용) */}
      <GameRulesModal
        visible={showGameRules}
        onClose={() => setShowGameRules(false)}
        gameMode={currentSession?.version || GameVersion.Custom}
      />
    </div>
  );
};

export default App;