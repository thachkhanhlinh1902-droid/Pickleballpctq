
import React, { useState, useEffect } from 'react';
import { Match, Team, MatchScore } from '../types';
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
  const [score, setScore] = useState<MatchScore>(match.score);

  useEffect(() => {
     setScore(match.score);
  }, [match]);

  if (!teamA || !teamB) return (
    <div className="bg-slate-100 p-6 rounded-2xl border-2 border-dashed border-slate-300 mb-4 opacity-60 flex items-center justify-center">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
        {match.roundName}: ĐANG CHỜ CẶP ĐẤU...
      </span>
    </div>
  );

  // LOGIC: Chỉ Chung kết mới đánh Bo3
  const isBo3 = match.note === 'CK' || match.roundName.toLowerCase().includes('chung kết');

  const handleScoreChange = (set: keyof MatchScore, side: 'a' | 'b', value: number) => {
    const newScore = { ...score, [set]: { ...score[set], [side]: value } };
    setScore(newScore);
    
    let winnerId = null;
    let finished = false;

    if (!isBo3) {
        // Bo1: Chỉ xét séc 1
        if (newScore.set1.a !== newScore.set1.b) {
            winnerId = newScore.set1.a > newScore.set1.b ? teamA.id : teamB.id;
            finished = true;
        }
    } else {
        // Bo3: Thắng 2 séc là thắng trận
        const setsA = (newScore.set1.a > newScore.set1.b ? 1 : 0) + 
                      (newScore.set2.a > newScore.set2.b ? 1 : 0) + 
                      (newScore.set3.a > newScore.set3.b ? 1 : 0);
        const setsB = (newScore.set1.b > newScore.set1.a ? 1 : 0) + 
                      (newScore.set2.b > newScore.set2.a ? 1 : 0) + 
                      (newScore.set3.b > newScore.set3.a ? 1 : 0);
        
        if (setsA >= 2) { 
            winnerId = teamA.id; 
            finished = true; 
        } else if (setsB >= 2) { 
            winnerId = teamB.id; 
            finished = true; 
        }
    }

    updateMatch(match.category, { ...match, score: newScore, winnerId, isFinished: finished });
  };

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

  const ScoreInput = ({ setKey, side }: { setKey: keyof MatchScore, side: 'a' | 'b' }) => (
    <input 
        type="number" 
        className={`w-10 h-10 text-center font-black bg-transparent text-xl outline-none p-0 focus:bg-blue-500/20 rounded-lg ${match.isFinished ? 'text-white' : 'text-blue-900'}`}
        value={score[setKey][side]} 
        onChange={e => handleScoreChange(setKey, side, Number(e.target.value))}
    />
  );

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 mb-4 relative transition-all overflow-hidden ${match.isFinished ? 'border-slate-300 shadow-md' : 'border-blue-200'}`}>
      <div className={`px-4 py-2 flex justify-between items-center text-[9px] font-black uppercase tracking-widest ${match.isFinished ? 'bg-slate-800 text-slate-300' : 'bg-blue-600 text-white'}`}>
         <div className="flex items-center gap-2">
            <span className={isBo3 ? 'text-yellow-400 font-black' : ''}>{match.roundName} {isBo3 ? '(Bo3)' : '(Bo1)'}</span>
            {match.isFinished && <span className="bg-green-500 text-white text-[7px] px-1.5 py-0.5 rounded font-bold ml-2">KẾT THÚC</span>}
         </div>
         <div className="flex items-center gap-3">
             <span className="flex items-center gap-1 opacity-90"><MapPin size={10}/> {match.court || 'SÂN TRỐNG'}</span>
             <button onClick={() => generateMatchReport(match, teamA, teamB, categoryName)} className="hover:text-yellow-400 transition-colors"><FileDown size={14}/></button>
         </div>
      </div>

      <div className="p-4 flex flex-col gap-3 bg-white">
        <div className="flex items-center justify-between gap-3">
            <TeamBox team={teamA} align="right" isWinner={match.winnerId === teamA.id} />

            <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 mb-1 uppercase tracking-tighter">
                   <Calendar size={10} className="text-blue-500" /> {match.time || '--:--'}
                </div>
                
                <div className={`flex flex-col gap-1 items-center justify-center p-1 rounded-xl border-2 transition-all shadow-inner relative overflow-hidden ${match.isFinished ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-100'}`}>
                    {/* Séc 1 */}
                    <div className="flex items-center h-10 divide-x divide-white/10">
                        {isAdmin ? (
                            <>
                                <ScoreInput setKey="set1" side="a" />
                                <span className={`px-1 text-xs font-black ${match.isFinished ? 'text-slate-600' : 'text-blue-300'}`}>1</span>
                                <ScoreInput setKey="set1" side="b" />
                            </>
                        ) : (
                            <div className="flex items-center gap-4 font-mono font-black text-2xl tracking-tighter px-4">
                                <span className={match.winnerId === teamA.id && score.set1.a > score.set1.b ? 'text-yellow-400' : match.isFinished ? 'text-white' : 'text-blue-900'}>{score.set1.a}</span>
                                <span className="text-[10px] text-slate-500">S1</span>
                                <span className={match.winnerId === teamB.id && score.set1.b > score.set1.a ? 'text-yellow-400' : match.isFinished ? 'text-white' : 'text-blue-900'}>{score.set1.b}</span>
                            </div>
                        )}
                    </div>

                    {/* Séc 2 & 3 */}
                    {isBo3 && (
                        <div className="flex flex-col gap-1 w-full border-t border-white/5 pt-1">
                            <div className="flex items-center h-8 divide-x divide-white/10 justify-center">
                                {isAdmin ? (
                                    <>
                                        <input type="number" className={`w-8 h-full text-center font-bold bg-transparent text-sm outline-none ${match.isFinished ? 'text-blue-300' : 'text-blue-600'}`} value={score.set2.a} onChange={e => handleScoreChange('set2', 'a', Number(e.target.value))} />
                                        <span className="px-1 text-[8px] font-black text-slate-500">2</span>
                                        <input type="number" className={`w-8 h-full text-center font-bold bg-transparent text-sm outline-none ${match.isFinished ? 'text-blue-300' : 'text-blue-600'}`} value={score.set2.b} onChange={e => handleScoreChange('set2', 'b', Number(e.target.value))} />
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3 font-mono font-bold text-sm text-slate-400">
                                        <span className={score.set2.a > score.set2.b ? 'text-blue-400' : ''}>{score.set2.a}</span>
                                        <span className="text-[8px]">S2</span>
                                        <span className={score.set2.b > score.set2.a ? 'text-blue-400' : ''}>{score.set2.b}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center h-8 divide-x divide-white/10 justify-center">
                                {isAdmin ? (
                                    <>
                                        <input type="number" className={`w-8 h-full text-center font-bold bg-transparent text-sm outline-none ${match.isFinished ? 'text-blue-300' : 'text-blue-600'}`} value={score.set3.a} onChange={e => handleScoreChange('set3', 'a', Number(e.target.value))} />
                                        <span className="px-1 text-[8px] font-black text-slate-500">3</span>
                                        <input type="number" className={`w-8 h-full text-center font-bold bg-transparent text-sm outline-none ${match.isFinished ? 'text-blue-300' : 'text-blue-600'}`} value={score.set3.b} onChange={e => handleScoreChange('set3', 'b', Number(e.target.value))} />
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3 font-mono font-bold text-sm text-slate-400">
                                        <span className={score.set3.a > score.set3.b ? 'text-blue-400' : ''}>{score.set3.a}</span>
                                        <span className="text-[8px]">S3</span>
                                        <span className={score.set3.b > score.set3.a ? 'text-blue-400' : ''}>{score.set3.b}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <TeamBox team={teamB} align="left" isWinner={match.winnerId === teamB.id} />
        </div>
      </div>
    </div>
  );
};
