
import React, { useState, useEffect } from 'react';
import { Match, Team } from '../types';
import { FileDown, MapPin, Trophy, Calendar } from 'lucide-react';
import { generateMatchReport } from '../utils/wordExporter';
import { useStore } from '../context/Store';

interface Props {
  match: Match;
  teamA?: Team;
  teamB?: Team;
  categoryName: string;
  isKnockout?: boolean;
}

export const MatchCard: React.FC<Props> = ({ match, teamA, teamB, categoryName, isKnockout }) => {
  const { updateMatch, isAdmin } = useStore();
  const [s1a, setS1a] = useState(match.score.set1.a);
  const [s1b, setS1b] = useState(match.score.set1.b);

  useEffect(() => {
     setS1a(match.score.set1.a);
     setS1b(match.score.set1.b);
  }, [match]);

  if (!teamA || !teamB) return (
    <div className="bg-slate-100 p-6 rounded-2xl border-2 border-dashed border-slate-300 mb-4 opacity-60 flex items-center justify-center">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
        {match.roundName}: ĐANG CHỜ CẶP ĐẤU...
      </span>
    </div>
  );

  const TeamBox = ({ team, align, isWinner }: { team: Team, align: 'right' | 'left', isWinner: boolean }) => (
    <div className={`flex-1 flex flex-col min-w-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
        <div className={`flex items-start gap-3 mb-2 ${align === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
             <div className={`text-[14px] font-black leading-tight tracking-tight ${isWinner ? 'text-blue-700 drop-shadow-sm' : 'text-slate-900'}`}>
                <div>{team.name1}</div>
                <div>{team.name2}</div>
            </div>
            {isWinner && <div className="mt-1 bg-yellow-400 p-1 rounded-full shadow-sm"><Trophy size={16} className="text-white fill-white" /></div>}
        </div>
        <div className={`text-[10px] font-bold uppercase italic tracking-tight ${isWinner ? 'text-blue-500' : 'text-slate-400'}`}>
            {team.org}
        </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-md border-2 mb-6 relative transition-all overflow-hidden ${match.isFinished ? 'border-slate-200 shadow-slate-200/50' : 'border-blue-200 shadow-blue-200/40'}`}>
      {/* Label Header */}
      <div className={`px-4 py-2.5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest ${match.isFinished ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 text-white shadow-lg'}`}>
         <div className="flex items-center gap-2">
            <span className={isKnockout ? 'text-yellow-400' : ''}>{match.roundName}</span>
            {match.isFinished && <span className="bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full">KẾT THÚC</span>}
         </div>
         <div className="flex items-center gap-4">
             <span className="flex items-center gap-1.5 opacity-80"><MapPin size={12}/> {match.court || 'SÂN TỰ DO'}</span>
             <button onClick={() => generateMatchReport(match, teamA, teamB, categoryName)} className="hover:text-yellow-400 transition-colors bg-white/10 p-1 rounded"><FileDown size={14}/></button>
         </div>
      </div>

      <div className="p-6 flex items-center justify-between gap-4 bg-gradient-to-b from-white to-slate-50/80">
        <TeamBox team={teamA} align="right" isWinner={match.winnerId === teamA.id} />

        {/* Scoreboard - Clear & Professional */}
        <div className="flex flex-col items-center shrink-0 min-w-[140px]">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 mb-3 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm uppercase">
               <Calendar size={12} className="text-blue-500" /> {match.time || 'CHƯA ĐỊNH'}
            </div>
            
            <div className={`flex items-center justify-center h-16 w-full rounded-2xl border-2 transition-all overflow-hidden ${match.isFinished ? 'bg-slate-900 border-slate-950 shadow-2xl scale-105' : 'bg-white border-slate-200 shadow-inner'}`}>
                {isAdmin ? (
                    <div className="flex items-center h-full">
                        <input type="number" className="w-16 h-full text-center font-black bg-transparent text-2xl outline-none p-0 focus:bg-blue-500/10 transition-colors text-slate-900" value={s1a} onChange={e=>setS1a(Number(e.target.value))} onBlur={() => updateMatch(match.category, { ...match, score: { ...match.score, set1: { a: s1a, b: s1b } } })}/>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <input type="number" className="w-16 h-full text-center font-black bg-transparent text-2xl outline-none p-0 focus:bg-blue-500/10 transition-colors text-slate-900" value={s1b} onChange={e=>setS1b(Number(e.target.value))} onBlur={() => updateMatch(match.category, { ...match, score: { ...match.score, set1: { a: s1a, b: s1b } } })}/>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 font-mono font-black text-4xl tracking-tighter">
                        <span className={match.winnerId === teamA.id ? 'text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : match.isFinished ? 'text-white' : 'text-slate-900'}>{s1a}</span>
                        <span className="text-slate-500 opacity-30 text-2xl">:</span>
                        <span className={match.winnerId === teamB.id ? 'text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : match.isFinished ? 'text-white' : 'text-slate-900'}>{s1b}</span>
                    </div>
                )}
            </div>
        </div>

        <TeamBox team={teamB} align="left" isWinner={match.winnerId === teamB.id} />
      </div>
    </div>
  );
};
