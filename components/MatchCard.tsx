
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
        <div className={`flex items-start gap-2 mb-1.5 ${align === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
             <div className={`text-[13px] font-black leading-tight tracking-tight ${isWinner ? 'text-blue-700' : 'text-slate-900'}`}>
                <div className="truncate">{team.name1}</div>
                <div className="truncate">{team.name2}</div>
            </div>
            {isWinner && <div className="mt-0.5 bg-yellow-400 p-1 rounded-full shadow-sm shrink-0"><Trophy size={12} className="text-white fill-white" /></div>}
        </div>
        <div className={`text-[9px] font-bold uppercase italic tracking-tight truncate ${isWinner ? 'text-blue-500' : 'text-slate-400'}`}>
            {team.org}
        </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 mb-4 relative transition-all overflow-hidden ${match.isFinished ? 'border-slate-300 shadow-md' : 'border-blue-200'}`}>
      {/* Header Bar */}
      <div className={`px-4 py-2 flex justify-between items-center text-[9px] font-black uppercase tracking-widest ${match.isFinished ? 'bg-slate-800 text-slate-300' : 'bg-blue-600 text-white'}`}>
         <div className="flex items-center gap-2">
            <span className={isKnockout ? 'text-yellow-400 font-black' : ''}>{match.roundName}</span>
            {match.isFinished && <span className="bg-green-500 text-white text-[7px] px-1.5 py-0.5 rounded font-bold">FINISH</span>}
         </div>
         <div className="flex items-center gap-3">
             <span className="flex items-center gap-1 opacity-90"><MapPin size={10}/> {match.court || 'SÂN TRỐNG'}</span>
             <button onClick={() => generateMatchReport(match, teamA, teamB, categoryName)} className="hover:text-yellow-400 transition-colors"><FileDown size={14}/></button>
         </div>
      </div>

      <div className="p-4 flex items-center justify-between gap-3 bg-white">
        <TeamBox team={teamA} align="right" isWinner={match.winnerId === teamA.id} />

        {/* Scoreboard - High Visibility Digital Style */}
        <div className="flex flex-col items-center shrink-0 min-w-[120px]">
            <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 mb-2 uppercase tracking-tighter">
               <Calendar size={10} className="text-blue-500" /> {match.time || '--:--'}
            </div>
            
            <div className={`flex items-center justify-center h-12 w-full rounded-xl border-2 transition-all shadow-inner relative overflow-hidden ${match.isFinished ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'}`}>
                {/* Admin Mode Input */}
                {isAdmin ? (
                    <div className="flex items-center h-full divide-x divide-white/10">
                        <input 
                            type="number" 
                            className={`w-12 h-full text-center font-black bg-transparent text-2xl outline-none p-0 focus:bg-blue-500/20 ${match.isFinished ? 'text-white' : 'text-blue-900'}`}
                            value={s1a} 
                            onChange={e=>setS1a(Number(e.target.value))} 
                            onBlur={() => updateMatch(match.category, { ...match, score: { ...match.score, set1: { a: s1a, b: s1b } } })}
                        />
                        <input 
                            type="number" 
                            className={`w-12 h-full text-center font-black bg-transparent text-2xl outline-none p-0 focus:bg-blue-500/20 ${match.isFinished ? 'text-white' : 'text-blue-900'}`}
                            value={s1b} 
                            onChange={e=>setS1b(Number(e.target.value))} 
                            onBlur={() => updateMatch(match.category, { ...match, score: { ...match.score, set1: { a: s1a, b: s1b } } })}
                        />
                    </div>
                ) : (
                    /* Display Mode */
                    <div className="flex items-center gap-3 font-mono font-black text-3xl tracking-tighter px-4">
                        <span className={match.winnerId === teamA.id ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : match.isFinished ? 'text-white' : 'text-blue-900'}>
                            {s1a}
                        </span>
                        <span className={`text-sm ${match.isFinished ? 'text-slate-600' : 'text-blue-200'}`}>:</span>
                        <span className={match.winnerId === teamB.id ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : match.isFinished ? 'text-white' : 'text-blue-900'}>
                            {s1b}
                        </span>
                    </div>
                )}
            </div>
        </div>

        <TeamBox team={teamB} align="left" isWinner={match.winnerId === teamB.id} />
      </div>
    </div>
  );
};
