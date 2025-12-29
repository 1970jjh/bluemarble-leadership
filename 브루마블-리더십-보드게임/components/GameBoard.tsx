import React from 'react';
import { BOARD_SQUARES, BOARD_SIZE } from '../constants';
import { BoardSquare, SquareType, Team, TeamColor, GameVersion } from '../types';

interface GameBoardProps {
  teams: Team[];
  onSquareClick: (index: number) => void;
  gameMode: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ teams, onSquareClick, gameMode }) => {
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

  const getModuleColor = (module?: string) => {
    switch(module) {
      case 'Self': return 'bg-blue-600';
      case 'Team': return 'bg-green-600';
      case 'Leader': return 'bg-red-600';
      case 'Follower': return 'bg-orange-500';
      default: return 'bg-gray-800';
    }
  };

  const getTeamTokenColor = (color: TeamColor) => {
    switch(color) {
      case TeamColor.Red: return 'bg-red-600 border-red-800 text-white';
      case TeamColor.Blue: return 'bg-blue-600 border-blue-800 text-white';
      case TeamColor.Green: return 'bg-green-600 border-green-800 text-white';
      case TeamColor.Yellow: return 'bg-yellow-400 border-yellow-600 text-black';
      default: return `bg-${color.toLowerCase()}-500 text-white`;
    }
  };

  // 모드별 배경 이미지
  const bgImages: Record<string, string> = {
    [GameVersion.Leader]: 'https://i.ibb.co/jPpGrZ1S/image.png',      // 리더십
    [GameVersion.Follower]: 'https://i.ibb.co/ks7LnDdK/image.png',    // 팔로워십
    [GameVersion.Team]: 'https://i.ibb.co/PGMd9GS8/image.png',        // 팀쉽
    [GameVersion.Self]: 'https://i.ibb.co/Rpd0VG9G/image.png',        // 셀프리더십
  };

  // 현재 게임 모드에 맞는 배경 이미지 선택
  const currentBgImage = bgImages[gameMode] || bgImages[GameVersion.Self];

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
                <span className="text-sm md:text-lg">{square.name.split('(')[0]}</span>
              </div>
            ) : (
              /* City/Competency Card Styling */
              <>
                {/* Top Color Bar */}
                <div className={`h-[25%] w-full border-b-2 border-black ${getModuleColor(square.module)}`}></div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-1 text-center bg-[#fafafa]">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{square.module}</span>
                  <span className="text-xs md:text-sm font-black text-gray-900 leading-tight break-keep">
                    {square.name.split('(')[0]}
                  </span>
                  {/* English Subtitle */}
                  <span className="text-[8px] text-gray-400 font-bold mt-1 hidden md:block">
                     {square.name.match(/\((.*?)\)/)?.[1]}
                  </span>
                </div>
              </>
            )}

            {/* Team Tokens (Avatars) */}
            <div className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-center gap-1 p-1">
              {teams.filter(t => t.position === square.index).map(team => {
                 // Calculate Team Number (1-based index)
                 const teamNumber = teams.findIndex(t => t.id === team.id) + 1;
                 
                 return (
                  <div 
                    key={team.id} 
                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 shadow-md flex items-center justify-center text-sm font-black z-10 transform hover:scale-125 transition-transform ${getTeamTokenColor(team.color)}`}
                    title={team.name}
                  >
                    {teamNumber}
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