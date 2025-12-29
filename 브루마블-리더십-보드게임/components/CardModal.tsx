import React, { useEffect, useRef } from 'react';
import { Choice, GameCard, AIEvaluationResult } from '../types';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';

interface CardModalProps {
  card: GameCard;
  visible: boolean;
  timeLeft: number;

  // Controlled State
  selectedChoice: Choice | null;
  reasoning: string;
  onSelectionChange: (c: Choice) => void;
  onReasoningChange: (s: string) => void;
  onSubmit: () => Promise<void>;

  result: AIEvaluationResult | null;
  isProcessing: boolean;
  onClose?: () => void;

  // 추가: 읽기 전용 모드 (다른 팀 턴 뷰어 모드)
  readOnly?: boolean;
  // 추가: 현재 팀 이름 표시
  teamName?: string;
  // 추가: 미리보기 모드 (게임에 반영 안됨)
  isPreviewMode?: boolean;

  // 관리자 뷰용 추가 props
  isAdminView?: boolean;        // 관리자 대시보드 뷰 여부
  isTeamSaved?: boolean;        // 팀이 입력을 저장했는지
  onAISubmit?: () => Promise<void>;  // 관리자가 AI 분석 실행
}

const CardModal: React.FC<CardModalProps> = ({
  card,
  visible,
  timeLeft,
  selectedChoice,
  reasoning,
  onSelectionChange,
  onReasoningChange,
  onSubmit,
  result,
  isProcessing,
  onClose,
  readOnly = false,
  teamName,
  isPreviewMode = false,
  isAdminView = false,
  isTeamSaved = false,
  onAISubmit
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isOpenEnded = !card.choices || card.choices.length === 0;

  useEffect(() => {
    if (visible && !result) {
      if (isOpenEnded) {
         textareaRef.current?.focus();
      } else if (selectedChoice) {
         textareaRef.current?.focus();
      }
    }
  }, [selectedChoice, visible, result, isOpenEnded]);

  if (!visible) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Self': return 'bg-blue-900 text-white';
      case 'Team': return 'bg-green-800 text-white';
      case 'Leader': return 'bg-red-800 text-white';
      case 'Follower': return 'bg-orange-700 text-white';
      case 'Challenge': return 'bg-purple-900 text-white';
      case 'CoreValue': return 'bg-indigo-900 text-white';
      default: return 'bg-yellow-400 text-black';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Allow submit if open ended OR if choice is selected
      if ((isOpenEnded || selectedChoice) && reasoning.trim() && !isProcessing) {
        onSubmit();
      }
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    return score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl border-4 border-black shadow-[16px_16px_0px_0px_rgba(255,255,255,0.2)] animate-in fade-in zoom-in duration-200 relative flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute -top-6 -right-6 bg-red-600 text-white border-4 border-black p-2 shadow-hard hover:bg-red-500 hover:scale-110 transition-transform z-50"
          >
            <X size={24} strokeWidth={4} />
          </button>
        )}

        {/* Header */}
        <div className={`p-6 ${getTypeColor(card.type)} border-b-4 border-black flex justify-between items-center shrink-0`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase">
                {card.type === 'CoreValue' ? 'CORE VALUE' : card.type}
              </div>
              {isPreviewMode && (
                <div className="inline-block bg-orange-500 text-white px-2 py-1 text-xs font-bold uppercase animate-pulse">
                  PREVIEW MODE
                </div>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{card.title}</h2>
          </div>
          {!result && timeLeft > 0 && (
            <div className="bg-white text-black border-4 border-black px-4 py-2 shadow-hard-sm">
               <span className="text-xl md:text-2xl font-mono font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Situation Section */}
          <div className="mb-8 border-l-8 border-gray-300 pl-6">
            <h3 className="text-black text-sm font-bold uppercase mb-2 tracking-widest">Situation</h3>
            <p className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
              "{card.situation}"
            </p>
          </div>

          {!result ? (
            /* Input Phase */
            <div className="space-y-6">
              {/* 미리보기 모드 안내 */}
              {isPreviewMode && (
                <div className="bg-orange-100 border-4 border-orange-500 p-4 text-center">
                  <span className="font-bold text-orange-800">
                    🔍 미리보기 모드 - AI 평가 결과는 게임에 반영되지 않습니다
                  </span>
                </div>
              )}

              {/* 읽기 전용 모드 안내 */}
              {readOnly && !isPreviewMode && !isAdminView && (
                <div className="bg-yellow-100 border-4 border-yellow-500 p-4 text-center">
                  <span className="font-bold text-yellow-800">
                    {teamName ? `${teamName}의 턴입니다. 관람 모드로 시청 중...` : '다른 팀의 턴입니다.'}
                  </span>
                </div>
              )}

              {/* 관리자 뷰: 팀 입력 대기 중 */}
              {isAdminView && !isTeamSaved && (
                <div className="bg-blue-100 border-4 border-blue-500 p-8 text-center">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold text-blue-800 text-lg">
                      {teamName ? `${teamName}이(가) 입력 중입니다...` : '팀 입력 대기 중...'}
                    </span>
                    <p className="text-blue-600 mt-2 text-sm">팀원이 선택과 사유를 입력하고 저장하면 여기에 표시됩니다.</p>
                  </div>
                </div>
              )}

              {/* 관리자 뷰: 팀 입력 완료 - 팀 응답 표시 + AI 분석 버튼 */}
              {isAdminView && isTeamSaved && (
                <>
                  <div className="bg-green-100 border-4 border-green-600 p-4 text-center mb-4">
                    <span className="font-bold text-green-800">
                      ✓ {teamName || '팀'}의 입력이 완료되었습니다!
                    </span>
                  </div>

                  {/* 선택한 옵션 표시 */}
                  {selectedChoice && (
                    <div className="bg-blue-50 border-4 border-blue-300 p-4">
                      <div className="text-xs font-bold text-blue-700 uppercase mb-2">선택한 옵션</div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-3 py-1 text-sm font-bold">{selectedChoice.id}</span>
                        <span className="font-bold text-lg">{selectedChoice.text}</span>
                      </div>
                    </div>
                  )}

                  {/* 응답 내용 표시 */}
                  <div className="bg-gray-50 border-4 border-gray-300 p-4">
                    <div className="text-xs font-bold text-gray-700 uppercase mb-2">
                      {selectedChoice ? '선택 이유' : '응답 내용'}
                    </div>
                    <p className="font-medium text-lg whitespace-pre-wrap">{reasoning || '(응답 없음)'}</p>
                  </div>

                  {/* AI 분석 버튼 (관리자 전용) */}
                  {onAISubmit && (
                    <button
                      onClick={onAISubmit}
                      disabled={isProcessing}
                      className="w-full py-4 bg-purple-600 text-white text-xl font-black uppercase border-4 border-black hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all shadow-hard"
                    >
                      {isProcessing ? (
                        <>
                          <Sparkles className="animate-spin" /> AI 분석 중...
                        </>
                      ) : (
                        <>
                          <Sparkles size={24} /> AI 분석 실행
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              {/* 일반 뷰 (팀원/미리보기): 선택지 및 입력 UI */}
              {!isAdminView && (
                <>
                  {!isOpenEnded ? (
                    <>
                      <h3 className="text-black text-sm font-bold uppercase tracking-widest">1. 당신의 선택은?</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {card.choices?.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => !readOnly && onSelectionChange(choice)}
                            disabled={readOnly}
                            className={`group relative flex flex-col items-start p-4 border-4 transition-all text-left h-full
                              ${selectedChoice?.id === choice.id
                                ? 'border-blue-600 bg-blue-50 shadow-hard transform -translate-y-1'
                                : 'border-black hover:bg-gray-50'
                              }
                              ${readOnly ? 'cursor-not-allowed opacity-70' : ''}
                            `}
                          >
                            <div className={`absolute top-0 right-0 px-3 py-1 text-sm font-bold border-b-2 border-l-2
                              ${selectedChoice?.id === choice.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-black text-white border-black'}`}>
                              {choice.id}
                            </div>
                            <h4 className="text-lg font-bold mt-6 leading-tight">{choice.text}</h4>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-purple-900 font-bold bg-purple-100 p-4 border-2 border-purple-900">
                      <MessageSquare />
                      <span>이 질문은 주관식 답변입니다. 자유롭게 의견을 서술해주세요.</span>
                    </div>
                  )}

                  <div className={`transition-all duration-300 ${isOpenEnded || selectedChoice ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <h3 className="text-black text-sm font-bold uppercase tracking-widest mb-2 mt-6">
                        {isOpenEnded ? "2. 당신의 생각은?" : "2. 선택 이유는?"}
                      </h3>
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={reasoning}
                          onChange={(e) => !readOnly && onReasoningChange(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={readOnly ? "다른 팀이 입력 중..." : (isOpenEnded ? "여기에 답변을 입력하세요..." : (selectedChoice ? "팀이 모바일에서 입력중일 수 있습니다..." : "먼저 선택지를 고르세요."))}
                          className={`w-full h-32 p-4 border-4 border-black font-medium focus:outline-none focus:bg-yellow-50 resize-none text-lg ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          disabled={isProcessing || readOnly}
                          readOnly={readOnly}
                        />
                      </div>

                      {!readOnly && (
                        <button
                          onClick={onSubmit}
                          disabled={(!isOpenEnded && !selectedChoice) || !reasoning.trim() || isProcessing}
                          className="w-full mt-4 py-4 bg-black text-white text-xl font-black uppercase border-4 border-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
                        >
                          {isProcessing ? (
                            <>
                              <Sparkles className="animate-spin" /> AI Processing...
                            </>
                          ) : (
                            <>
                              <Send size={20} /> AI 리더의 평가(클릭)
                            </>
                          )}
                        </button>
                      )}

                      {readOnly && isProcessing && (
                        <div className="w-full mt-4 py-4 bg-gray-600 text-white text-xl font-black uppercase border-4 border-black flex items-center justify-center gap-3">
                          <Sparkles className="animate-spin" /> AI 평가 중...
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Result Phase - 응답 내용 + AI 결과 표시 */
            <div className="animate-in fade-in zoom-in duration-300 space-y-6">

               {/* 팀 응답 내용 표시 */}
               <div className="bg-blue-50 border-4 border-blue-900 p-6">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="bg-blue-900 text-white p-2 rounded-full"><MessageSquare size={20} /></div>
                   <h3 className="text-lg font-black uppercase text-blue-900">
                     {teamName ? `${teamName}의 응답` : '팀 응답'}
                   </h3>
                 </div>

                 {/* 선택한 옵션 표시 */}
                 {selectedChoice && (
                   <div className="mb-4">
                     <div className="text-xs font-bold text-blue-700 uppercase mb-1">선택한 옵션</div>
                     <div className="bg-white border-2 border-blue-300 p-3 font-bold">
                       <span className="bg-blue-900 text-white px-2 py-0.5 text-xs mr-2">{selectedChoice.id}</span>
                       {selectedChoice.text}
                     </div>
                   </div>
                 )}

                 {/* 응답 내용 표시 */}
                 <div>
                   <div className="text-xs font-bold text-blue-700 uppercase mb-1">
                     {selectedChoice ? '선택 이유' : '응답 내용'}
                   </div>
                   <div className="bg-white border-2 border-blue-300 p-3 font-medium whitespace-pre-wrap">
                     {reasoning || '(응답 내용 없음)'}
                   </div>
                 </div>
               </div>

               {/* AI 평가 결과 */}
               <div className="bg-gray-100 border-4 border-black p-6">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="bg-black text-white p-2 rounded-full"><Sparkles size={24} /></div>
                   <h3 className="text-xl font-black uppercase">AI Evaluation Result</h3>
                 </div>
                 <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap mb-6">
                   {result.feedback}
                 </p>

                 <div className="grid grid-cols-2 md:grid-cols-5 gap-2 border-t-2 border-gray-300 pt-4">
                   {['Capital', 'Energy', 'Trust', 'Competency', 'Insight'].map((label, i) => {
                      const key = label.toLowerCase() as keyof typeof result.scoreChanges;
                      const val = result.scoreChanges[key];
                      return (
                         <div key={label} className="text-center p-2 border-2 border-black bg-white">
                            <div className="text-[10px] uppercase font-bold text-gray-500">{label}</div>
                            <div className={`text-xl font-black ${getScoreColor(val)}`}>
                              {val ? (val > 0 ? `+${val}` : val) : '-'}
                            </div>
                         </div>
                      )
                   })}
                 </div>
               </div>

               {/* 미리보기 모드일 때 */}
               {isPreviewMode && onClose && (
                 <>
                   <div className="bg-orange-100 border-4 border-orange-500 p-4 text-center mb-4">
                     <span className="font-bold text-orange-800">
                       ⚠️ 미리보기 모드 - 이 결과는 게임에 반영되지 않습니다
                     </span>
                   </div>
                   <button onClick={onClose} className="w-full py-4 bg-gray-700 text-white font-black text-xl border-4 border-black hover:bg-gray-600 shadow-hard">
                     닫기
                   </button>
                 </>
               )}

               {/* 읽기 전용 모드가 아니고 미리보기 모드도 아닐 때 버튼 표시 */}
               {!readOnly && !isPreviewMode && onClose && (
                 <button onClick={onClose} className="w-full py-4 bg-blue-900 text-white font-black text-xl border-4 border-black hover:bg-blue-800 shadow-hard">
                   ACCEPT & CONTINUE
                 </button>
               )}

               {/* 읽기 전용 모드일 때 */}
               {readOnly && (
                 <div className="text-center py-4 bg-gray-200 border-4 border-gray-400 font-bold text-gray-600">
                   다른 팀의 턴을 관람 중입니다
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardModal;