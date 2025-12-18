
import React, { useState, useEffect } from 'react';
import { Match, Team } from '../types';
import { FileDown, Clock, MapPin } from 'lucide-react';
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
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-2 opacity-60 italic text-[10px] text-center">Chờ xác định: {match.roundName}</div>
  );

  const [time, date] = (match.time || '--:-- --/--').split(' ');

  const TeamBox = ({ team, align }: { team: Team, align: 'right' | 'left' }) => (
    <div className={`flex-1 ${align === 'right' ? 'text-right pr-1' : 'text-left pl-1'} min-w-0`}>
        <div className={`text-[11px] font-black leading-[1.1] ${match.winnerId === team.id ? 'text-green-700' : 'text-slate-800'}`}>
            <div className="truncate">{team.name1}</div>
            <div className="truncate">{team.name2}</div>
        </div>
        <div className="text-[8px] text-slate-400 italic truncate mt-0.5 leading-none">{team.org}</div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-md border-2 mb-2 relative transition-all overflow-hidden ${match.isFinished ? 'border-green-500' : 'border-slate-200'}`}>
      <div className={`bg-slate-50 px-2 py-1 flex justify-between items-center border-b text-[9px] font-black uppercase`}>
         <span className={isKnockout ? 'text-red-600' : 'text-blue-600'}>{match.roundName}</span>
         <button onClick={() => generateMatchReport(match, teamA, teamB, categoryName)} className="text-slate-300 hover:text-green-600 transition-colors"><FileDown size={14}/></button>
      </div>

      <div className="p-2.5 flex items-center justify-between gap-1">
        <TeamBox team={teamA} align="right" />

        <div className="flex flex-col items-center shrink-0 min-w-[80px]">
            <div className="text-[8px] font-bold text-blue-500 mb-1 leading-none">{time} <span className="text-slate-200">{date}</span></div>
            <div className={`flex items-center justify-center p-1 rounded-lg border shadow-inner ${match.isFinished ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                {isAdmin ? (
                    <div className="flex items-center gap-1">
                        <input type="number" className="w-8 h-8 text-center font-black rounded border bg-white text-xs outline-none" value={s1a} onChange={e=>setS1a(Number(e.target.value))} onBlur={() => updateMatch(match.category, { ...match, score: { ...match.score, set1: { a: s1a, b: s1b } } })}/>
                        <span className="font-bold text-slate-400">:</span>
                        <input type="number" className="w-8 h-8 text-center font-black rounded border bg-white text-xs outline-none" value={s1b} onChange={e=>setS1b(Number(e.target.value))} onBlur={() => updateMatch(match.category, { ...match, score: { ...match.score, set1: { a: s1a, b: s1b } } })}/>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 font-mono font-black text-lg">
                        <span className={match.winnerId === teamA.id ? 'text-yellow-400' : match.isFinished ? 'text-slate-500' : 'text-slate-200'}>{s1a}</span>
                        <span className="text-slate-600 opacity-20">-</span>
                        <span className={match.winnerId === teamB.id ? 'text-yellow-400' : match.isFinished ? 'text-slate-500' : 'text-slate-200'}>{s1b}</span>
                    </div>
                )}
            </div>
            <div className="text-[8px] font-black text-orange-600 mt-1 uppercase flex items-center gap-0.5">
                <MapPin size={8}/> {match.court || '---'}
            </div>
        </div>

        <TeamBox team={teamB} align="left" />
      </div>
    </div>
  );
};
