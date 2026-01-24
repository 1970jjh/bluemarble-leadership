import React from 'react';
import { X, Dice5, MessageSquare, Trophy, Users, Target, Zap, Star, RefreshCw, Eye, Sparkles, Home, Coins } from 'lucide-react';
import { GameVersion } from '../types';

interface GameRulesModalProps {
  visible: boolean;
  onClose: () => void;
  gameMode: GameVersion;
}

const GameRulesModal: React.FC<GameRulesModalProps> = ({
  visible,
  onClose,
  gameMode
}) => {
  if (!visible) return null;

  // 커스텀 모드 제목
  const getModeTitle = () => 'Bluemable Gamification';

  // 커스텀 모드 설명
  const getModeDescription = () => '모든 팀이 동시에 상황에 응답하고, AI가 비교 분석하여 순위를 매기는 경쟁형 교육 시뮬레이션입니다. 31개의 상황 카드와 영토 시스템으로 전략적인 게임을 즐기세요.';

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sticky top-0 z-10 border-b-4 border-black">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">게임 규칙서</div>
              <h2 className="text-2xl font-black">{getModeTitle()}</h2>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors border-2 border-white/50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 게임 소개 */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <Target className="text-blue-600" size={20} />
              게임 소개
            </h3>
            <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              {getModeDescription()}
            </p>
          </section>

          {/* 게임 진행 순서 */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <RefreshCw className="text-green-600" size={20} />
              게임 진행 순서
            </h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-400 text-black w-8 h-8 flex items-center justify-center rounded-full font-black shrink-0">1</div>
                  <div>
                    <div className="font-bold text-gray-800">시작 팀 선택 & 주사위 굴리기 🎲</div>
                    <p className="text-sm text-gray-600 mt-1">
                      관리자가 시작 팀을 선택합니다. 해당 팀이 주사위를 굴려 칸을 이동합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-black shrink-0">2</div>
                  <div>
                    <div className="font-bold text-gray-800">전체 팀 동시 응답 📋</div>
                    <p className="text-sm text-gray-600 mt-1">
                      상황 카드가 공개되면 <strong className="text-blue-700">모든 팀이 동시에</strong> 자신의 답변을 작성합니다.
                      <br />선택지를 고르고 이유를 상세히 작성하세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-black shrink-0">3</div>
                  <div>
                    <div className="font-bold text-gray-800">공개 & AI 비교 분석 ✨</div>
                    <p className="text-sm text-gray-600 mt-1">
                      관리자가 <span className="bg-yellow-200 px-1 font-bold">공개</span> 버튼을 누르면 모든 응답이 공개됩니다.
                      <br /><span className="bg-purple-200 px-1 font-bold">AI 분석</span> 버튼으로 모든 팀의 응답을 비교 분석합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-black shrink-0">4</div>
                  <div>
                    <div className="font-bold text-gray-800">순위 & 점수 부여 🏆</div>
                    <p className="text-sm text-gray-600 mt-1">
                      AI가 팀별 응답을 평가하여 순위를 매기고, 순위에 따른 점수가 부여됩니다.
                      <br /><strong className="text-green-700">1위: 100점</strong>, 순위별 점수 차감
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 순위별 배점 */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              순위별 배점 시스템
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border-2 border-yellow-400">
              <p className="text-gray-700 mb-3">
                팀 수에 따라 꼴등 배점이 달라집니다:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white p-2 rounded border">
                  <strong>2~4팀</strong>: 1위 100점 → 꼴등 50점
                </div>
                <div className="bg-white p-2 rounded border">
                  <strong>5~6팀</strong>: 1위 100점 → 꼴등 40점
                </div>
                <div className="bg-white p-2 rounded border">
                  <strong>7~9팀</strong>: 1위 100점 → 꼴등 20점
                </div>
                <div className="bg-white p-2 rounded border">
                  <strong>10~12팀</strong>: 1위 100점 → 꼴등 10점
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * 점수 = 100 - ((순위 - 1) × 간격)
              </p>
            </div>
          </section>

          {/* 특수 칸 (x2/x3) */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <Zap className="text-yellow-600" size={20} />
              특수 칸 (x2 / x3 배율)
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-red-50 p-4 rounded-lg border-2 border-yellow-400">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-yellow-400 text-black px-3 py-1 font-black rounded">x2</span>
                  <div>
                    <div className="font-bold text-yellow-700">2배 칸 (8, 16, 24번)</div>
                    <p className="text-sm text-gray-600">AI 점수와 통행료가 <strong className="text-yellow-700">2배</strong>로 적용됩니다!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-red-500 text-white px-3 py-1 font-black rounded">x3</span>
                  <div>
                    <div className="font-bold text-red-700">3배 칸 (12, 28번)</div>
                    <p className="text-sm text-gray-600">AI 점수와 통행료가 <strong className="text-red-700">3배</strong>로 적용됩니다!</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 영토 시스템 */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <Home className="text-indigo-600" size={20} />
              영토 소유권 시스템
            </h3>
            <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-300">
              <div className="space-y-3">
                <div>
                  <div className="font-bold text-indigo-800">🏠 영토 획득</div>
                  <p className="text-sm text-gray-600 mt-1">
                    각 라운드에서 <strong>1위 팀</strong>이 해당 칸의 영토 소유권을 획득합니다.
                    <br />영토는 소유 팀의 색상으로 표시됩니다.
                  </p>
                </div>
                <div>
                  <div className="font-bold text-indigo-800">💰 통행료 시스템</div>
                  <p className="text-sm text-gray-600 mt-1">
                    다른 팀이 소유한 칸에 도착하면 <strong className="text-red-600">기본 15포인트</strong>를 통행료로 지불합니다.
                    <br />통행료는 영토 소유자에게 지급됩니다.
                    <br /><span className="text-yellow-700">x2 칸은 30점, x3 칸은 45점!</span>
                  </p>
                </div>
                <div>
                  <div className="font-bold text-indigo-800">🎲 재굴림 기회</div>
                  <p className="text-sm text-gray-600 mt-1">
                    다른 팀 영토에 도착한 팀은 통행료 지불 후 <strong>주사위를 다시 굴려 이동합니다.</strong>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 더블 보너스 */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <Dice5 className="text-yellow-600" size={20} />
              더블 보너스 (주사위 더블)
            </h3>
            <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-400">
              <p className="text-gray-700">
                주사위 두 개가 <strong className="text-yellow-700">같은 숫자</strong>가 나오면 <span className="bg-yellow-400 text-black px-2 py-0.5 rounded font-bold">DOUBLE!</span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                🎲 즉시 <strong className="text-yellow-700">보너스 30점</strong>을 획득합니다!
              </p>
            </div>
          </section>

          {/* 한 바퀴 보너스 */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <Star className="text-amber-500" size={20} />
              한 바퀴 완주 보너스
            </h3>
            <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-400">
              <p className="text-gray-700 mb-3">
                보드를 한 바퀴 돌아 <strong>출발점을 지나거나 도착</strong>하면 보너스를 받습니다!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-300 text-green-900 px-3 py-1 rounded text-sm font-bold">다른 팀에서 각 20점씩 획득!</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * 예: 4팀 게임에서 완주 시 → 다른 3팀에서 각 20점 = 총 60점 획득
              </p>
            </div>
          </section>

          {/* AI 평가 기준 */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles className="text-purple-600" size={20} />
              AI 비교 분석 기준
            </h3>
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
              <p className="text-gray-700 mb-3">AI는 모든 팀의 응답을 비교하여 다음 기준으로 순위를 매깁니다:</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✅ <strong>구체성</strong>: 상세하고 명확한 이유 설명</li>
                <li>✅ <strong>논리성</strong>: 상황에 맞는 합리적 판단</li>
                <li>✅ <strong>창의성</strong>: 다양한 관점과 해결책 제시</li>
                <li>✅ <strong>현실성</strong>: 실제 업무 환경을 고려한 답변</li>
                <li>❌ <strong>성의 없는 답변</strong>: 짧고 모호한 답변은 하위 순위!</li>
              </ul>
              <div className="mt-3 bg-white p-3 rounded border-2 border-purple-200">
                <div className="text-sm font-bold text-purple-700">💡 이럴 땐, 이렇게...</div>
                <p className="text-xs text-gray-600 mt-1">
                  AI 분석 결과에는 상황에 대한 모범적인 접근 방법 가이드도 제공됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* 우승 조건 */}
          <section>
            <h3 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              우승 조건
            </h3>
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-4 rounded-lg border-2 border-yellow-400">
              <p className="text-gray-700 mb-3">
                게임 종료 시 <strong>총 점수</strong>가 가장 높은 팀이 우승합니다!
              </p>
              <div className="text-sm text-gray-600">
                <p>📊 시작 점수: 100점 → AI 평가 점수 + 보너스 - 통행료</p>
                <p className="mt-2">💡 <strong>팁</strong>: 매 라운드 높은 순위를 유지하고, 영토를 확보하여 통행료 수입을 올리세요!</p>
                <p className="mt-1">💡 x2/x3 칸에서 1등을 하면 큰 점수를 얻을 수 있습니다!</p>
              </div>
            </div>
          </section>

        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-100 p-4 border-t-4 border-black">
          <button
            onClick={onClose}
            className="w-full py-3 bg-black text-white font-black uppercase hover:bg-gray-800 transition-colors"
          >
            규칙서 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameRulesModal;
