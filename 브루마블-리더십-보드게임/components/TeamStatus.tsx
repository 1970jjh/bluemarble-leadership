import React from 'react';
import { Team, TeamColor } from '../types';
import { Battery, Coins, Star, Handshake, TrendingUp, Lightbulb } from 'lucide-react';

interface TeamStatusProps {
  team: Team;
  active: boolean;
}

const TeamStatus: React.FC<TeamStatusProps> = ({ team, active }) => {
  const getHeaderColor = (color: TeamColor) => {
    switch (color) {
      case TeamColor.Red: return 'bg-red-600 text-white';
      case TeamColor.Blue: return 'bg-blue-600 text-white';
      case TeamColor.Green: return 'bg-green-600 text-white';
      case TeamColor.Yellow: return 'bg-yellow-400 text-black';
    }
  };

  const ResourceBar = ({ value, max, color, icon: Icon, label }: any) => {
    // Determine bar visual width percentage (clamped 0-100)
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs font-bold text-black mb-1 uppercase tracking-tighter">
          <span className="flex items-center gap-1"><Icon size={12} className="stroke-[3]" /> {label}</span>
          {/* Display actual value even if negative or > 100 */}
          <span className={`font-mono ${value < 0 ? 'text-red-600' : ''}`}>{value}/{max}</span>
        </div>
        <div className="h-3 w-full bg-white border-2 border-black relative">
          <div 
            className={`h-full ${color} absolute top-0 left-0 border-r-2 border-black transition-all duration-300`} 
            style={{ width: `${percentage}%` }} 
          />
          {value > max && (
            <div className="absolute top-[-4px] right-0 text-[10px] font-black text-red-600 animate-pulse bg-white border border-black px-1">
              {value}
            </div>
          )}
          {value < 0 && (
             <div className="absolute top-0 left-0 w-full h-full bg-red-100/50 flex items-center justify-center text-[8px] font-black text-red-600">
                NEGATIVE
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`border-4 border-black bg-white transition-all duration-300 ${active ? 'shadow-hard translate-x-[-2px] translate-y-[-2px]' : 'opacity-90'}`}>
      <div className={`p-2 border-b-4 border-black flex justify-between items-center ${getHeaderColor(team.color)}`}>
        <h3 className="font-black text-lg uppercase truncate">{team.name}</h3>
        {team.isBurnout && <span className="bg-black text-white text-[10px] px-2 py-0.5 font-bold">BURNOUT</span>}
        {active && <span className="text-xl animate-bounce">▼</span>}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Capital Display */}
        <div className="mb-2">
          <div className="flex justify-between text-xs font-bold text-black mb-1 uppercase tracking-tighter">
            <span className="flex items-center gap-1"><Coins size={12} className="stroke-[3]" /> Capital</span>
            <span className={`font-mono ${team.resources.capital < 0 ? 'text-red-600' : ''}`}>{team.resources.capital}/100</span>
          </div>
          <div className="h-3 w-full bg-white border-2 border-black relative">
            <div 
              className="h-full bg-yellow-400 absolute top-0 left-0 border-r-2 border-black transition-all duration-300" 
              style={{ width: `${Math.min(100, Math.max(0, (team.resources.capital / 100) * 100))}%` }} 
            />
            {team.resources.capital < 0 && (
               <div className="absolute inset-0 bg-red-100/50 flex items-center justify-center text-[9px] font-bold text-red-600">DEBT</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <ResourceBar value={team.resources.energy} max={100} color="bg-orange-500" icon={Battery} label="Energy" />
          <ResourceBar value={team.resources.trust} max={100} color="bg-blue-400" icon={Handshake} label="Trust" />
          <ResourceBar value={team.resources.competency} max={100} color="bg-green-500" icon={TrendingUp} label="Skill" />
          <ResourceBar value={team.resources.insight} max={100} color="bg-purple-500" icon={Lightbulb} label="Insight" />
        </div>
      </div>
    </div>
  );
};

export default TeamStatus;