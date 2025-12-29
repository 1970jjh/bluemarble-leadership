
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
  description?: string;
}

export interface Choice {
  id: string;
  text: string;
}

export interface GameCard {
  id: string;
  type: 'Self' | 'Team' | 'Leader' | 'Follower' | 'Event' | 'Challenge' | 'Burnout' | 'Etiquette' | 'CoreValue';
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
  Idle = 'Idle',
  Rolling = 'Rolling',
  Moving = 'Moving',
  Event = 'Event', 
  Decision = 'Decision', 
  Result = 'Result', 
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