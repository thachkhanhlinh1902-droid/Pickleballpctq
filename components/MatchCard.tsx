
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
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-2 opacity-60 italic text-xs text-center">Chờ xác định cặp đấu: {match.roundName}</div>
  );

  const cardStyle = match.isFinished ? 'border-green-500' : 'border-slate-200';

  return (
    <div className={`bg-white rounded-xl shadow-md border-2 mb-3 relative transition-all duration-500 overflow-hidden ${cardStyle}`}>
      
      <div className={`bg-slate-50 px-3 py-1.5 flex justify-between items-center border-b text-[10px] font-bold`}>
         <div className="flex items-center gap-3">
             <span className={`uppercase px-2 py-0.5 rounded ${isKnockout ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700'}`}>{match.roundName}</span>
             <div className="flex items-center gap-1 text-blue-600"><Clock size={12}/> {match.time || '--:--'}</div>
             <div className="flex items-center gap-1 text-orange-600"><MapPin size={12}/> {match.court || '---'}</div>
         </div>
         <button onClick={() => generateMatchReport(match, teamA, teamB, categoryName)} className="text-slate-400 hover:text-green-600 transition-colors"><FileDown size={14}/></button>
      </div>

      <div className="p-3 flex items-center justify-between gap-3">
        <div className="flex-1 text-right">
            <div className={`text-sm font-black leading-tight truncate ${match.winnerId === teamA.id ? 'text-green-700' : 'text-slate-800'}`}>{teamA.name1}</div>
            <div className={`text-sm font-black leading-tight truncate ${match.winnerId === teamA.id ? 'text-green-700' : 'text-slate-800'}`}>{teamA.name2}</div>
            <div className="text-[9px] text-slate-500 italic truncate mt-1">{teamA.org}</div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-slate-100 border-slate-200`}>
            {isAdmin ? (
                <div className="flex items-center gap-1">
                    <input type="number" className="w-8 h-8 text-center font-black rounded border bg-white" value={s1a} onChange={e=>setS1a(Number(e.target.value))} onBlur={() => updateMatch(match.category, { ...match, score: { ...match.score, set1: { a: s1a, b: s1b } } })}/>
                    <span className="font-black text-slate-300">:</span>
                    <input type="number" className="w-8 h-8 text-center font-black rounded border bg-white" value={s1b} onChange={e=>setS1b(Number(e.target.value))} onBlur={() => updateMatch(match.category, { ...match, score: { ...match.score, set1: { a: s1a, b: s1b } } })}/>
                </div>
            ) : (
                <div className="flex items-center gap-2 font-black text-xl">
                    <span className={match.winnerId === teamA.id ? 'text-green-600' : ''}>{s1a}</span>
                    <span className="text-slate-300">:</span>
                    <span className={match.winnerId === teamB.id ? 'text-green-600' : ''}>{s1b}</span>
                </div>
            )}
        </div>

        <div className="flex-1 text-left">
            <div className={`text-sm font-black leading-tight truncate ${match.winnerId === teamB.id ? 'text-green-700' : 'text-slate-800'}`}>{teamB.name1}</div>
            <div className={`text-sm font-black leading-tight truncate ${match.winnerId === teamB.id ? 'text-green-700' : 'text-slate-800'}`}>{teamB.name2}</div>
            <div className="text-[9px] text-slate-500 italic truncate mt-1">{teamB.org}</div>
        </div>
      </div>
    </div>
  );
};
