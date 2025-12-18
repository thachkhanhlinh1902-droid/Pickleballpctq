
import React, { useState, useEffect } from 'react';
import { TournamentData, CategoryKey, Team, Match, Group } from '../types';
import { calculateGroupRanking } from '../utils/logic';
import { Trophy, Crown, Zap, Heart, Users, Play, Pause, Maximize2, Medal, Clock, MapPin } from 'lucide-react';
import { TournamentBracket } from './TournamentBracket';

interface Props {
  data: TournamentData;
}

const CATEGORIES: { key: CategoryKey, label: string, icon: any, color: string }[] = [
    { key: 'lanhdao', label: 'LÃNH ĐẠO', icon: Crown, color: 'text-yellow-600' },
    { key: 'nam', label: 'ĐÔI NAM', icon: Zap, color: 'text-blue-600' },
    { key: 'nu', label: 'ĐÔI NỮ', icon: Heart, color: 'text-rose-600' },
    { key: 'namnu', label: 'NAM NỮ', icon: Users, color: 'text-purple-600' },
];

const AUTO_ROTATE_INTERVAL = 60000; // Tăng lên 1 phút (60,000ms)

const DenseMatchRow: React.FC<{ match: Match, teams: Team[] }> = ({ match, teams }) => {
    const tA = teams.find(t => t.id === match.teamAId);
    const tB = teams.find(t => t.id === match.teamBId);
    if (!tA && !tB) return null;

    const isFinished = match.isFinished;
    
    const TeamInfo = ({ team, align }: { team: Team | undefined, align: 'right' | 'left' }) => {
        const isWinner = isFinished && match.winnerId === team?.id;
        return (
            <div className={`flex-[2.5] ${align === 'right' ? 'text-right pr-2' : 'text-left pl-2'} min-w-0 flex flex-col justify-center`}>
                <div className={`text-[10px] sm:text-[11px] font-black leading-tight ${isWinner ? 'text-blue-700' : 'text-slate-800'}`}>
                    <div className="truncate">{team?.name1}</div>
                    <div className="truncate">{team?.name2}</div>
                </div>
                <div className={`text-[7px] sm:text-[8px] italic truncate leading-none mt-0.5 font-bold uppercase ${isWinner ? 'text-blue-500' : 'text-slate-400'}`}>
                    {team?.org}
                </div>
            </div>
        );
    };

    return (
        <div className={`flex items-stretch border-b border-gray-100 py-2 px-1 ${isFinished ? 'bg-slate-50' : 'bg-white'}`}>
            <TeamInfo team={tA} align="right" />

            <div className="flex flex-col items-center justify-center shrink-0 min-w-[90px] px-1 border-x border-slate-100">
                <div className="text-[7px] font-black text-blue-500 leading-none mb-1.5 whitespace-nowrap uppercase">{match.time || '--:--'}</div>
                {/* Scoreboard style with high contrast */}
                <div className={`w-full py-1 rounded-md font-mono font-black text-center text-[11px] shadow-sm border ${isFinished ? 'bg-slate-900 text-yellow-400 border-slate-950' : 'bg-blue-50 text-blue-900 border-blue-100'}`}>
                    {isFinished ? `${match.score.set1.a}-${match.score.set1.b}` : 'VS'}
                </div>
                <div className="text-[6px] font-black text-orange-600 mt-1.5 leading-none uppercase tracking-tighter">{match.court || 'CHƯA RÕ'}</div>
            </div>

            <TeamInfo team={tB} align="left" />
        </div>
    );
};

