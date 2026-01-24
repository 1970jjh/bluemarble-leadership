import React, { useState, useRef, useEffect } from 'react';
import { GameCard, Choice, Team, TeamResponse, AIComparativeResult } from '../types';
import { Send, CheckCircle2, Clock, Trophy, Users, Eye, Loader2 } from 'lucide-react';

interface SimultaneousResponseViewProps {
  card: GameCard;
  team: Team;
  myResponse?: TeamResponse;
  isRevealed: boolean;
  allResponses: { [teamId: string]: TeamResponse };
  allTeams: Team[];
  aiResult: AIComparativeResult | null;
  onSubmit: (choice: Choice | null, reasoning: string) => void;
  onClose: () => void;
}

const SimultaneousResponseView: React.FC<SimultaneousResponseViewProps> = ({
  card,
  team,
  myResponse,
  isRevealed,
  allResponses,
  allTeams,
  aiResult,
  onSubmit,
  onClose
}) => {
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(myResponse?.selectedChoice || null);
  const [reasoning, setReasoning] = useState(myResponse?.reasoning || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOpenEnded = !card.choices || card.choices.length === 0;
  const isSubmitted = myResponse?.isSubmitted || false;

  useEffect(() => {
    if (!isSubmitted && !aiResult) {
      textareaRef.current?.focus();
    }
  }, [isSubmitted, aiResult]);

  const handleSubmit = () => {
    if (isOpenEnded && !reasoning.trim()) return;
    if (!isOpenEnded && (!selectedChoice || !reasoning.trim())) return;
    onSubmit(selectedChoice, reasoning);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Self': return 'bg-blue-900 text-white';
      case 'Team': return 'bg-green-800 text-white';
      case 'Leader': return 'bg-red-800 text-white';
      default: return 'bg-yellow-400 text-black';
    }
  };

  // 내 팀 랭킹 찾기
  const myRanking = aiResult?.rankings.find(r => r.teamId === team.id);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-200 relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className={`p-4 ${getTypeColor(card.type)} border-b-4 border-black`}>
          <div className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase mb-2">
            {card.type}
          </div>
          <h2 className="text-2xl font-black uppercase">{card.title}</h2>
          <div className="mt-2 bg-white/20 px-3 py-1 inline-block rounded">
            <span className="font-bold">{team.name}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* 상황 설명 */}
          <div className="mb-6 border-l-4 border-gray-300 pl-4">
            <p className="text-lg font-bold text-gray-900">"{card.situation}"</p>
          </div>

          {/* AI 결과 표시 */}
          {aiResult && (
            <div className="mb-6">
              {/* 내 결과 */}
              {myRanking && (
                <div className={`p-4 rounded-lg border-4 mb-4 ${
                  myRanking.rank === 1 ? 'bg-yellow-100 border-yellow-500' :
                  myRanking.rank === 2 ? 'bg-gray-100 border-gray-400' :
                  myRanking.rank === 3 ? 'bg-orange-100 border-orange-400' :
                  'bg-white border-gray-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Trophy size={24} className={
                        myRanking.rank === 1 ? 'text-yellow-600' :
                        myRanking.rank === 2 ? 'text-gray-500' :
                        myRanking.rank === 3 ? 'text-orange-500' : 'text-gray-400'
                      } />
                      <span className="text-2xl font-black">#{myRanking.rank}</span>
                      <span className="font-bold">{team.name}</span>
                    </div>
                    <span className={`text-xl font-black px-3 py-1 rounded ${
                      myRanking.rank === 1 ? 'bg-yellow-500 text-white' :
                      myRanking.rank === 2 ? 'bg-gray-400 text-white' :
                      myRanking.rank === 3 ? 'bg-orange-400 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      +{myRanking.score}점
                    </span>
                  </div>
                  <p className="text-gray-700">{myRanking.feedback}</p>
                </div>
              )}

              {/* 전체 랭킹 */}
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                <div className="text-sm font-bold text-gray-600 uppercase mb-3 flex items-center gap-2">
                  <Users size={16} /> 전체 랭킹
                </div>
                <div className="space-y-2">
                  {aiResult.rankings.sort((a, b) => a.rank - b.rank).map(r => (
                    <div
                      key={r.teamId}
                      className={`flex items-center justify-between p-2 rounded ${
                        r.teamId === team.id ? 'bg-blue-100 border border-blue-400' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">#{r.rank}</span>
                        <span className={r.teamId === team.id ? 'font-bold text-blue-800' : ''}>{r.teamName}</span>
                      </div>
                      <span className="font-bold text-green-600">+{r.score}점</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 가이드 */}
              <div className="mt-4 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-400">
                <div className="text-xs font-bold text-yellow-700 uppercase mb-2">Best Practice</div>
                <p className="text-gray-800">{aiResult.guidance}</p>
              </div>
            </div>
          )}

          {/* 응답 공개됨 (AI 결과 없을 때) */}
          {isRevealed && !aiResult && (
            <div className="mb-6 bg-blue-50 border-4 border-blue-400 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={18} className="text-blue-600" />
                <span className="font-bold text-blue-800">모든 팀 응답 공개됨</span>
              </div>
              <p className="text-blue-700 text-sm">관리자가 AI 비교 분석을 실행할 때까지 기다려주세요...</p>
            </div>
          )}

          {/* 제출 완료 (공개 전) */}
          {isSubmitted && !isRevealed && !aiResult && (
            <div className="mb-6 bg-green-100 border-4 border-green-500 p-4 rounded-lg text-center">
              <CheckCircle2 size={48} className="text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-800 text-lg">응답이 제출되었습니다!</div>
              <p className="text-green-700 text-sm mt-2">다른 팀의 응답을 기다리는 중...</p>

              {/* 팀 응답 현황 */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {allTeams.map(t => {
                  const resp = allResponses[t.id];
                  const submitted = resp?.isSubmitted;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                        submitted ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                      }`}
                    >
                      {submitted ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {t.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 입력 폼 (제출 전) */}
          {!isSubmitted && !aiResult && (
            <>
              {/* 옵션 선택 */}
              {!isOpenEnded && card.choices && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">1. 선택</h3>
                  <div className="space-y-2">
                    {card.choices.map(choice => (
                      <button
                        key={choice.id}
                        onClick={() => setSelectedChoice(choice)}
                        className={`w-full p-4 text-left border-4 transition-all ${
                          selectedChoice?.id === choice.id
                            ? 'bg-blue-100 border-blue-600 shadow-md'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className={`inline-block px-3 py-1 text-sm font-bold mr-2 ${
                          selectedChoice?.id === choice.id ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}>
                          {choice.id}
                        </span>
                        <span className="font-medium">{choice.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 선택 이유 */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">
                  {isOpenEnded ? '답변 작성' : '2. 선택 이유'}
                </h3>
                <textarea
                  ref={textareaRef}
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder={isOpenEnded ? "자유롭게 답변을 작성하세요..." : "왜 이 선택을 했는지 설명해주세요..."}
                  className="w-full p-4 border-4 border-gray-300 focus:border-blue-500 focus:outline-none resize-none h-32 font-medium"
                />
              </div>

              {/* 제출 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={isOpenEnded ? !reasoning.trim() : !selectedChoice || !reasoning.trim()}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xl font-black uppercase border-4 border-black flex items-center justify-center gap-3 transition-all shadow-hard"
              >
                <Send size={24} /> 응답 제출
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimultaneousResponseView;
