import React, { useState } from 'react';

interface IntroProps {
  onAdminLogin: () => void;
  onUserJoin: () => void;
}

const Intro: React.FC<IntroProps> = ({ onAdminLogin, onUserJoin }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '6749467') {
      onAdminLogin();
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-8">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-2 italic break-keep leading-tight">
          리더십<br/>보드 아카데미
        </h1>
        <p className="text-center text-gray-500 font-bold mb-8 text-sm">
          by JJ CREATIVE 교육연구소
        </p>

        {!isAdminMode ? (
          <div className="space-y-4">
            <button 
              onClick={onUserJoin}
              className="w-full py-4 bg-yellow-400 border-4 border-black text-xl font-black shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] transition-all"
            >
              게임 참여 (참가자용)
            </button>
            <button 
              onClick={() => setIsAdminMode(true)}
              className="w-full py-4 bg-gray-200 border-4 border-black text-xl font-black shadow-hard hover:bg-gray-300 transition-all"
            >
              관리자 로그인
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-2 uppercase">관리자 비밀번호</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-4 border-black font-mono text-xl focus:outline-none focus:bg-yellow-50"
                placeholder="비밀번호 입력"
                autoFocus
              />
              {error && <p className="text-red-600 font-bold mt-2">{error}</p>}
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsAdminMode(false)}
                className="flex-1 py-3 bg-gray-200 border-4 border-black font-bold"
              >
                뒤로가기
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-black text-white border-4 border-black font-bold hover:bg-gray-800"
              >
                로그인
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Intro;