import React from 'react';
import {
  BOARD_SQUARES,
  CUSTOM_BOARD_NAMES,
} from '../constants';
import { BoardSquare, SquareType, Team, TeamColor, GameVersion, GameCard } from '../types';

// 영토 소유권 정보
interface TerritoryInfo {
  ownerTeamId: string;
  ownerTeamName: string;
  ownerTeamColor: string;
  acquiredAt: number;
}

interface GameBoardProps {
  teams: Team[];
  onSquareClick: (index: number) => void;
  gameMode: string;
  customBoardImage?: string;  // 커스텀 모드용 배경 이미지 URL
  customCards?: GameCard[];   // 커스텀 카드 (보드 이름 표시용)
  territories?: { [squareIndex: string]: TerritoryInfo };  // 영토 소유권 정보
}

// 팀별 캐릭터 이미지 (8개)
const CHARACTER_IMAGES = [
  'https://i.ibb.co/RGcCcwBf/1.png',  // 1조
  'https://i.ibb.co/MkKQpP8W/2.png',  // 2조
  'https://i.ibb.co/KpF32MRT/3.png',  // 3조
  'https://i.ibb.co/5XvVbLmQ/4.png',  // 4조
  'https://i.ibb.co/Y43M160r/5.png',  // 5조
  'https://i.ibb.co/hRZ7RJZ4/6.png',  // 6조
  'https://i.ibb.co/BH7hrmDZ/7.png',  // 7조
  'https://i.ibb.co/kgqKfW7Q/8.png',  // 8조
];

// 특수 칸 정의 (export for use in other components)
export const DOUBLE_SQUARES = [8, 16, 24];  // x2 칸 (노란색)
export const TRIPLE_SQUARES = [12, 28];     // x3 칸 (빨간색)

// 특수 칸 배율 가져오기 유틸리티 함수
export const getSquareMultiplier = (index: number): number => {
  if (TRIPLE_SQUARES.includes(index)) return 3;
  if (DOUBLE_SQUARES.includes(index)) return 2;
  return 1;
};

