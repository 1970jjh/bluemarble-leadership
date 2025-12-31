
// 22개 역량 타입
export type CompetencyType =
  // Self Leadership (6)
  | 'self-awareness'      // 자기 인식
  | 'emotional-control'   // 감정 조절
  | 'time-management'     // 시간 관리
  | 'resilience'          // 회복 탄력성
  | 'learning-agility'    // 지속 학습
  | 'personal-vision'     // 자기 비전
  // Followership (5)
  | 'active-listening'    // 적극적 경청
  | 'proactivity'         // 능동적 수행
  | 'critical-thinking'   // 비판적 사고
  | 'feedback-reception'  // 피드백 수용
  | 'commitment'          // 조직 몰입
  // Leadership (6)
  | 'clear-direction'     // 명확한 지시
  | 'motivation'          // 동기 부여
  | 'empowerment'         // 임파워먼트
  | 'decision-making'     // 의사결정
  | 'coaching'            // 코칭
  | 'servant-leadership'  // 서번트 리더십
  // Teamship (5)
  | 'psychological-safety' // 심리적 안전감
  | 'conflict-management'  // 갈등 관리
  | 'diversity-inclusion'  // 다양성 포용
  | 'mutual-accountability' // 상호 책임
  | 'collaboration-tools'; // 협업 툴 활용

export enum TeamColor {
  Red = 'Red',
  Blue = 'Blue',
  Green = 'Green',
  Yellow = 'Yellow',
  Purple = 'Purple',
  Orange = 'Orange',
  Pink = 'Pink',
  Teal = 'Teal',
  Cyan = 'Cyan',
  Lime = 'Lime',
  Indigo = 'Indigo',
  Amber = 'Amber',
  Emerald = 'Emerald',
  Slate = 'Slate',
  Rose = 'Rose'
}

export enum GameVersion {
  Self = 'Self Leadership',
  Follower = 'Followership',
  Leader = 'Leadership (Manager)',
  Team = 'Teamship'
}

export enum SquareType {
  Start = 'Start',
  City = 'City', // Represents a competency area
  GoldenKey = 'GoldenKey',
  Island = 'Island', // Burnout zone
  Space = 'Space', // Challenge
  WorldTour = 'WorldTour', // Achievement -> Core Value
  Fund = 'Fund', // Social Fund -> Internal Venture
}

export interface ResourceState {
  capital: number;
  energy: number;
  reputation: number;
  trust: number;
  competency: number;
  insight: number;
}

export interface Player {
  id: string;
  name: string;
}

export interface TurnRecord {
  turnNumber: number;
  cardId: string;
  cardTitle: string;
  situation: string;
  choiceId: string;
  choiceText: string;
  reasoning: string;
  aiFeedback: string;
  scoreChanges: Partial<ResourceState>;
  timestamp: number;
  position?: number;  // 해당 턴에서 도착한 보드 위치
}

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  position: number; // 0 to 31
  resources: ResourceState;
  isBurnout: boolean; 
  burnoutCounter: number;
  lapCount: number;
  members: Player[];
  currentMemberIndex: number; // Who rolls next
  history: TurnRecord[]; // Log of all decisions and AI evaluations
}

export interface BoardSquare {
  index: number;
  type: SquareType;
  name: string;
  price?: number;
  module?: 'Self' | 'Team' | 'Leader' | 'Follower';
  competency?: CompetencyType; // 칸에 해당하는 역량
  description?: string;
}

export interface Choice {
  id: string;
  text: string;
}

export interface GameCard {
  id: string;
  type: 'Self' | 'Team' | 'Leader' | 'Follower' | 'Event' | 'Challenge' | 'Burnout' | 'Etiquette' | 'CoreValue';
  competency?: CompetencyType; // 22개 역량 중 하나 (Event/Challenge/Burnout 등은 없음)
  title: string;
  situation: string;
  choices?: Choice[]; // Optional: If undefined/empty, it's an open-ended input
  learningPoint: string;
}

export interface AIEvaluationResult {
  feedback: string;
  scoreChanges: Partial<ResourceState>;
}

export enum GamePhase {
  Setup = 'Setup',
  Lobby = 'Lobby',
  WaitingToStart = 'WaitingToStart',  // 게임 시작 대기 (관리자가 START 누르기 전)
  Idle = 'Idle',
  Rolling = 'Rolling',
  Moving = 'Moving',
  ShowingDiceResult = 'ShowingDiceResult',  // 주사위 결과 표시 중
  ShowingCompetencyCard = 'ShowingCompetencyCard',  // 역량카드 미리보기 표시 중
  Event = 'Event',
  Decision = 'Decision',
  Result = 'Result',
  Paused = 'Paused',  // 게임 일시정지
  End = 'End',
}

export type SessionStatus = 'active' | 'paused' | 'ended';

export interface Session {
  id: string;
  name: string;
  version: GameVersion;
  teamCount: number;
  status: SessionStatus;
  accessCode: string;
  createdAt: number;
  teams: Team[]; // Snapshot of teams in this session
}