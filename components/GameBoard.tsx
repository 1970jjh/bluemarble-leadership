import React from 'react';
import {
  BOARD_SQUARES,
  CUSTOM_BOARD_NAMES,
} from '../constants';
import { BoardSquare, SquareType, Team, TeamColor, GameVersion, GameCard } from '../types';

interface GameBoardProps {
  teams: Team[];
  onSquareClick: (index: number) => void;
  gameMode: string;
  customBoardImage?: string;  // 커스텀 모드용 배경 이미지 URL
  customCards?: GameCard[];   // 커스텀 카드 (보드 이름 표시용)
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

const GameBoard: React.FC<GameBoardProps> = ({ teams, onSquareClick, gameMode, customBoardImage, customCards }) => {
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
        {BOARD_SQUARES.map((square) => (
          <div
            key={square.index}
            style={getGridStyle(square.index)}
            onClick={() => onSquareClick(square.index)}
            className={`relative border-[3px] border-black flex flex-col shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:z-50 hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] cursor-pointer bg-white group overflow-hidden`}
          >
            {/* Special Square Styling (Corners & Event) */}
            {square.type !== SquareType.City ? (
              <div className={`w-full h-full flex flex-col items-center justify-center p-1 text-center font-black leading-tight
                ${square.type === SquareType.Start ? 'bg-green-200' : 
                  square.type === SquareType.Island ? 'bg-gray-200' :
                  square.type === SquareType.Space ? 'bg-purple-200' :
                  square.type === SquareType.WorldTour ? 'bg-blue-200' :
                  'bg-yellow-300' // GoldenKey
                }
              `}>
                <span className="text-xs md:text-sm uppercase tracking-tighter mb-1">{square.type === SquareType.Start ? 'START' : square.type}</span>
                <span className="text-sm md:text-lg">{getSquareDisplayName(square)}</span>
              </div>
            ) : (
              /* City/Competency Card Styling - 커스텀 모드 */
              <>
                <div className="h-[20%] w-full border-b-2 border-black bg-gray-800"></div>
                <div className="flex-1 flex flex-col items-center justify-center p-1 text-center bg-[#fafafa]">
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
        ))}
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