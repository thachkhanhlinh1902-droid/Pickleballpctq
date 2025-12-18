import React, { useState } from 'react';
import { TournamentData, Team, Match } from '../types';
import { Trophy, Medal, Crown, Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  data: TournamentData;
}

// Custom Pickleball Icon (Redefined here for local usage in Fullscreen mode)
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

  // Helper to get results
  const getPodium = (catKey: string, matches: Match[], teams: Team[]) => {
      const finalMatch = matches.find(m => m.note === 'CK' || m.roundName === 'Chung kết');
      
      // Chỉ hiện khi đã xong chung kết
      if (!finalMatch || !finalMatch.isFinished || !finalMatch.winnerId) return null;

      const champion = teams.find(t => t.id === finalMatch.winnerId);
      const runnerUpId = finalMatch.winnerId === finalMatch.teamAId ? finalMatch.teamBId : finalMatch.teamAId;
      const runnerUp = teams.find(t => t.id === runnerUpId);

      let thirdPlace: Team[] = [];

      // Logic Đồng hạng 3: Lấy 2 đội thua ở Bán kết
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
    ? "fixed inset-0 z-[100] bg-slate-100 h-screen w-screen overflow-y-auto font-sans" 
    : "animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 font-sans relative";

  return (
    <div className={containerClass}>
       {/* FULLSCREEN HEADER & BANNER */}
       {isFullScreen && (
            <div className="sticky top-0 z-40 shadow-lg">
                <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 py-3 px-4 text-center relative overflow-hidden border-b border-white/10 shrink-0">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
                    <h1 className="text-sm md:text-xl lg:text-2xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center gap-3 leading-tight whitespace-nowrap">
                        <PickleballIcon className="text-lime-400 shrink-0 drop-shadow-md hidden md:block" size={32} />
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-100">
                            GIẢI PICKLEBALL CÔNG TY ĐIỆN LỰC TUYÊN QUANG ĐÁNH DẤU 71 NĂM NGÀY TRUYỀN THỐNG NGÀNH ĐIỆN LỰC
                        </span>
                        <PickleballIcon className="text-lime-400 shrink-0 drop-shadow-md hidden md:block" size={32} />
                    </h1>
                </div>
            </div>
       )}
       
       {/* CONTROL BAR */}
       <div className={`flex justify-end px-4 py-2 ${isFullScreen ? 'bg-slate-800 sticky top-[60px] z-30 shadow-md border-t border-white/10' : ''}`}>
             <button 
                onClick={() => setIsFullScreen(!isFullScreen)} 
                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded border transition-colors shadow-sm ${
                    isFullScreen 
                    ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600' 
                    : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
                }`}
             >
                 {isFullScreen ? <><Minimize2 size={16}/> THOÁT</> : <><Maximize2 size={16}/> PHÓNG TO</>}
             </button>
       </div>

       {/* CONTENT */}
       <div className={isFullScreen ? "p-6" : ""}>
            {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
                    <Trophy size={64} className="mb-4 text-gray-200" />
                    <p className="text-xl font-medium">Chưa có nội dung nào kết thúc.</p>
                    <p className="text-sm">Kết quả sẽ hiển thị tại đây sau khi trận Chung kết hoàn thành.</p>
                </div>
            ) : (
                <>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center justify-center gap-3">
                            <Trophy size={32} className="text-yellow-500 fill-yellow-500" />
                            Bảng Tổng Sắp Huy Chương
                            <Trophy size={32} className="text-yellow-500 fill-yellow-500" />
                        </h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-2 rounded-full"></div>
                    </div>

                    {/* Changed grid layout to 4 columns on XL screens and increased container width */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 w-full max-w-[1920px] mx-auto">
                        {results.map((item) => (
                            <div key={item.key} className={`relative overflow-hidden bg-white rounded-2xl shadow-xl border-t-8 ${item.border.replace('bg-', 'border-').replace('50', '500')} flex flex-col`}>
                                {/* Background Decor */}
                                <div className={`absolute top-0 right-0 p-4 opacity-5 ${item.color}`}>
                                    <Crown size={120} />
                                </div>

                                <div className={`p-3 border-b border-gray-100 ${item.bg}`}>
                                    <h3 className={`text-lg font-black uppercase text-center ${item.color}`}>{item.label}</h3>
                                </div>

                                <div className="p-4 space-y-4 flex-1 flex flex-col justify-start">
                                    {/* Champion */}
                                    <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-xl border border-yellow-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                                        <div className="flex-shrink-0 bg-gradient-to-br from-yellow-300 to-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                                            <span className="font-black text-lg">1</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider mb-0.5">Vô Địch</div>
                                            <div className="font-bold text-gray-800 text-sm leading-tight truncate">{item.podium?.champion?.name1}</div>
                                            <div className="font-bold text-gray-800 text-sm leading-tight truncate">{item.podium?.champion?.name2}</div>
                                            <div className="text-[10px] text-gray-500 italic mt-0.5 truncate">{item.podium?.champion?.org}</div>
                                        </div>
                                        <Trophy className="text-yellow-400 drop-shadow-sm flex-shrink-0" size={24} />
                                    </div>

                                    {/* Runner Up */}
                                    <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gray-400"></div>
                                        <div className="flex-shrink-0 bg-gradient-to-br from-gray-300 to-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                                            <span className="font-black text-sm">2</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Giải Nhì</div>
                                            <div className="font-bold text-gray-700 text-xs truncate">{item.podium?.runnerUp?.name1} & {item.podium?.runnerUp?.name2}</div>
                                            <div className="text-[10px] text-gray-400 italic truncate">{item.podium?.runnerUp?.org}</div>
                                        </div>
                                    </div>

                                    {/* Third Place(s) */}
                                    <div className="flex flex-col gap-2 mt-auto">
                                        {item.podium?.thirdPlace.map((t, idx) => (
                                                <div key={t.id} className="flex items-center gap-3 bg-orange-50 p-2.5 rounded-xl border border-orange-200 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                                    <div className="flex-shrink-0 bg-gradient-to-br from-orange-300 to-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                                                        <span className="font-black text-sm">3</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[9px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">
                                                            {item.podium?.thirdPlace.length && item.podium.thirdPlace.length > 1 ? 'Đồng Giải Ba' : 'Giải Ba'}
                                                        </div>
                                                        <div className="font-bold text-gray-700 text-xs truncate">{t.name1} & {t.name2}</div>
                                                        <div className="text-[10px] text-gray-400 italic truncate">{t.org}</div>
                                                    </div>
                                                </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
       </div>
    </div>
  );
};