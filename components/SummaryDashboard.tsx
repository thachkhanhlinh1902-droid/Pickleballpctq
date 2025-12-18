
import React, { useState, useEffect } from 'react';
import { TournamentData, CategoryKey, Team, Match, Group } from '../types';
import { calculateGroupRanking } from '../utils/logic';
import { Trophy, Crown, Zap, Heart, Users, Play, Pause, Maximize2, Minimize2, Medal, Clock, MapPin, LayoutGrid, Swords } from 'lucide-react';

interface Props {
  data: TournamentData;
}

const CATEGORIES: { key: CategoryKey, label: string, icon: any, color: string }[] = [
    { key: 'lanhdao', label: 'LÃNH ĐẠO', icon: Crown, color: 'text-yellow-600' },
    { key: 'nam', label: 'ĐÔI NAM', icon: Zap, color: 'text-blue-600' },
    { key: 'nu', label: 'ĐÔI NỮ', icon: Heart, color: 'text-rose-600' },
    { key: 'namnu', label: 'NAM NỮ', icon: Users, color: 'text-purple-600' },
];

const AUTO_ROTATE_INTERVAL = 25000;

const DenseMatchRow: React.FC<{ match: Match, teams: Team[] }> = ({ match, teams }) => {
    const tA = teams.find(t => t.id === match.teamAId);
    const tB = teams.find(t => t.id === match.teamBId);
    if (!tA && !tB) return null;

    const isFinished = match.isFinished;
    const scoreText = isFinished ? `${match.score.set1.a}-${match.score.set1.b}` : 'VS';
    const [timeOnly, dateOnly] = (match.time || '--:-- --/--').split(' ');

    const TeamInfo = ({ team, align }: { team: Team | undefined, align: 'right' | 'left' }) => (
        <div className={`flex-1 ${align === 'right' ? 'text-right pr-1' : 'text-left pl-1'} min-w-0`}>
            <div className={`text-[9px] font-black leading-[1.1] ${match.winnerId === team?.id ? 'text-green-700' : 'text-slate-800'}`}>
                <div className="truncate">{team?.name1}</div>
                <div className="truncate">{team?.name2}</div>
            </div>
            <div className="text-[7px] text-slate-400 italic truncate leading-none mt-0.5">{team?.org}</div>
        </div>
    );

    return (
        <div className={`flex items-center border-b border-gray-100 py-1.5 px-1 ${isFinished ? 'bg-green-50/40' : 'bg-white'}`}>
            <TeamInfo team={tA} align="right" />

            <div className="flex flex-col items-center justify-center shrink-0 min-w-[65px] px-1 border-x border-gray-100">
                <div className="text-[7px] font-black text-blue-500 leading-none mb-0.5">{timeOnly} <span className="text-slate-200">{dateOnly}</span></div>
                <div className={`w-full py-0.5 rounded font-mono font-black text-center text-[10px] ${isFinished ? 'bg-slate-900 text-yellow-400' : 'bg-slate-100 text-slate-300'}`}>{scoreText}</div>
                <div className="text-[7px] font-bold text-orange-600 mt-0.5 leading-none uppercase">{match.court || 'SÂN --'}</div>
            </div>

            <TeamInfo team={tB} align="left" />
        </div>
    );
};

