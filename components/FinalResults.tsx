
import React, { useState } from 'react';
import { TournamentData, Team, Match } from '../types';
import { Trophy, Medal, Crown, Maximize2, Minimize2, Star } from 'lucide-react';

interface Props {
  data: TournamentData;
}

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

export const FinalResults: React.FC<Props> = ({ data }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const categories = [
    { key: 'lanhdao', label: 'Đôi Lãnh Đạo', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { key: 'nam', label: 'Đôi Nam', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { key: 'nu', label: 'Đôi Nữ', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    { key: 'namnu', label: 'Đôi Nam Nữ', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  ] as const;

  const getPodium = (catKey: string, matches: Match[], teams: Team[]) => {
      const finalMatch = matches.find(m => m.note === 'CK' || m.roundName === 'Chung kết');
      if (!finalMatch || !finalMatch.isFinished || !finalMatch.winnerId) return null;

      const champion = teams.find(t => t.id === finalMatch.winnerId);
      const runnerUpId = finalMatch.winnerId === finalMatch.teamAId ? finalMatch.teamBId : finalMatch.teamAId;
      const runnerUp = teams.find(t => t.id === runnerUpId);

      let thirdPlace: Team[] = [];
      const semiFinals = matches.filter(m => m.note?.startsWith('BK'));
      semiFinals.forEach(m => {
          if (m.isFinished && m.winnerId) {
              const loserId = m.winnerId === m.teamAId ? m.teamBId : m.teamAId;
              const t = teams.find(team => team.id === loserId);
              if (t) thirdPlace.push(t);
          }
      });

      return { champion, runnerUp, thirdPlace };
  };

  const results = categories.map(cat => {
      const catData = data.categories[cat.key];
      const podium = getPodium(cat.key, catData.matches, catData.teams);
      return { ...cat, podium };
  }).filter(r => r.podium !== null);

  const containerClass = isFullScreen 
    ? "fixed inset-0 z-[100] bg-slate-900 h-screen w-screen overflow-y-auto font-sans" 
    : "animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 font-sans relative";

  return (
    <div className={containerClass}>
       {isFullScreen && (
            <div className="sticky top-0 z-40 shadow-2xl">
                <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 py-4 px-6 text-center relative overflow-hidden border-b border-yellow-500/30">
                    <h1 className="text-xl md:text-3xl font-black uppercase tracking-widest text-white flex items-center justify-center gap-4">
                        <Star className="text-yellow-400 animate-pulse" />
                        VÂN DANH NHÀ VÔ ĐỊCH
                        <Star className="text-yellow-400 animate-pulse" />
                    </h1>
                </div>
            </div>
       )}
       
       <div className={`flex justify-end px-4 py-2 ${isFullScreen ? 'bg-slate-800 sticky top-16 z-30' : ''}`}>
             <button onClick={() => setIsFullScreen(!isFullScreen)} className="flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all">
                 {isFullScreen ? <><Minimize2 size={14}/> THOÁT</> : <><Maximize2 size={14}/> TOÀN MÀN HÌNH</>}
             </button>
       </div>

       <div className={isFullScreen ? "p-8 max-w-[1600px] mx-auto" : "p-4"}>
            {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
                    <Trophy size={80} className="text-slate-100" />
                    <p className="text-xl font-black uppercase tracking-widest">Đang chờ nhà vô địch...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {results.map((item) => (
                        <div key={item.key} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
                            <div className="bg-slate-900 py-4 px-6 flex justify-between items-center">
                                <h3 className="text-lg font-black uppercase tracking-widest text-yellow-400">{item.label}</h3>
                                <PickleballIcon size={24} className="text-white opacity-20" />
                            </div>

                            <div className="p-8 bg-gradient-to-b from-white to-slate-50 flex-1">
                                {/* Bục vinh quang (Podium) */}
                                <div className="flex items-end justify-center gap-4 mt-4">
                                    {/* Giải Nhì */}
                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="mb-4 text-center">
                                            <div className="font-black text-[11px] text-slate-800 leading-tight">
                                                <div>{item.podium?.runnerUp?.name1}</div>
                                                <div>{item.podium?.runnerUp?.name2}</div>
                                            </div>
                                            <div className="text-[8px] text-slate-400 italic mt-1 uppercase">{item.podium?.runnerUp?.org}</div>
                                        </div>
                                        <div className="w-full bg-slate-300 h-24 rounded-t-2xl shadow-lg relative flex items-center justify-center">
                                            <div className="text-5xl font-black text-white/50">2</div>
                                            <div className="absolute -top-4 bg-slate-400 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-md">Giải Nhì</div>
                                        </div>
                                    </div>

                                    {/* Vô Địch */}
                                    <div className="flex flex-col items-center w-1/3">
                                        <Trophy size={48} className="text-yellow-500 mb-4 animate-bounce" />
                                        <div className="mb-6 text-center">
                                            <div className="font-black text-sm text-blue-900 leading-tight">
                                                <div>{item.podium?.champion?.name1}</div>
                                                <div>{item.podium?.champion?.name2}</div>
                                            </div>
                                            <div className="text-[9px] text-blue-600 font-bold mt-1 uppercase italic">{item.podium?.champion?.org}</div>
                                        </div>
                                        <div className="w-full bg-gradient-to-b from-yellow-400 to-orange-500 h-40 rounded-t-2xl shadow-2xl relative flex items-center justify-center border-x-4 border-t-4 border-yellow-200">
                                            <div className="text-7xl font-black text-white/50">1</div>
                                            <div className="absolute -top-5 bg-slate-900 text-yellow-400 px-4 py-2 rounded-full text-[11px] font-black uppercase shadow-xl ring-4 ring-yellow-400/20">VÔ ĐỊCH</div>
                                        </div>
                                    </div>

                                    {/* Giải Ba */}
                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="mb-4 text-center">
                                            {item.podium?.thirdPlace.map((t, i) => (
                                                <div key={t.id} className={i > 0 ? 'mt-2 border-t pt-2' : ''}>
                                                    <div className="font-black text-[10px] text-slate-800 leading-tight">
                                                        <div>{t.name1}</div>
                                                        <div>{t.name2}</div>
                                                    </div>
                                                    <div className="text-[8px] text-slate-400 italic mt-1 uppercase">{t.org}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-full bg-orange-200 h-16 rounded-t-2xl shadow-lg relative flex items-center justify-center">
                                            <div className="text-4xl font-black text-white/50">3</div>
                                            <div className="absolute -top-4 bg-orange-400 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-md">Giải Ba</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
       </div>
    </div>
  );
};
