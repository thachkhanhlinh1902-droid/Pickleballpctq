
import React from 'react';
import { Match, Team } from '../types';
import { Trophy, Crown, Shield, MapPin } from 'lucide-react';

interface Props {
  matches: Match[];
  teams: Team[];
}

const BracketMatch: React.FC<{ match: Match | undefined, teams: Team[], isFinal?: boolean }> = ({ match, teams, isFinal }) => {
  const tA = teams.find(t => t.id === match?.teamAId);
  const tB = teams.find(t => t.id === match?.teamBId);
  
  const renderTeam = (team: Team | undefined, isWinner: boolean, score: number | undefined, side: 'top' | 'bottom') => (
    <div className={`flex items-center h-14 px-3 transition-all ${isWinner ? 'bg-blue-600' : 'bg-white'} ${side === 'top' ? 'border-b border-slate-100' : ''}`}>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <div className={`text-[10px] font-black leading-tight uppercase tracking-tighter ${isWinner ? 'text-white' : team ? 'text-slate-900' : 'text-slate-300'}`}>
            {team ? (
              <div className="flex flex-col">
                <span className="truncate">{team.name1}</span>
                <span className="truncate">{team.name2}</span>
              </div>
            ) : (
              'CHỜ XÁC ĐỊNH'
            )}
          </div>
          {isWinner && <Crown size={12} className="text-yellow-300 fill-yellow-300 shrink-0" />}
        </div>
        {team?.org && (
          <span className={`text-[7px] font-bold mt-0.5 uppercase tracking-tighter italic ${isWinner ? 'text-blue-100' : 'text-slate-400'}`}>
            {team.org}
          </span>
        )}
      </div>
      <div className={`w-10 h-full flex items-center justify-center font-mono font-black text-lg border-l ${isWinner ? 'bg-blue-700 text-white border-blue-500' : match?.isFinished ? 'bg-slate-100 text-slate-900 border-slate-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
        {match?.isFinished ? score : (score !== undefined ? score : '-')}
      </div>
    </div>
  );

  return (
    <div className={`w-60 shrink-0 relative flex flex-col group ${isFinal ? 'scale-105 z-20' : 'z-10'}`}>
      <div className={`bg-white border-2 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isFinal ? 'border-yellow-500 shadow-yellow-500/30' : 'border-slate-300 group-hover:border-blue-500'}`}>
        {renderTeam(tA, match?.isFinished ? match.winnerId === tA?.id : false, match?.score.set1.a, 'top')}
        {renderTeam(tB, match?.isFinished ? match.winnerId === tB?.id : false, match?.score.set1.b, 'bottom')}
      </div>

      {(match?.time || match?.court) && (
        <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {match.time && <span className="text-[7px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">{match.time}</span>}
            {match.court && <span className="text-[7px] font-black text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 uppercase">{match.court}</span>}
        </div>
      )}
    </div>
  );
};

export const TournamentBracket: React.FC<Props> = ({ matches, teams }) => {
  const getM = (note: string) => matches.find(m => m.note === note);
  const tk = [getM('TK1'), getM('TK2'), getM('TK3'), getM('TK4')];
  const bk = [getM('BK1'), getM('BK2')];
  const ck = getM('CK');

  if (!ck && tk.every(m => !m) && bk.every(m => !m)) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-12 bg-slate-50">
        <Shield size={40} className="text-slate-200" />
        <span className="italic text-xs uppercase font-black tracking-widest text-slate-300">Nhánh đấu trống</span>
      </div>
    );
  }

  const RoundHeader = ({ label }: { label: string }) => (
    <div className="mb-10 w-full flex justify-center">
        <div className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] py-2 px-8 rounded-full shadow-md border-b-2 border-blue-500">
            {label}
        </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-auto custom-scrollbar bg-[#f8fafc] relative">
      <div className="min-w-max flex flex-col items-center py-16 px-16">
        <div className="flex items-stretch gap-16 lg:gap-20 relative">
            
            {/* TK */}
            {tk.some(m => m) && (
              <div className="flex flex-col w-60">
                <RoundHeader label="Tứ Kết" />
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-16 relative">
                        <div className="relative z-10">
                            <BracketMatch match={tk[0]} teams={teams} />
                            <div className="absolute -right-8 lg:-right-10 top-1/2 w-8 lg:w-10 h-[102px] border-t-2 border-r-2 border-slate-300 pointer-events-none rounded-tr-xl"></div>
                        </div>
                        <div className="relative z-10">
                            <BracketMatch match={tk[1]} teams={teams} />
                            <div className="absolute -right-8 lg:-right-10 top-1/2 w-8 lg:w-10 h-[102px] border-b-2 border-r-2 border-slate-300 -translate-y-full pointer-events-none rounded-br-xl"></div>
                        </div>
                    </div>
                    <div className="h-8"></div>
                    <div className="flex flex-col gap-16 relative">
                        <div className="relative z-10">
                            <BracketMatch match={tk[2]} teams={teams} />
                            <div className="absolute -right-8 lg:-right-10 top-1/2 w-8 lg:w-10 h-[102px] border-t-2 border-r-2 border-slate-300 pointer-events-none rounded-tr-xl"></div>
                        </div>
                        <div className="relative z-10">
                            <BracketMatch match={tk[3]} teams={teams} />
                            <div className="absolute -right-8 lg:-right-10 top-1/2 w-8 lg:w-10 h-[102px] border-b-2 border-r-2 border-slate-300 -translate-y-full pointer-events-none rounded-br-xl"></div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* BK */}
            <div className="flex flex-col w-60">
                <RoundHeader label="Bán Kết" />
                <div className="flex flex-col justify-around flex-1 py-[58px] gap-[222px]">
                    <div className="relative z-10">
                        <div className="absolute -left-8 lg:-left-10 top-1/2 w-8 lg:w-10 h-px bg-slate-300 -translate-y-1/2"></div>
                        <BracketMatch match={bk[0]} teams={teams} />
                        <div className="absolute -right-8 lg:-right-10 top-1/2 w-8 lg:w-10 h-[162px] border-t-2 border-r-2 border-slate-300 pointer-events-none rounded-tr-xl"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="absolute -left-8 lg:-left-10 top-1/2 w-8 lg:w-10 h-px bg-slate-300 -translate-y-1/2"></div>
                        <BracketMatch match={bk[1]} teams={teams} />
                        <div className="absolute -right-8 lg:-right-10 top-1/2 w-8 lg:w-10 h-[162px] border-b-2 border-r-2 border-slate-300 -translate-y-full pointer-events-none rounded-br-xl"></div>
                    </div>
                </div>
            </div>

            {/* CK */}
            <div className="flex flex-col w-60">
                <RoundHeader label="Chung Kết" />
                <div className="flex flex-col justify-center flex-1 relative">
                    <div className="absolute -left-8 lg:-left-10 top-1/2 w-8 lg:w-10 h-px bg-slate-300 -translate-y-1/2 pointer-events-none"></div>
                    <div className="flex flex-col items-center">
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20"></div>
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg relative z-10 ring-4 ring-white">
                                <Trophy size={40} className="text-white drop-shadow-sm" />
                            </div>
                        </div>
                        <BracketMatch match={ck} teams={teams} isFinal={true} />
                        {ck?.isFinished && (
                            <div className="mt-8 text-center animate-in zoom-in duration-300 bg-slate-900 border border-yellow-500 text-yellow-500 px-5 py-1.5 rounded-md font-black uppercase text-[9px] tracking-widest">
                                CHAMPIONS 2024
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
