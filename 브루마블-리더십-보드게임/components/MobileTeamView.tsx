import React from 'react';
import { Team, GamePhase, GameCard, Choice, AIEvaluationResult } from '../types';
import { Battery, Coins, Handshake, Lightbulb, TrendingUp, MapPin, Dice5, Send, Sparkles, Eye, MessageSquare } from 'lucide-react';
import { BOARD_SQUARES } from '../constants';

interface MobileTeamViewProps {
  team: Team;
  activeTeamName: string;
  isMyTurn: boolean;
  gamePhase: GamePhase;
  onRollDice: () => void;
  
  // Active Turn Props
  activeCard: GameCard | null;
  activeInput: { choice: Choice | null, reasoning: string };
  onInputChange: (choice: Choice, reason: string) => void;
  onSubmit: () => void;
  aiResult: AIEvaluationResult | null;
  isProcessing: boolean;
}

const MobileTeamView: React.FC<MobileTeamViewProps> = ({ 
  team, 
  activeTeamName,
  isMyTurn, 
  gamePhase, 
  onRollDice,
  activeCard,
  activeInput,
  onInputChange,
  onSubmit,
  aiResult,
  isProcessing
}) => {
  const currentSquare = BOARD_SQUARES.find(s => s.index === team.position);
  const isOpenEnded = activeCard && (!activeCard.choices || activeCard.choices.length === 0);

  const StatBox = ({ icon: Icon, value, label, color, max }: any) => (
    <div className="bg-white border-2 border-black p-3 shadow-hard-sm flex flex-col items-center justify-center relative overflow-hidden">
      <Icon className={`mb-1 ${color}`} size={20} />
      <span className={`text-xl font-black ${value < 0 ? 'text-red-600' : ''}`}>{value}</span>
      <span className="text-[10px] uppercase font-bold text-gray-500">{label}</span>
      {max && (
        <div className="w-full h-1 bg-gray-200 mt-1 relative">
          <div 
             className={`h-full bg-black transition-all duration-300`} 
             style={{ width: `${Math.min(100, Math.max(0, (value/max)*100))}%` }}
          ></div>
        </div>
      )}
      {value > max && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}
      {value < 0 && <div className="absolute bottom-0 right-0 text-[8px] text-red-500 font-bold px-1">NEG</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-8 flex flex-col font-sans max-w-md mx-auto border-x-4 border-black bg-white">
      {/* Header */}
      <div className={`p-4 border-4 border-black mb-6 shadow-hard flex justify-between items-center bg-${team.color.toLowerCase()}-100`}>
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-500">MY TEAM</h2>
          <h1 className="text-2xl font-black uppercase">{team.name}</h1>
        </div>
        <div className={`w-8 h-8 rounded-full border-2 border-black bg-${team.color.toLowerCase()}-500`}></div>
      </div>

      {/* --- DECISION CARD VIEW (Active or Spectator) --- */}
      {activeCard && !aiResult && (
        <div className="mb-6 animate-in slide-in-from-bottom-5">
           {/* Header depends on Turn */}
           {isMyTurn ? (
             <div className="bg-black text-white p-3 border-4 border-black mb-2">
               <h3 className="font-bold text-sm uppercase text-yellow-400">Decision Required</h3>
               <h2 className="text-xl font-black leading-tight">{activeCard.title}</h2>
             </div>
           ) : (
             <div className="bg-gray-200 text-gray-600 p-3 border-4 border-black mb-2 flex items-center gap-2">
               <Eye size={20} />
               <div>
                 <h3 className="font-bold text-xs uppercase">Spectating {activeTeamName}</h3>
                 <h2 className="text-lg font-black leading-tight text-black">{activeCard.title}</h2>
               </div>
             </div>
           )}
           
           <div className="bg-white border-4 border-black p-4 mb-4">
             <p className="font-medium text-gray-800 mb-4 text-sm">"{activeCard.situation}"</p>
             
             {/* Choices (Only if not open ended) */}
             {!isOpenEnded && activeCard.choices && (
                <div className="space-y-2 mb-4">
                  {activeCard.choices.map(choice => (
                    <button
                      key={choice.id}
                      onClick={() => isMyTurn && onInputChange(choice, activeInput.reasoning)}
                      disabled={!isMyTurn}
                      className={`w-full text-left p-3 border-2 font-bold text-sm flex gap-2 transition-all
                        ${activeInput.choice?.id === choice.id 
                            ? 'bg-blue-600 text-white border-black transform -translate-y-1' 
                            : 'bg-gray-50 border-gray-300'}
                        ${!isMyTurn && activeInput.choice?.id !== choice.id ? 'opacity-50' : ''}
                      `}
                    >
                      <span className={`px-2 bg-black text-white text-xs flex items-center`}>{choice.id}</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
             )}

             {/* Open Ended Indicator */}
             {isOpenEnded && (
                <div className="flex items-center gap-2 text-purple-900 font-bold bg-purple-100 p-3 border-2 border-purple-900 mb-4 text-sm">
                  <MessageSquare size={16} />
                  <span>주관식 답변: 자유롭게 작성하세요.</span>
                </div>
             )}

             {/* Reasoning Input (Read-only if spectator) */}
             {(isMyTurn || activeInput.choice || isOpenEnded) && (
               <>
                 <textarea
                   value={activeInput.reasoning}
                   onChange={(e) => isMyTurn && onInputChange(activeInput.choice!, e.target.value)}
                   disabled={!isMyTurn}
                   placeholder={isMyTurn ? (isOpenEnded ? "답변을 입력하세요..." : "선택 사유를 입력하세요...") : "다른 팀이 사유를 입력중입니다..."}
                   className="w-full p-2 border-2 border-black font-medium text-sm focus:outline-none focus:bg-yellow-50 mb-3 h-24 resize-none disabled:bg-gray-100 disabled:text-gray-500"
                 />
                 
                 {isMyTurn ? (
                   <button
                     onClick={onSubmit}
                     disabled={!activeInput.reasoning.trim() || isProcessing}
                     className="w-full py-3 bg-black text-white font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                   >
                     {isProcessing ? <Sparkles className="animate-spin" /> : <Send size={16} />}
                     {isProcessing ? 'Evaluating...' : 'Submit to AI'}
                   </button>
                 ) : (
                    <div className="w-full py-3 bg-gray-200 text-gray-500 font-bold uppercase text-center border-2 border-transparent">
                       {isProcessing ? 'AI Evaluating...' : 'Waiting for Team...'}
                    </div>
                 )}
               </>
             )}
           </div>
        </div>
      )}

      {/* --- AI RESULT VIEW (ForAll) --- */}
      {aiResult && (
         <div className="mb-6 bg-yellow-100 border-4 border-black p-4 animate-in zoom-in shadow-hard-sm">
            <h3 className="font-black uppercase mb-2 flex items-center gap-2"><Sparkles size={16}/> AI Feedback</h3>
            <p className="text-sm font-medium mb-4 whitespace-pre-wrap leading-relaxed">{aiResult.feedback}</p>
            <div className="text-center font-bold text-xs text-gray-500 uppercase">Check Dashboard for Details</div>
         </div>
      )}

      {/* --- IDLE STATE (Your Board Info) --- */}
      {!activeCard && !aiResult && (
        <div className="mb-8">
          <div className="mb-4 relative">
             <div className="bg-white border-4 border-black p-6 pt-8 text-center shadow-hard">
                <MapPin className="mx-auto mb-2 text-blue-900" size={32} />
                <h3 className="text-xl font-black uppercase leading-tight">{currentSquare?.name}</h3>
             </div>
          </div>

          <button
            onClick={onRollDice}
            disabled={!isMyTurn || gamePhase !== GamePhase.Idle}
            className={`w-full py-6 border-4 border-black text-xl font-black shadow-hard uppercase flex items-center justify-center gap-3 transition-all
              ${isMyTurn && gamePhase === GamePhase.Idle
                ? 'bg-yellow-400 hover:bg-yellow-300 animate-pulse text-black' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isMyTurn ? (
              <>
                <Dice5 size={28} />
                ROLL DICE
              </>
            ) : (
              `Wait: ${activeTeamName}'s Turn`
            )}
          </button>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox icon={Coins} value={team.resources.capital} label="Capital" color="text-yellow-600" max={100} />
        <StatBox icon={Battery} value={team.resources.energy} label="Energy" color="text-orange-500" max={100} />
        <StatBox icon={Handshake} value={team.resources.trust} label="Trust" color="text-blue-500" max={100} />
        <StatBox icon={TrendingUp} value={team.resources.competency} label="Skill" color="text-green-600" max={100} />
        <StatBox icon={Lightbulb} value={team.resources.insight} label="Insight" color="text-purple-600" max={100} />
      </div>
    </div>
  );
};

export default MobileTeamView;