const DenseGroupCard: React.FC<{ group: Group, matches: Match[], teams: Team[], color: string }> = ({ group, matches, teams, color }) => {
    const ranking = calculateGroupRanking(teams, matches, group.id);
    const groupMatches = matches.filter(m => m.groupId === group.id).sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0));
    const textColor = color.replace('bg-', 'text-');

    return (
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 py-1 border-b border-gray-200 text-center shrink-0">
                <span className={`font-black text-[10px] uppercase tracking-widest ${textColor}`}>BẢNG {group.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
                <div className="w-full sm:w-[48%] border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto custom-scrollbar bg-white">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[7px] sticky top-0 z-10">
                            <tr>
                                <th className="py-1 w-5 text-center">#</th>
                                <th className="py-1 text-left px-1">Cặp VĐV / Đơn vị</th>
                                <th className="py-1 w-4 text-center text-blue-600">Đ</th>
                                <th className="py-1 w-4 text-center">Tr</th>
                                <th className="py-1 w-4 text-center">T</th>
                                <th className="py-1 w-4 text-center">B</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((t, i) => (
                                <tr key={t.id} className={`border-b border-gray-50 ${i < 2 ? 'bg-yellow-50/50' : ''}`}>
                                    <td className="text-center font-bold text-[9px] py-1">{i + 1}</td>
                                    <td className="px-1 py-1 min-w-0">
                                        <div className="font-bold text-[9px] leading-tight text-slate-800">
                                            <div className="truncate">{t.name1}</div>
                                            <div className="truncate">{t.name2}</div>
                                        </div>
                                        <div className="text-[7px] text-slate-400 italic truncate leading-none mt-0.5">{t.org}</div>
                                    </td>
                                    <td className="text-center font-black text-blue-700 text-[9px]">{t.stats?.points}</td>
                                    <td className="text-center text-[9px]">{t.stats?.played}</td>
                                    <td className="text-center font-bold text-green-600 text-[9px]">{t.stats?.won}</td>
                                    <td className="text-center font-bold text-red-500 text-[9px]">{t.stats?.lost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex-1 bg-gray-50 overflow-y-auto custom-scrollbar">
                    {groupMatches.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-300 text-[9px] uppercase font-bold italic">Chưa có lịch</div>
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
        <div className="h-12 bg-white border-b border-gray-200 flex justify-between items-center px-4 shrink-0 overflow-x-auto hide-scrollbar relative">
             <div className="flex items-center gap-1 min-w-max">
                 {CATEGORIES.map((cat, idx) => (
                     <button key={cat.key} onClick={() => { setActiveIndex(idx); setProgress(0); }} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${activeIndex === idx ? `${cat.color.replace('text-', 'bg-')} text-white shadow-sm` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        <cat.icon size={14} />
                        <span className="text-[10px] font-black uppercase">{cat.label}</span>
                     </button>
                 ))}
                 <div className="w-px h-6 bg-gray-200 mx-2"></div>
                 <div className="flex bg-slate-100 p-0.5 rounded-md">
                     <button onClick={() => setStage('group')} className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${stage === 'group' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Bảng</button>
                     <button onClick={() => setStage('playoff')} className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${stage === 'playoff' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}>Playoff</button>
                 </div>
             </div>
             <div className="flex items-center gap-3 shrink-0 ml-4">
                 <button onClick={() => setIsPaused(!isPaused)} className="text-slate-300">{isPaused ? <Play size={16} fill="currentColor"/> : <Pause size={16} fill="currentColor"/>}</button>
                 <button onClick={() => setIsFullScreen(!isFullScreen)} className="text-slate-400 hover:text-slate-900 transition-colors"><Maximize2 size={16}/></button>
             </div>
             <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all ease-linear" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex-1 p-2 bg-slate-100 overflow-hidden">
            {stage === 'group' ? (
                <div className={`grid gap-2 h-full grid-cols-1 ${catData.groups.length > 2 ? 'lg:grid-cols-2' : ''}`}>
                    {catData.groups.length === 0 ? (
                        <div className="col-span-full h-full flex items-center justify-center text-slate-300 uppercase font-black italic text-xs">Chưa có dữ liệu bảng</div>
                    ) : catData.groups.map(g => <DenseGroupCard key={g.id} group={g} matches={catData.matches} teams={catData.teams} color={activeCatConfig.color.replace('text-', 'bg-')} />)}
                </div>
            ) : (
                <div className="h-full bg-white rounded-lg border border-gray-300 flex flex-col overflow-hidden">
                    <div className="bg-slate-900 text-white py-1.5 text-center font-black uppercase text-[10px]">NHÁNH THI ĐẤU TRỰC TIẾP</div>
                    <div className="flex-1 overflow-y-auto p-2 bg-slate-50 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {knockoutMatches.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-slate-300 uppercase font-black text-xs italic">Đang chờ kết quả vòng bảng...</div>
                            ) : knockoutMatches.sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0)).map(m => {
                                const tA = catData.teams.find(t => t.id === m.teamAId);
                                const tB = catData.teams.find(t => t.id === m.teamBId);
                                return (
                                    <div key={m.id} className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm flex flex-col gap-1.5">
                                        <div className="flex justify-between border-b pb-1 text-[8px] font-black uppercase"><span className="text-slate-500">{m.roundName}</span><span className="text-blue-600">{m.time}</span></div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 text-right min-w-0">
                                                <div className="font-black text-[10px] leading-[1.1] text-slate-800">
                                                    <div className="truncate">{tA?.name1}</div>
                                                    <div className="truncate">{tA?.name2}</div>
                                                </div>
                                                <div className="text-[7px] text-slate-400 italic truncate mt-0.5">{tA?.org}</div>
                                            </div>
                                            <div className={`px-2 py-1 rounded font-mono font-black text-[11px] ${m.isFinished ? 'bg-slate-900 text-yellow-400' : 'bg-slate-100 text-slate-300'}`}>{m.isFinished ? `${m.score.set1.a}-${m.score.set1.b}` : 'VS'}</div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="font-black text-[10px] leading-[1.1] text-slate-800">
                                                    <div className="truncate">{tB?.name1}</div>
                                                    <div className="truncate">{tB?.name2}</div>
                                                </div>
                                                <div className="text-[7px] text-slate-400 italic truncate mt-0.5">{tB?.org}</div>
                                            </div>
                                        </div>
                                        <div className="text-[8px] font-bold text-orange-600 text-center uppercase tracking-widest">{m.court}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