const DenseGroupCard: React.FC<{ group: Group, matches: Match[], teams: Team[], color: string }> = ({ group, matches, teams, color }) => {
    const ranking = calculateGroupRanking(teams, matches, group.id);
    const groupMatches = matches.filter(m => m.groupId === group.id).sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0));

    return (
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-slate-900 py-1.5 border-b border-gray-200 text-center shrink-0">
                <span className={`font-black text-[11px] uppercase tracking-widest text-white`}>BẢNG {group.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
                <div className="w-full sm:w-[48%] border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto custom-scrollbar bg-white">
                    <table className="w-full table-fixed">
                        <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[7px] sticky top-0 z-10 border-b">
                            <tr>
                                <th className="py-2 w-5 text-center">#</th>
                                <th className="py-2 text-left px-1">ĐỘI</th>
                                <th className="py-2 w-5 text-center text-blue-700">Đ</th>
                                <th className="py-2 w-4 text-center text-green-600">T</th>
                                <th className="py-2 w-4 text-center text-red-500">B</th>
                                <th className="py-2 w-5 text-center">HS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((t, i) => (
                                <tr key={t.id} className={`border-b border-gray-50 ${i < 2 ? 'bg-yellow-50/50' : ''}`}>
                                    <td className="text-center font-black text-[10px] py-2 text-slate-400">{i + 1}</td>
                                    <td className="px-1 py-2 min-w-0">
                                        <div className="font-black text-[10px] leading-tight text-slate-800">
                                            <div className="truncate">{t.name1}</div>
                                            <div className="truncate">{t.name2}</div>
                                        </div>
                                        <div className="text-[7px] text-slate-400 font-bold uppercase truncate leading-none mt-0.5 italic">{t.org}</div>
                                    </td>
                                    <td className="text-center font-black text-blue-700 text-[10px] bg-blue-50/50">{t.stats?.points}</td>
                                    <td className="text-center font-bold text-green-600 text-[9px]">{t.stats?.won}</td>
                                    <td className="text-center font-bold text-red-500 text-[9px]">{t.stats?.lost}</td>
                                    <td className="text-center font-mono font-bold text-slate-500 text-[8px]">{t.stats?.pointsDiff}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex-1 bg-white overflow-y-auto custom-scrollbar">
                    {groupMatches.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-300 text-[8px] uppercase font-bold italic">Chưa có lịch đấu</div>
                    ) : groupMatches.map(m => <DenseMatchRow key={m.id} match={m} teams={teams} />)}
                </div>
            </div>
        </div>
    );
};

export const SummaryDashboard: React.FC<Props> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stage, setStage] = useState<'group' | 'playoff'>('group');
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
      if (isPaused) return;
      const step = 100; 
      const increment = (step / AUTO_ROTATE_INTERVAL) * 100;
      const timer = setInterval(() => {
          setProgress(prev => {
              if (prev >= 100) {
                  setActiveIndex(old => (old + 1) % CATEGORIES.length);
                  return 0;
              }
              return prev + increment;
          });
      }, step);
      return () => clearInterval(timer);
  }, [isPaused, activeIndex]);

  const activeCatConfig = CATEGORIES[activeIndex];
  const catData = data.categories[activeCatConfig.key];
  const knockoutMatches = catData.matches.filter(m => !m.groupId);

  const containerClass = isFullScreen 
    ? "fixed inset-0 z-[100] bg-slate-100 h-screen w-screen flex flex-col" 
    : "relative w-full h-[calc(100vh-140px)] bg-slate-100 rounded-xl border border-gray-300 flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
        <div className="h-10 bg-white border-b border-gray-200 flex justify-between items-center px-4 shrink-0 overflow-x-auto hide-scrollbar relative">
             <div className="flex items-center gap-1 min-w-max">
                 {CATEGORIES.map((cat, idx) => (
                     <button key={cat.key} onClick={() => { setActiveIndex(idx); setProgress(0); }} className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${activeIndex === idx ? `${cat.color.replace('text-', 'bg-')} text-white shadow-sm` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        <cat.icon size={12} />
                        <span className="text-[9px] font-black uppercase">{cat.label}</span>
                     </button>
                 ))}
                 <div className="w-px h-5 bg-gray-200 mx-2"></div>
                 <div className="flex bg-slate-100 p-0.5 rounded">
                     <button onClick={() => setStage('group')} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${stage === 'group' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Bảng Đấu</button>
                     <button onClick={() => setStage('playoff')} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${stage === 'playoff' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}>Nhánh Playoff</button>
                 </div>
             </div>
             <div className="flex items-center gap-3 shrink-0 ml-4">
                 <button onClick={() => setIsPaused(!isPaused)} className="text-slate-300">{isPaused ? <Play size={14} fill="currentColor"/> : <Pause size={14} fill="currentColor"/>}</button>
                 <button onClick={() => setIsFullScreen(!isFullScreen)} className="text-slate-400"><Maximize2 size={14}/></button>
             </div>
             <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all ease-linear" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex-1 bg-slate-100 overflow-hidden">
            {stage === 'group' ? (
                <div className={`p-1.5 grid gap-2 h-full grid-cols-1 ${catData.groups.length > 2 ? 'lg:grid-cols-2' : ''}`}>
                    {catData.groups.map(g => <DenseGroupCard key={g.id} group={g} matches={catData.matches} teams={catData.teams} color={activeCatConfig.color.replace('text-', 'bg-')} />)}
                </div>
            ) : (
                <TournamentBracket matches={knockoutMatches} teams={catData.teams} />
            )}
        </div>
    </div>
  );
};
