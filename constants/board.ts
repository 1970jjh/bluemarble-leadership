import { BoardSquare, SquareType } from '../types';

export const BOARD_SIZE = 32;

// ============================================================
// 보드 구성 - 32칸 (커스텀 모드 전용)
// ============================================================
export const BOARD_SQUARES: BoardSquare[] = [
  // Bottom Row (Right to Left) - 0~8
  { index: 0, type: SquareType.Start, name: '출발 (Start)' },
  { index: 1, type: SquareType.City, name: '카드 1' },
  { index: 2, type: SquareType.GoldenKey, name: '🎲 2배 찬스' },
  { index: 3, type: SquareType.City, name: '카드 2' },
  { index: 4, type: SquareType.City, name: '카드 3' },
  { index: 5, type: SquareType.City, name: '카드 4' },
  { index: 6, type: SquareType.City, name: '카드 5' },
  { index: 7, type: SquareType.GoldenKey, name: '🤝 나눔카드' },
  { index: 8, type: SquareType.Island, name: '🔥 번아웃존' },

  // Left Column (Bottom to Top) - 9~15
  { index: 9, type: SquareType.City, name: '카드 6' },
  { index: 10, type: SquareType.City, name: '카드 7' },
  { index: 11, type: SquareType.City, name: '카드 8' },
  { index: 12, type: SquareType.GoldenKey, name: '🎲 2배 찬스' },
  { index: 13, type: SquareType.City, name: '카드 9' },
  { index: 14, type: SquareType.City, name: '카드 10' },
  { index: 15, type: SquareType.City, name: '카드 11' },

  // Top Row (Left to Right) - 16~23
  { index: 16, type: SquareType.WorldTour, name: '🚀 3배 찬스' },
  { index: 17, type: SquareType.City, name: '카드 12' },
  { index: 18, type: SquareType.City, name: '카드 13' },
  { index: 19, type: SquareType.GoldenKey, name: '🤝 나눔카드' },
  { index: 20, type: SquareType.City, name: '카드 14' },
  { index: 21, type: SquareType.City, name: '카드 15' },
  { index: 22, type: SquareType.City, name: '카드 16' },
  { index: 23, type: SquareType.City, name: '카드 17' },

  // Right Column (Top to Bottom) - 24~31
  { index: 24, type: SquareType.Space, name: '🚀 3배 찬스' },
  { index: 25, type: SquareType.City, name: '카드 18' },
  { index: 26, type: SquareType.City, name: '카드 19' },
  { index: 27, type: SquareType.Fund, name: '📈 성장펀드' },
  { index: 28, type: SquareType.City, name: '카드 20' },
  { index: 29, type: SquareType.City, name: '카드 21' },
  { index: 30, type: SquareType.City, name: '카드 22' },
  { index: 31, type: SquareType.GoldenKey, name: '🎲 2배 찬스' },
];

// ============================================================
// 커스텀 모드용 보드 칸 기본 이름 (관리자가 JSON으로 설정 가능)
// ============================================================
export const CUSTOM_BOARD_NAMES: Record<number, string> = {
  // 일반 카드 칸 (22개)
  1: '카드 1',
  3: '카드 2',
  4: '카드 3',
  5: '카드 4',
  6: '카드 5',
  9: '카드 6',
  10: '카드 7',
  11: '카드 8',
  13: '카드 9',
  14: '카드 10',
  15: '카드 11',
  17: '카드 12',
  18: '카드 13',
  20: '카드 14',
  21: '카드 15',
  22: '카드 16',
  23: '카드 17',
  25: '카드 18',
  26: '카드 19',
  28: '카드 20',
  29: '카드 21',
  30: '카드 22',
  // 특수 칸 (9개) - 커스텀 모드 전용 이름
  2: '🎲 2배 찬스',
  7: '🤝 나눔카드',
  8: '🔥 번아웃존',
  12: '🎲 2배 찬스',
  16: '🚀 3배 찬스',
  19: '🤝 나눔카드',
  24: '🚀 3배 찬스',
  27: '📈 성장펀드',
  31: '🎲 2배 찬스',
};
