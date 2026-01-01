import React, { useEffect, useState } from 'react';
import Dice3D from './Dice3D';
import { X } from 'lucide-react';

interface DiceResultOverlayProps {
  visible: boolean;
  dice1: number;
  dice2: number;
  isRolling: boolean;
  onRollComplete: () => void;
  onShowResultComplete: () => void;
  isDouble?: boolean;
}

const DiceResultOverlay: React.FC<DiceResultOverlayProps> = ({
  visible,
  dice1,
  dice2,
  isRolling,
  onRollComplete,
  onShowResultComplete,
  isDouble = false,
}) => {
  const [showTotal, setShowTotal] = useState(false);
  const [rollCompleteCount, setRollCompleteCount] = useState(0);

  useEffect(() => {
    if (!visible) {
      setShowTotal(false);
      setRollCompleteCount(0);
    }
  }, [visible]);

  const handleSingleRollComplete = () => {
    setRollCompleteCount(prev => prev + 1);
  };

  useEffect(() => {
    // 두 주사위 모두 완료되면
    if (rollCompleteCount >= 2 && !showTotal) {
      // 음향 효과 - 결과 공개
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.2;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        setTimeout(() => audioContext.close(), 500);
      } catch (e) {}

      onRollComplete();
      setShowTotal(true);

      // 3초 후 결과 표시 완료
      setTimeout(() => {
        onShowResultComplete();
      }, 3000);
    }
  }, [rollCompleteCount, showTotal, onRollComplete, onShowResultComplete]);

  if (!visible) return null;

  const total = dice1 + dice2;

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
      {/* 건너뛰기 버튼 (결과 표시 중에만) */}
      {showTotal && (
        <button
          onClick={onShowResultComplete}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all border-2 border-white/30"
          title="건너뛰기"
        >
          <X size={24} />
        </button>
      )}

      {/* 3D 주사위 */}
      <div className="flex gap-8 mb-8">
        <Dice3D
          value={dice1}
          rolling={isRolling}
          onRollComplete={handleSingleRollComplete}
          size={120}
        />
        <Dice3D
          value={dice2}
          rolling={isRolling}
          onRollComplete={handleSingleRollComplete}
          size={120}
        />
      </div>

      {/* 결과 표시 */}
      {showTotal && (
        <div className="animate-in zoom-in duration-500">
          <div className="text-center">
            <div className="text-white text-2xl font-bold mb-4">
              {dice1} + {dice2} =
            </div>
            <div className={`text-9xl font-black ${isDouble ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
              {total}
            </div>
            {isDouble && (
              <div className="mt-4 text-yellow-400 text-3xl font-black animate-bounce">
                DOUBLE! BONUS!
              </div>
            )}
            <div className="mt-4 text-gray-400 text-lg">
              {total}칸 이동합니다
            </div>
          </div>
        </div>
      )}

      {/* 롤링 중 텍스트 */}
      {isRolling && (
        <div className="text-white text-2xl font-black animate-pulse">
          주사위를 굴리는 중...
        </div>
      )}
    </div>
  );
};

export default DiceResultOverlay;
