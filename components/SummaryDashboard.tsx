
import React, { useState, useEffect } from 'react';
import { TournamentData, CategoryKey, Team, Match, Group } from '../types';
import { calculateGroupRanking } from '../utils/logic';
import { Trophy, Crown, Zap, Heart, Users, Play, Pause, Maximize2, Minimize2, Medal, Clock, MapPin } from 'lucide-react';

interface Props {
  data: TournamentData;
}

const CATEGORIES: { key: CategoryKey, label: string, icon: any, color: string }[] = [
    { key: 'lanhdao', label: 'LÃNH ĐẠO', icon: Crown, color: 'text-yellow-600' },
    { key: 'nam', label: 'ĐÔI NAM', icon: Zap, color: 'text-blue-600' },
    { key: 'nu', label: 'ĐÔI NỮ', icon: Heart, color: 'text-rose-600' },
    { key: 'namnu', label: 'NAM NỮ', icon: Users, color: 'text-purple-600' },
];

const AUTO_ROTATE_INTERVAL = 30000; // 30s đổi màn hình

// Custom Pickleball Icon
const PickleballIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="6" r="1.2" fill="currentColor"/>
      <circle cx="12" cy="18" r="1.2" fill="currentColor"/>
      <circle cx="6" cy="12" r="1.2" fill="currentColor"/>
      <circle cx="18" cy="12" r="1.2" fill="currentColor"/>
    </svg>
);