const GameBoard: React.FC<GameBoardProps> = ({ teams, onSquareClick, gameMode, customBoardImage, customCards, territories = {} }) => {
  // 팀 색상을 CSS 색상으로 변환
  const getTeamColorCSS = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      'Red': '#ef4444',
      'Blue': '#3b82f6',
      'Green': '#22c55e',
      'Yellow': '#eab308',
      'Purple': '#a855f7',
      'Orange': '#f97316',
      'Pink': '#ec4899',
      'Teal': '#14b8a6',
      'Cyan': '#06b6d4',
      'Lime': '#84cc16',
      'Indigo': '#6366f1',
      'Amber': '#f59e0b',
      'Emerald': '#10b981',
      'Slate': '#64748b',
      'Rose': '#f43f5e'
    };
    return colorMap[color] || '#6b7280';
  };

  // 특수 칸 여부 확인
  const isDoubleSquare = (index: number) => DOUBLE_SQUARES.includes(index);
  const isTripleSquare = (index: number) => TRIPLE_SQUARES.includes(index);
  const getMultiplier = (index: number) => {
    if (isTripleSquare(index)) return 3;
    if (isDoubleSquare(index)) return 2;
    return 1;
  };
  // 팀 번호에 해당하는 캐릭터 이미지 가져오기 (9조 이상은 순환)
  const getCharacterImage = (teamNumber: number): string => {
    const index = (teamNumber - 1) % CHARACTER_IMAGES.length;
    return CHARACTER_IMAGES[index];
  };

  // 보드 칸 이름 가져오기 (커스텀 모드 전용)
  const getSquareDisplayName = (square: BoardSquare): string => {
    // customCards에서 해당 boardIndex의 카드 제목 찾기
    if (customCards && customCards.length > 0) {
      const customCard = customCards.find((c: any) => c.boardIndex === square.index);
      if (customCard) {
        return customCard.title || CUSTOM_BOARD_NAMES[square.index] || `카드 ${square.index}`;
      }
    }
    // customCards에 없으면 CUSTOM_BOARD_NAMES 사용
    return CUSTOM_BOARD_NAMES[square.index] || square.name.split('(')[0];
  };

  const getGridStyle = (index: number) => {
    let row = 0;
    let col = 0;

    if (index >= 0 && index <= 8) {
      row = 9;
      col = 9 - index;
    } else if (index >= 9 && index <= 15) {
      col = 1;
      row = 9 - (index - 8);
    } else if (index >= 16 && index <= 24) {
      row = 1;
      col = 1 + (index - 16);
    } else if (index >= 25 && index <= 31) {
      col = 9;
      row = 1 + (index - 24);
    }

    return {
      gridRow: row,
      gridColumn: col,
    };
  };

  // 커스텀 모드 기본 배경 이미지
  const defaultBgImage = 'https://i.ibb.co/YF5PkBKv/Infographic-5.png';

  // 배경 이미지 선택 (커스텀 이미지 우선)
  const currentBgImage = customBoardImage || defaultBgImage;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 게임판 */}
      <div className="w-full aspect-square bg-[#e8e8e8] border-[12px] border-black p-4 shadow-hard rounded-xl relative overflow-hidden">
        <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-1.5">

          {/* Center Area - 배경 이미지만 표시 */}
          <div className="col-start-2 col-end-9 row-start-2 row-end-9 bg-white border-4 border-black relative overflow-hidden shadow-inner">
             {/* Dynamic Background Image - 원본 이미지 그대로 표시 */}
             <div className="absolute inset-0">
               <img
                 src={currentBgImage}
                 alt="Board Background"
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   console.warn("Background image failed to load. Check URL.");
                   e.currentTarget.style.display = 'none';
                 }}
               />
             </div>
          </div>

        {/* Board Squares */}
        {BOARD_SQUARES.map((square) => {
          // 영토 소유권 확인
          const territory = territories[square.index.toString()];
          const hasOwner = !!territory;
          const ownerColor = territory ? getTeamColorCSS(territory.ownerTeamColor) : undefined;

          return (
          <div
            key={square.index}
            style={{
              ...getGridStyle(square.index),
              ...(hasOwner ? { borderColor: ownerColor, borderWidth: '4px' } : {})
            }}
            onClick={() => onSquareClick(square.index)}
            className={`relative border-[3px] ${hasOwner ? '' : 'border-black'} flex flex-col shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:z-50 hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] cursor-pointer bg-white group overflow-hidden`}
          >
            {/* Square Styling */}
            {square.type === SquareType.Start ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center font-black leading-tight bg-green-200">
                <span className="text-xs md:text-sm uppercase tracking-tighter mb-1">START</span>
                <span className="text-sm md:text-lg">{getSquareDisplayName(square)}</span>
              </div>
            ) : (
              /* City/Competency Card Styling - 커스텀 모드 */
              <>
                <div
                  className="h-[20%] w-full border-b-2 border-black"
                  style={{ backgroundColor: hasOwner ? ownerColor : '#1f2937' }}
                >
                  {/* 영토 소유자 표시 */}
                  {hasOwner && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[8px] md:text-[10px] text-white font-bold truncate px-1">
                        🏠 {territory?.ownerTeamName}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`flex-1 flex flex-col items-center justify-center p-1 text-center relative ${
                  isTripleSquare(square.index) ? 'bg-red-200' :
                  isDoubleSquare(square.index) ? 'bg-yellow-200' :
                  'bg-[#fafafa]'
                }`}>
                  {/* x2, x3 배지 */}
                  {(isDoubleSquare(square.index) || isTripleSquare(square.index)) && (
                    <div className={`absolute top-0 right-0 px-1 py-0.5 text-[8px] md:text-[10px] font-black rounded-bl ${
                      isTripleSquare(square.index) ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'
                    }`}>
                      x{getMultiplier(square.index)}
                    </div>
                  )}
                  <span className="text-xs md:text-sm font-black text-gray-900 leading-tight break-keep">
                    {getSquareDisplayName(square)}
                  </span>
                </div>
              </>
            )}

            {/* Team Tokens (Character Images with Speech Bubbles) */}
            <div className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-center gap-1 p-1">
              {teams.filter(t => t.position === square.index).map(team => {
                 // Calculate Team Number (1-based index)
                 const teamNumber = teams.findIndex(t => t.id === team.id) + 1;

                 return (
                  <div
                    key={team.id}
                    className="relative z-10 transform hover:scale-125 transition-transform"
                    title={team.name}
                  >
                    {/* Speech Bubble */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white border-2 border-black rounded-full px-1.5 py-0.5 text-[8px] md:text-[10px] font-black whitespace-nowrap shadow-md z-20">
                      {teamNumber}조
                      {/* Speech Bubble Tail */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-black"></div>
                      <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                    {/* Character Image */}
                    <img
                      src={getCharacterImage(teamNumber)}
                      alt={`${teamNumber}조`}
                      className="w-10 h-10 md:w-[50px] md:h-[50px] object-contain drop-shadow-lg"
                      onError={(e) => {
                        // Fallback to numbered circle if image fails
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
        })}
        </div>
      </div>

      {/* 게임판 아래 텍스트 */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 px-4">
        <h1 className="text-3xl md:text-4xl font-black text-blue-900 tracking-tighter text-center leading-none italic">
          JJ <span className="text-black">ACADEMY</span>
        </h1>
        <div className="bg-black text-white px-6 py-2 text-lg md:text-xl font-black border-4 border-black shadow-hard uppercase text-center">
          {gameMode.toUpperCase()} SIMULATION
        </div>
      </div>
    </div>
  );
};

export default GameBoard;