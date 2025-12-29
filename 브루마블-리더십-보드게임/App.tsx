import React, { useState, useEffect, useCallback } from 'react';
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
import { Smartphone, Monitor } from 'lucide-react';
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
  
  // Shared Input State
  const [sharedSelectedChoice, setSharedSelectedChoice] = useState<Choice | null>(null);
  const [sharedReasoning, setSharedReasoning] = useState('');
  const [aiEvaluationResult, setAiEvaluationResult] = useState<AIEvaluationResult | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Helper to get current session object
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const teams = currentSession ? currentSession.teams : [];
  const currentTeam = teams[currentTurnIndex];

  // --- AI Client Initialization ---
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // --- URL 파라미터 확인 (접속 코드) ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setInitialAccessCode(joinCode);
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

    const unsubscribe = firestoreService.subscribeToGameState(currentSessionId, (state) => {
      if (state) {
        // 게임 상태 동기화 (다른 사용자가 변경한 경우에만)
        if (state.lastUpdated && Date.now() - state.lastUpdated < 5000) {
          setGamePhase(state.phase as GamePhase);
          setCurrentTurnIndex(state.currentTeamIndex);
          setDiceValue(state.diceValue || [1, 1]);
          setActiveCard(state.currentCard);
          setSharedSelectedChoice(state.selectedChoice);
          setSharedReasoning(state.reasoning || '');
          setAiEvaluationResult(state.aiResult);
          setIsAiProcessing(state.isAiProcessing || false);
          if (state.gameLogs?.length) {
            setGameLogs(state.gameLogs);
          }
          // 카드가 있으면 모달 표시
          if (state.currentCard && state.phase === GamePhase.Decision) {
            setShowCardModal(true);
          }
          // 결과가 이미 있으면 모달 닫힌 상태로 (이미 완료된 턴)
          if (state.aiResult && state.phase !== GamePhase.Decision) {
            setShowCardModal(false);
          }
        }
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
        gameLogs: gameLogs,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Firebase 게임 상태 저장 실패:', error);
    }
  }, [currentSessionId, gamePhase, currentTurnIndex, diceValue, activeCard, sharedSelectedChoice, sharedReasoning, aiEvaluationResult, isAiProcessing, gameLogs]);

  // 게임 상태 변경 시 Firebase에 저장
  useEffect(() => {
    // 중요한 상태가 변경될 때만 저장
    if (currentSessionId && (activeCard || aiEvaluationResult || gamePhase !== GamePhase.Idle)) {
      saveGameStateToFirebase();
    }
  }, [activeCard, sharedSelectedChoice, sharedReasoning, aiEvaluationResult, isAiProcessing, gamePhase, currentSessionId, saveGameStateToFirebase]);

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
      } catch (error) {
        console.error('Firebase 세션 생성 실패:', error);
      }
    }

    // 로컬 상태 업데이트 (Firebase 미설정 시 또는 백업용)
    setSessions(prev => [newSession, ...prev]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (isFirebaseConfigured) {
      try {
        await firestoreService.deleteSession(sessionId);
      } catch (error) {
        console.error('Firebase 세션 삭제 실패:', error);
      }
    }
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

  // Timer
  useEffect(() => {
    let interval: any;
    if (gamePhase === GamePhase.Decision && turnTimeLeft > 0) {
      interval = setInterval(() => {
        setTurnTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gamePhase, turnTimeLeft]);

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

  const updateTeamHistory = (teamId: string, record: TurnRecord) => {
    if (!currentSession) return;
    const updatedTeams = currentSession.teams.map(team => {
      if (team.id !== teamId) return team;
      return { ...team, history: [...team.history, record] };
    });
    updateTeamsInSession(updatedTeams);
  };

  const updateTeamResources = (teamId: string, changes: any) => {
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
    updateTeamsInSession(updatedTeams);
  };

  // --- Core Game Actions ---

  const handleLandOnSquare = (team: Team, squareIndex: number) => {
    const square = BOARD_SQUARES.find(s => s.index === squareIndex);
    if (!square) return;

    addLog(`📍 [도착] ${team.name} → ${square.name} (${square.type})`);

    // Helper to pick random card
    const pickRandomCard = (type: string, fallbackId: string = 'E-001') => {
      const candidates = SAMPLE_CARDS.filter(c => c.type === type);
      return candidates.length > 0 
        ? candidates[Math.floor(Math.random() * candidates.length)] 
        : SAMPLE_CARDS.find(c => c.id === fallbackId) || SAMPLE_CARDS[0];
    };

    let selectedCard: GameCard | null = null;

    if (square.type === SquareType.City) {
      const relevantCards = SAMPLE_CARDS.filter(c => c.type === square.module);
      selectedCard = relevantCards.length > 0
        ? relevantCards[Math.floor(Math.random() * relevantCards.length)]
        : SAMPLE_CARDS[0];
      addLog(`🎴 [카드 선택] ${selectedCard.title} (${square.module})`);
    }
    else if (square.type === SquareType.GoldenKey) {
      selectedCard = pickRandomCard('Event');
      addLog(`🗝️ [찬스 카드] ${selectedCard.title}`);
    }
    else if (square.type === SquareType.Fund) {
      const fundCards = SAMPLE_CARDS.filter(c => c.title.includes("사내 벤처") || c.type === 'Event');
      selectedCard = fundCards[Math.floor(Math.random() * fundCards.length)];
      addLog(`💰 [혁신 카드] ${selectedCard.title}`);
    }
    else if (square.type === SquareType.Space) {
      // Changed to Challenge (Open-Ended)
      selectedCard = pickRandomCard('Challenge', 'C-001');
      addLog(`🚀 [도전 카드] ${selectedCard.title}`);
    }
    else if (square.type === SquareType.WorldTour) {
      // Changed to Core Value
      selectedCard = pickRandomCard('CoreValue', 'V-001');
      addLog(`🌍 [핵심가치 카드] ${selectedCard.title}`);
    }
    else if (square.type === SquareType.Island) {
      selectedCard = pickRandomCard('Burnout', 'B-001');
      addLog(`⚠️ [번아웃 카드] ${selectedCard.title}`);
    }
    else if (square.type === SquareType.Start) {
      updateTeamResources(team.id, { capital: 50 });
      addLog(`🏁 [출발] ${team.name} +50 자본`);
      nextTurn();
      return;
    }
    else {
      addLog(`👣 [통과] ${team.name} - 특별 이벤트 없음`);
      nextTurn();
      return;
    }

    if (selectedCard) {
      setActiveCard(selectedCard);
      setSharedSelectedChoice(null);
      setSharedReasoning('');
      setAiEvaluationResult(null);
      setGamePhase(GamePhase.Decision);
      setShowCardModal(true); // Open Admin Modal automatically
    }
  };

  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setGamePhase(GamePhase.Rolling);

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

    if (!currentTeam) return;

    addLog(`🎲 [주사위] ${currentTeam.name}: [${die1}] + [${die2}] = ${die1 + die2}칸 이동`);
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

  // --- AI Evaluation & Submission ---

  const handleSharedSubmit = async () => {
    if (!currentTeam || !activeCard) return;
    // Check constraints based on open-ended vs choice
    const isOpenEnded = !activeCard.choices || activeCard.choices.length === 0;
    if (isOpenEnded && !sharedReasoning) return;
    if (!isOpenEnded && (!sharedSelectedChoice || !sharedReasoning)) return;

    setIsAiProcessing(true);
    addLog(`📝 [응답 제출] ${currentTeam.name}`);
    addLog(`   카드: ${activeCard.title} (${activeCard.type})`);
    addLog(`   상황: ${activeCard.situation.substring(0, 50)}...`);
    if (!isOpenEnded && sharedSelectedChoice) {
      addLog(`   선택: [${sharedSelectedChoice.id}] ${sharedSelectedChoice.text}`);
    }
    addLog(`   응답: "${sharedReasoning.substring(0, 100)}${sharedReasoning.length > 100 ? '...' : ''}"`);
    addLog(`🤖 AI 평가 시작...`);

    if (!process.env.API_KEY) {
       alert("API Key missing");
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
      addLog(`✅ [AI 평가 완료] ${currentTeam.name}`);
      addLog(`   피드백: "${result.feedback.substring(0, 80)}..."`);
      const scores = result.scoreChanges;
      addLog(`   점수: C:${scores.capital || 0} E:${scores.energy || 0} T:${scores.trust || 0} Co:${scores.competency || 0} I:${scores.insight || 0}`);
      
    } catch (e) {
      console.error(e);
      alert("AI Error");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleApplyResult = () => {
    if (aiEvaluationResult && currentTeam && activeCard) {
      // 1. Update Team Resources
      updateTeamResources(currentTeam.id, aiEvaluationResult.scoreChanges);

      // 2. Log to Team History
      const turnRecord: TurnRecord = {
        turnNumber: currentSession?.teams[currentTurnIndex].history.length! + 1,
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
      updateTeamHistory(currentTeam.id, turnRecord);

      const scores = aiEvaluationResult.scoreChanges;
      addLog(`🎯 [점수 적용] ${currentTeam.name}`);
      addLog(`   자본: ${scores.capital || 0}, 에너지: ${scores.energy || 0}, 신뢰: ${scores.trust || 0}`);
      addLog(`   역량: ${scores.competency || 0}, 통찰: ${scores.insight || 0}`);
    }

    addLog(`⏭️ [턴 종료] 다음 팀으로 이동`);

    // 3. Next Turn
    nextTurn();
  };

  const handleBoardSquareClick = (index: number) => {
    const square = BOARD_SQUARES.find(s => s.index === index);
    if (!square) return;

    let cardToPreview: GameCard | undefined;
    
    // Helper to find random card of type or filtered property
    const findCard = (filter: (c: GameCard) => boolean) => {
      const candidates = SAMPLE_CARDS.filter(filter);
      return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : undefined;
    };

    switch (square.type) {
      case SquareType.City:
        cardToPreview = findCard(c => c.type === square.module);
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
      setPreviewCard(cardToPreview);
    }
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

    // 팀 선택 화면
    if (!participantTeamId || !participantTeam) {
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
              {participantSession?.teams.map((team, idx) => (
                <button
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className="p-4 border-4 border-black font-black text-lg hover:bg-yellow-400 transition-colors flex flex-col items-center gap-2"
                >
                  <div className={`w-8 h-8 rounded-full bg-${team.color.toLowerCase()}-500 border-2 border-black`}></div>
                  {team.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setView('intro'); setCurrentSessionId(null); }}
              className="w-full py-3 bg-gray-200 border-4 border-black font-bold"
            >
              나가기
            </button>
          </div>
        </div>
      );
    }

    // 팀 게임 화면
    const isMyTurn = participantSession?.teams[currentTurnIndex]?.id === participantTeamId;
    const activeTeamForViewer = participantSession?.teams[currentTurnIndex];

    return (
      <div className="min-h-screen bg-gray-900">
        <MobileTeamView
          team={participantTeam}
          activeTeamName={participantSession?.teams[currentTurnIndex]?.name || ''}
          isMyTurn={isMyTurn}
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
          onSubmit={handleSharedSubmit}
          aiResult={aiEvaluationResult}
          isProcessing={isAiProcessing}
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
                  onReset={() => {}}
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
                 onSubmit={handleSharedSubmit}
                 aiResult={aiEvaluationResult}
                 isProcessing={isAiProcessing}
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
          onSubmit={handleSharedSubmit}
          result={aiEvaluationResult}
          isProcessing={isAiProcessing}
          onClose={handleApplyResult}
          teamName={currentTeam?.name}
        />
      )}

      {previewCard && !activeCard && (
        <CardModal
           card={previewCard}
           visible={true}
           timeLeft={0}
           selectedChoice={null}
           reasoning=""
           onSelectionChange={() => {}}
           onReasoningChange={() => {}}
           onSubmit={async () => alert("Preview Mode Only")}
           result={null} 
           isProcessing={false}
           onClose={() => setPreviewCard(null)}
        />
      )}

      {showReport && (
        <ReportView teams={teams} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
};

export default App;