import React, { useEffect, useState } from 'react';
import { GameCard, BoardSquare } from '../types';
import { Target, Lightbulb, Users, User, Sparkles } from 'lucide-react';

interface CompetencyCardPreviewProps {
  visible: boolean;
  card: GameCard | null;
  square: BoardSquare | null;
  onComplete: () => void;
  duration?: number; // 표시 시간 (ms)
}

const CompetencyCardPreview: React.FC<CompetencyCardPreviewProps> = ({
  visible,
  card,
  square,
  onComplete,
  duration = 5000,
}) => {
  const [showSituation, setShowSituation] = useState(false);

  useEffect(() => {
    if (visible && card) {
      // 음향 효과 - 카드 등장
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.15;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        setTimeout(() => audioContext.close(), 600);
      } catch (e) {}

      // duration 후에 상황 카드로 전환
      const timer = setTimeout(() => {
        setShowSituation(true);
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setShowSituation(false);
    }
  }, [visible, card, duration, onComplete]);

  if (!visible || !card) return null;

  const getTypeIcon = () => {
    switch (card.type) {
      case 'Self': return <User size={48} />;
      case 'Team': return <Users size={48} />;
      case 'Leader': return <Target size={48} />;
      case 'Follower': return <Lightbulb size={48} />;
      default: return <Sparkles size={48} />;
    }
  };

  const getTypeColor = () => {
    switch (card.type) {
      case 'Self': return 'from-blue-600 to-blue-900';
      case 'Team': return 'from-green-600 to-green-900';
      case 'Leader': return 'from-red-600 to-red-900';
      case 'Follower': return 'from-orange-600 to-orange-900';
      default: return 'from-purple-600 to-purple-900';
    }
  };

  const getCompetencyName = () => {
    if (square?.name) {
      // 이름에서 한글 부분만 추출
      const match = square.name.match(/^([^(]+)/);
      return match ? match[1].trim() : square.name;
    }
    return card.competency || card.type;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div className={`bg-gradient-to-br ${getTypeColor()} p-8 rounded-2xl border-4 border-white shadow-2xl animate-in zoom-in duration-500 max-w-lg mx-4`}>
        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 p-4 rounded-full text-white">
            {getTypeIcon()}
          </div>
        </div>

        {/* 역량 이름 */}
        <div className="text-center mb-4">
          <div className="text-white/70 text-sm uppercase tracking-widest mb-2">
            {card.type} COMPETENCY
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">
            {getCompetencyName()}
          </h2>
        </div>

        {/* 카드 제목 */}
        <div className="bg-white/10 border-2 border-white/30 rounded-xl p-4 text-center">
          <div className="text-white/70 text-xs uppercase mb-1">Today's Challenge</div>
          <h3 className="text-2xl font-bold text-white">
            {card.title}
          </h3>
        </div>

        {/* 로딩 바 */}
        <div className="mt-6">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white animate-progress"
              style={{
                animation: `progress ${duration}ms linear forwards`,
              }}
            />
          </div>
          <div className="text-center text-white/50 text-sm mt-2">
            상황 카드 로딩 중...
          </div>
        </div>

        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CompetencyCardPreview;
