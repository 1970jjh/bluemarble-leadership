import { GameCard, ResourceState } from '../types';

// ============================================================
// 모든 constants 모듈 re-export (커스텀 모드 전용)
// ============================================================
export { BOARD_SIZE, BOARD_SQUARES, CUSTOM_BOARD_NAMES } from './board';
export { COMPETENCY_INFO } from './competencyInfo';
export { EVENT_CARDS } from './eventCards';

// 개별 import (내부 사용)
import { BOARD_SQUARES, CUSTOM_BOARD_NAMES } from './board';
import { EVENT_CARDS } from './eventCards';

// ============================================================
// 초기 리소스 및 보너스 설정
// ============================================================
export const INITIAL_RESOURCES: ResourceState = {
  capital: 50,    // 자본 (시작: 50)
  energy: 50,     // 에너지 (시작: 50)
  reputation: 30, // 평판 (시작: 30, 목표: 100)
  trust: 30,      // 신뢰 (시작: 30, 목표: 100)
  competency: 30, // 역량 (시작: 30, 목표: 100)
  insight: 30,    // 통찰력 (시작: 30, 목표: 100)
};

// 한 바퀴 완주 보너스
export const LAP_BONUS: Partial<ResourceState> = {
  energy: 40,
  trust: 10,
  competency: 10,
  insight: 10,
};

// 더블 보너스 (주사위 2개 같은 숫자)
export const DOUBLE_BONUS: Partial<ResourceState> = {
  energy: 5,
  trust: 5,
  competency: 5,
  insight: 5,
};

// ============================================================
// 전체 카드 통합 (커스텀 모드에서는 이벤트 카드만 기본 제공)
// ============================================================
export const SAMPLE_CARDS: GameCard[] = [
  ...EVENT_CARDS,
];

// ============================================================
// 헬퍼 함수들 (커스텀 모드 전용)
// ============================================================

// 보드 칸 이름 가져오기
export const getSquareName = (squareIndex: number): string => {
  const square = BOARD_SQUARES.find(s => s.index === squareIndex);
  if (!square) return '';
  return CUSTOM_BOARD_NAMES[squareIndex] || square.name;
};

// 찬스카드 인덱스 순서 (출발선 기준)
export const CHANCE_CARD_SQUARES = [2, 7, 12, 19, 31];

// 찬스카드 타입 판별 (1/3/5번째는 복권 보너스, 2/4번째는 리스크 카드)
export const getChanceCardType = (squareIndex: number): 'lottery' | 'risk' | null => {
  const order = CHANCE_CARD_SQUARES.indexOf(squareIndex);
  if (order === -1) return null;

  // 1번째, 3번째, 5번째 (index 0, 2, 4) → 복권 보너스
  // 2번째, 4번째 (index 1, 3) → 리스크 카드
  return (order % 2 === 0) ? 'lottery' : 'risk';
};

// 팀별 캐릭터 이미지 (8개)
export const CHARACTER_IMAGES = [
  'https://i.ibb.co/RGcCcwBf/1.png',  // 1조
  'https://i.ibb.co/MkKQpP8W/2.png',  // 2조
  'https://i.ibb.co/KpF32MRT/3.png',  // 3조
  'https://i.ibb.co/5XvVbLmQ/4.png',  // 4조
  'https://i.ibb.co/Y43M160r/5.png',  // 5조
  'https://i.ibb.co/hRZ7RJZ4/6.png',  // 6조
  'https://i.ibb.co/BH7hrmDZ/7.png',  // 7조
  'https://i.ibb.co/kgqKfW7Q/8.png',  // 8조
];

// 팀 번호로 캐릭터 이미지 가져오기
export const getCharacterImage = (teamNumber: number): string => {
  const index = (teamNumber - 1) % CHARACTER_IMAGES.length;
  return CHARACTER_IMAGES[index];
};