// --- COMPACT MATCH ROW ---
const DenseMatchRow: React.FC<{ match: Match, teams: Team[], isKnockout?: boolean, isGridMode?: boolean }> = ({ match, teams, isKnockout, isGridMode }) => {
    const tA = teams.find(t => t.id === match.teamAId);
    const tB = teams.find(t => t.id === match.teamBId);

    if (!tA && !tB) return null;

    const isFinished = match.isFinished;
    const scoreText = isFinished 
        ? `${match.score.set1.a}-${match.score.set1.b}` 
        : 'vs';

    const wA = match.winnerId === tA?.id ? 'font-black text-green-800' : 'text-slate-700 font-medium';
    const wB = match.winnerId === tB?.id ? 'font-black text-green-800' : 'text-slate-700 font-medium';
    
    const bgClass = isFinished ? 'bg-green-50/60' : 'bg-white';
    
    const textSize = isGridMode ? 'text-[10px]' : 'text-[11px]'; 
    const scoreSize = isGridMode ? 'text-[10px] w-8' : 'text-[11px] w-10';

    return (
        <div className={`flex items-center justify-between px-2 py-2 border-b border-gray-100 last:border-0 ${textSize} leading-tight ${bgClass} min-h-[48px] relative`}>
            {/* Đội A */}
            <div className="flex flex-col items-end flex-1 min-w-0 pr-1 text-right">
                {tA ? (
                    <>
                        <div className={`leading-none mb-0.5 ${wA}`}>{tA.name1}</div>
                        <div className={`leading-none ${wA}`}>{tA.name2}</div>
                        <div className="text-[9px] text-gray-500 font-normal italic mt-0.5 opacity-80 leading-none">{tA.org}</div>
                    </>
                ) : (
                    <span className="text-gray-400">...</span>
                )}
            </div>

            {/* Tỷ số / VS & THỜI GIAN/SÂN */}
            <div className="flex flex-col items-center justify-center shrink-0 min-w-[50px]">
                <div className={`mx-1 ${scoreSize} flex items-center justify-center py-0.5 text-center font-mono font-bold rounded uppercase ${isFinished ? 'bg-slate-800 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                    {scoreText}
                </div>
                {(match.time || match.court) && (
                    <div className="flex flex-col items-center mt-1 w-full">
                        {match.time && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 rounded whitespace-nowrap leading-tight mb-0.5 max-w-[60px] truncate">
                                {match.time}
                            </span>
                        )}
                        {match.court && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1 rounded leading-tight whitespace-nowrap max-w-[60px] truncate">
                                {match.court}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Đội B */}
            <div className="flex flex-col items-start flex-1 min-w-0 pl-1 text-left">
                {tB ? (
                     <>
                        <div className={`leading-none mb-0.5 ${wB}`}>{tB.name1}</div>
                        <div className={`leading-none ${wB}`}>{tB.name2}</div>
                        <div className="text-[9px] text-gray-500 font-normal italic mt-0.5 opacity-80 leading-none">{tB.org}</div>
                    </>
                ) : (
                    <span className="text-gray-400">...</span>
                )}
            </div>
        </div>
    );
};

// --- DENSE GROUP CARD ---
const DenseGroupCard: React.FC<{ group: Group, matches: Match[], teams: Team[], color: string }> = ({ group, matches, teams, color }) => {
    const ranking = calculateGroupRanking(teams, matches, group.id);
    const groupMatches = matches.filter(m => m.groupId === group.id).sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0));
    
    const useTwoColumns = groupMatches.length > 6;
    const rankingWidthClass = useTwoColumns ? 'w-[40%]' : 'w-[50%]';

    return (
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full min-h-0">
            <div className={`${color} bg-opacity-10 px-3 py-2 border-b border-gray-200 flex justify-center items-center shrink-0`}>
                <span className={`font-black text-sm uppercase tracking-wide ${color.replace('bg-', 'text-')}`}>BẢNG {group.name}</span>
            </div>

            <div className="flex flex-1 overflow-hidden min-h-0">
                <div className={`${rankingWidthClass} border-r border-gray-200 flex flex-col bg-white overflow-hidden transition-all duration-300`}>
                    <table className="w-full text-xs">
                        <thead className="bg-gray-100 text-gray-600 font-bold uppercase sticky top-0 z-10">
                            <tr>
                                <th className="py-2 text-center w-6 bg-gray-100">#</th>
                                <th className="py-2 text-left px-1 bg-gray-100">VĐV / Đơn vị</th>
                                <th className="py-2 text-center w-5 bg-gray-100" title="Số trận">Tr</th>
                                <th className="py-2 text-center w-5 text-green-600 bg-gray-100" title="Thắng">T</th>
                                <th className="py-2 text-center w-5 text-red-600 bg-gray-100" title="Thua">B</th>
                                <th className="py-2 text-center w-8 bg-gray-100" title="Hiệu số">HS</th>
                            </tr>
                        </thead>
                        <tbody className="overflow-y-auto">
                            {ranking.map((t, i) => (
                                <tr key={t.id} className={`border-b border-gray-50 last:border-0 ${i < 2 ? 'bg-yellow-50/50' : ''}`}>
                                    <td className={`text-center font-bold py-1.5 align-middle ${i<2 ? 'text-red-600 text-sm':''}`}>{i + 1}</td>
                                    <td className="px-1 py-1.5 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-[11px] leading-tight">{t.name1}</span>
                                            <span className="font-bold text-gray-900 text-[11px] leading-tight">{t.name2}</span>
                                            <span className="text-[9px] text-gray-500 font-medium italic mt-0.5 leading-tight">{t.org}</span>
                                        </div>
                                    </td>
                                    <td className="text-center font-medium text-gray-500 py-1.5 align-middle border-l border-dashed border-gray-200">{t.stats?.played || 0}</td>
                                    <td className="text-center font-bold text-green-600 py-1.5 align-middle border-l border-dashed border-gray-200">{t.stats?.won || 0}</td>
                                    <td className="text-center font-medium text-red-600 py-1.5 align-middle border-l border-dashed border-gray-200">{t.stats?.lost || 0}</td>
                                    <td className="text-center font-mono font-bold text-slate-800 py-1.5 align-middle border-l border-dashed border-gray-200">{t.stats?.pointsDiff}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0">
                    <div className="bg-gray-100 px-2 py-1.5 text-[10px] font-bold text-gray-500 uppercase text-center border-b border-gray-200">Lịch đấu</div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0.5">
                        {useTwoColumns ? (
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0 h-full content-start">
                                {groupMatches.map(m => (
                                    <div key={m.id} className="border-b border-dashed border-gray-200 odd:border-r">
                                        <DenseMatchRow match={m} teams={teams} isGridMode={true} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                {groupMatches.map(m => <DenseMatchRow key={m.id} match={m} teams={teams} />)}
                            </div>
                        )}
                        {groupMatches.length === 0 && <div className="text-center text-gray-400 text-xs py-4 italic">Chưa có lịch</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SummaryDashboard: React.FC<Props> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
      if (isPaused) return;
      const step = 50; 
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

  const handleManualChange = (index: number) => {
      setActiveIndex(index);
      setProgress(0);
  };

  const activeCatConfig = CATEGORIES[activeIndex];
  const activeKey = activeCatConfig.key;
  const catData = data.categories[activeKey];
  
  const getRoundPriority = (m: Match) => {
      const s = (m.roundName || '').toLowerCase();
      if (s.includes('tứ kết')) return 1;
      if (s.includes('bán kết')) return 2;
      if (s.includes('tranh')) return 3; 
      if (s.includes('chung kết')) return 4;
      return 5;
  };

  const knockoutMatches = catData.matches
      .filter(m => !m.groupId)
      .sort((a, b) => {
          const pA = getRoundPriority(a);
          const pB = getRoundPriority(b);
          if (pA !== pB) return pA - pB;
          return (a.note || '').localeCompare(b.note || '');
      });

  const hasKnockout = knockoutMatches.length > 0;

  const groupGridClass = catData.groups.length > 2 
    ? 'grid-cols-2 grid-rows-2' 
    : 'grid-cols-2 grid-rows-1';

  const containerClass = isFullScreen 
    ? "fixed inset-0 z-[100] bg-slate-100 h-screen w-screen" 
    : "relative w-full h-[calc(100vh-170px)] bg-slate-100 rounded-xl border border-gray-300 shadow-inner";

  return (
    <div className={`${containerClass} flex flex-col overflow-hidden font-sans select-none text-slate-900 transition-all duration-300`}>
        
        {isFullScreen && (
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 py-3 px-4 text-center relative overflow-hidden border-b border-white/10 shrink-0 z-30 animate-in slide-in-from-top duration-300">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
                <h1 className="text-sm md:text-xl lg:text-2xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center gap-3 leading-tight whitespace-nowrap">
                    <PickleballIcon className="text-lime-400 shrink-0 drop-shadow-md hidden md:block" size={24} />
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-100">
                        GIẢI PICKLEBALL CÔNG TY ĐIỆN LỰC TUYÊN QUANG ĐÁNH DẤU 71 NĂM NGÀY TRUYỀN THỐNG NGÀNH ĐIỆN LỰC
                    </span>
                    <PickleballIcon className="text-lime-400 shrink-0 drop-shadow-md hidden md:block" size={24} />
                </h1>
            </div>
        )}

        <div className="h-12 bg-slate-900 text-white flex justify-between items-center px-4 shadow-md shrink-0 z-20">
             <div className="flex items-center gap-4">
                 <div className={`flex items-center gap-2 px-3 py-1 rounded ${activeCatConfig.color.replace('text-', 'bg-').replace('600', '700')} text-white shadow-lg`}>
                     <activeCatConfig.icon size={20} />
                     <span className="text-sm font-black uppercase tracking-wider">{activeCatConfig.label}</span>
                 </div>
                 <div className="flex gap-1.5 ml-4">
                     {CATEGORIES.map((c, idx) => (
                         <button 
                            key={c.key} 
                            onClick={() => handleManualChange(idx)}
                            className={`h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-yellow-400 w-12' : 'bg-gray-600 hover:bg-gray-500 w-6'}`}
                         />
                     ))}
                 </div>
             </div>
             <div className="flex items-center gap-3">
                 <button onClick={() => setIsPaused(!isPaused)} className="text-gray-400 hover:text-white p-1">
                     {isPaused ? <Play size={20} className="fill-current"/> : <Pause size={20} className="fill-current"/>}
                 </button>
                 <div className="w-px h-5 bg-gray-700 mx-1"></div>
                 <button onClick={() => setIsFullScreen(!isFullScreen)} className="text-gray-300 hover:text-white flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-slate-800 rounded border border-slate-600 hover:bg-slate-700 transition-colors">
                     {isFullScreen ? <><Minimize2 size={16}/> THOÁT</> : <><Maximize2 size={16}/> PHÓNG TO</>}
                 </button>
             </div>
             <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all ease-linear z-30 shadow-[0_0_10px_rgba(234,179,8,0.7)]" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex-1 p-2 flex gap-2 overflow-hidden min-h-0 bg-slate-200">
            <div className={`grid gap-2 h-full min-h-0 ${groupGridClass} ${hasKnockout ? 'w-[70%]' : 'w-full'}`}>
                {catData.groups.length === 0 && (
                    <div className="col-span-2 row-span-2 flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-2xl bg-slate-50 opacity-75">
                        <Trophy size={64} className="text-gray-300 mb-4"/>
                        <span className="text-gray-400 text-xl font-black uppercase">CHƯA CÓ DỮ LIỆU THI ĐẤU</span>
                    </div>
                )}
                {catData.groups.map(g => (
                    <DenseGroupCard 
                        key={g.id} 
                        group={g} 
                        matches={catData.matches} 
                        teams={catData.teams}
                        color={activeCatConfig.color.replace('text-', 'bg-')}
                    />
                ))}
            </div>

            {hasKnockout && (
                <div className="w-[30%] flex flex-col h-full shrink-0 min-h-0 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-300">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-2 px-3 text-center font-black uppercase text-sm shrink-0 flex items-center justify-center gap-2 shadow-md">
                        <Medal size={16} className="text-yellow-400"/> VÒNG PLAYOFF
                    </div>
                    <div className="flex-1 overflow-hidden p-2 bg-slate-50 flex flex-col">
                        <div className={`grid gap-2 ${knockoutMatches.length > 5 ? 'grid-cols-2' : 'grid-cols-1'} h-full content-start overflow-y-auto hide-scrollbar`}>
                            {knockoutMatches.map((m) => {
                                const isFinal = m.roundName.includes('Chung kết');
                                const tA = catData.teams.find(t => t.id === m.teamAId);
                                const tB = catData.teams.find(t => t.id === m.teamBId);
                                
                                let roundLabel = m.roundName;
                                if (roundLabel.includes('Tứ kết')) roundLabel = roundLabel.replace('Tứ kết', 'TỨ KẾT');
                                if (roundLabel.includes('Bán kết')) roundLabel = roundLabel.replace('Bán kết', 'BÁN KẾT');
                                if (roundLabel.includes('Chung kết')) roundLabel = 'CHUNG KẾT';
                                if (roundLabel.includes('Tranh 3-4')) roundLabel = 'TRANH GIẢI 3';
                                
                                const koBgClass = isFinal ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200' : 'bg-white border-gray-200';

                                return (
                                    <div key={m.id} className={`border rounded-lg p-2 flex flex-col justify-center min-h-[56px] shadow-sm transition-transform ${isFinal ? 'scale-[1.02] col-span-full' : 'hover:border-gray-300'} ${koBgClass} relative`}>
                                        <div className="flex justify-between items-center mb-1.5 border-b border-gray-100 pb-1">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded text-white tracking-wider ${isFinal ? 'bg-red-600' : 'bg-slate-600'}`}>
                                                {roundLabel}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {m.time && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1 rounded flex items-center gap-0.5"><Clock size={10}/> {m.time}</span>}
                                                {m.court && <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-1 rounded flex items-center gap-0.5"><MapPin size={10}/> {m.court}</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className={`flex justify-between items-center text-xs ${m.winnerId === tA?.id ? 'font-black text-green-700' : 'text-slate-600'}`}>
                                                <div className="flex flex-col items-start min-w-0">
                                                    {tA ? (
                                                        <>
                                                            <div className="truncate w-full text-[10px] leading-tight">{tA.name1}</div>
                                                            <div className="truncate w-full text-[10px] leading-tight">{tA.name2}</div>
                                                            <div className="text-[9px] text-gray-400 italic font-normal">{tA.org}</div>
                                                        </>
                                                    ) : <span className="text-[10px] text-gray-400 italic">...</span>}
                                                </div>
                                                {m.isFinished ? (
                                                     <span className="font-mono font-bold bg-gray-50 px-1.5 border rounded text-slate-800 ml-1 shrink-0">{m.score.set1.a}</span>
                                                ) : (
                                                     <span className="text-[10px] text-gray-400 italic ml-1 shrink-0">vs</span>
                                                )}
                                            </div>
                                            <div className={`flex justify-between items-center text-xs ${m.winnerId === tB?.id ? 'font-black text-green-700' : 'text-slate-600'}`}>
                                                <div className="flex flex-col items-start min-w-0">
                                                    {tB ? (
                                                        <>
                                                            <div className="truncate w-full text-[10px] leading-tight">{tB.name1}</div>
                                                            <div className="truncate w-full text-[10px] leading-tight">{tB.name2}</div>
                                                            <div className="text-[9px] text-gray-400 italic font-normal">{tB.org}</div>
                                                        </>
                                                    ) : <span className="text-[10px] text-gray-400 italic">...</span>}
                                                </div>
                                                {m.isFinished ? (
                                                     <span className="font-mono font-bold bg-gray-50 px-1.5 border rounded text-slate-800 ml-1 shrink-0">{m.score.set1.b}</span>
                                                ) : (
                                                     <span className="text-[10px] text-gray-400 italic ml-1 shrink-0">vs</span>
                                                )}
                                            </div>
                                        </div>
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
