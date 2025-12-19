
import React from 'react';
import { Match, Team } from '../types';
import { Trophy, Crown, Shield } from 'lucide-react';

interface Props {
  matches: Match[];
  teams: Team[];
}

const BracketMatch: React.FC<{ match: Match | undefined, teams: Team[], isFinal?: boolean }> = ({ match, teams, isFinal }) => {
  const tA = teams.find(t => t.id === match?.teamAId);
  const tB = teams.find(t => t.id === match?.teamBId);
  
  const isBo3 = match?.note === 'CK' || match?.roundName.toLowerCase().includes('chung kết');

  const renderTeam = (team: Team | undefined, side: 'a' | 'b', isTop: boolean) => {
    const isWinner = match?.isFinished && match.winnerId === team?.id;
    
    return (
      <div className={`flex items-center h-12 px-3 transition-all ${isWinner ? 'bg-blue-600' : 'bg-white'} ${isTop ? 'border-b border-slate-100' : ''}`}>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1">
            <div className={`text-[9px] font-black leading-tight uppercase tracking-tighter ${isWinner ? 'text-white' : team ? 'text-slate-900' : 'text-slate-300'}`}>
              {team ? (
                <div className="flex flex-col">
                  <span className="truncate">{team.name1}</span>
                  <span className="truncate">{team.name2}</span>
                </div>
              ) : (
                'CHỜ XÁC ĐỊNH'
              )}
            </div>
            {isWinner && <Crown size={10} className="text-yellow-300 fill-yellow-300 shrink-0" />}
          </div>
          {team?.org && (
            <span className={`text-[7px] font-bold mt-0.5 uppercase tracking-tighter italic ${isWinner ? 'text-blue-100' : 'text-slate-400'}`}>
              {team.org}
            </span>
          )}
        </div>

        {/* PHẦN ĐIỂM SỐ */}
        <div className={`flex items-center h-full border-l ${isWinner ? 'border-blue-500' : 'border-slate-100'}`}>
          {!isBo3 ? (
            // Trận Bo1: Chỉ 1 ô điểm to
            <div className={`w-10 h-full flex items-center justify-center font-mono font-black text-base ${isWinner ? 'bg-blue-700 text-white' : match?.isFinished ? 'bg-slate-100 text-slate-900' : 'bg-slate-50 text-slate-400'}`}>
              {match ? match.score.set1[side] : '-'}
            </div>
          ) : (
            // Trận Bo3: 3 ô điểm nhỏ xếp ngang
            <div className="flex h-full divide-x divide-white/10">
              {[1, 2, 3].map(setNum => {
                const sKey = `set${setNum}` as keyof typeof match.score;
                const scoreA = match?.score[sKey].a || 0;
                const scoreB = match?.score[sKey].b || 0;
                const isSetWinner = (side === 'a' && scoreA > scoreB) || (side === 'b' && scoreB > scoreA);
                const hasScore = scoreA > 0 || scoreB > 0 || match?.isFinished;

                return (
                  <div key={setNum} className={`w-7 h-full flex items-center justify-center font-mono font-black text-[10px] ${isWinner ? (isSetWinner ? 'bg-blue-800 text-yellow-400' : 'bg-blue-700 text-blue-300') : (isSetWinner ? 'bg-slate-200 text-blue-700' : 'bg-slate-50 text-slate-400')}`}>
                    {hasScore ? match?.score[sKey][side] : '-'}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-64 shrink-0 relative flex flex-col group ${isFinal ? 'scale-105 z-20' : 'z-10'}`}>
      <div className={`bg-white border-2 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isFinal ? 'border-yellow-500 shadow-yellow-500/20 ring-4 ring-yellow-400/10' : 'border-slate-300 group-hover:border-blue-500'}`}>
        {renderTeam(tA, 'a', true)}
        {renderTeam(tB, 'b', false)}
      </div>

      {(match?.time || match?.court) && (
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {match.time && <span className="text-[6px] font-black text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 uppercase">{match.time}</span>}
            {match.court && <span className="text-[6px] font-black text-orange-700 bg-orange-50 px-1 py-0.5 rounded border border-orange-100 uppercase">{match.court}</span>}
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
      <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 p-8 bg-slate-50">
        <Shield size={32} className="text-slate-200" />
        <span className="italic text-[10px] uppercase font-black tracking-widest text-slate-300">Nhánh đấu trống</span>
      </div>
    );
  }

  const RoundHeader = ({ label }: { label: string }) => (
    <div className="mb-8 w-full flex justify-center">
        <div className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-[0.2em] py-1.5 px-6 rounded-full shadow-sm border-b-2 border-blue-500">
            {label}
        </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-auto custom-scrollbar bg-[#f8fafc] relative">
      <div className="min-w-max flex flex-col items-center py-12 px-12">
        <div className="flex items-stretch gap-12 lg:gap-16 relative">
            
            {/* TK */}
            {tk.some(m => m) && (
              <div className="flex flex-col w-64">
                <RoundHeader label="Tứ Kết (Bo1)" />
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-12 relative">
                        <div className="relative z-10">
                            <BracketMatch match={tk[0]} teams={teams} />
                            <div className="absolute -right-6 lg:-right-8 top-1/2 w-6 lg:w-8 h-[82px] border-t-2 border-r-2 border-slate-300 pointer-events-none rounded-tr-lg"></div>
                        </div>
                        <div className="relative z-10">
                            <BracketMatch match={tk[1]} teams={teams} />
                            <div className="absolute -right-6 lg:-right-8 top-1/2 w-6 lg:w-8 h-[82px] border-b-2 border-r-2 border-slate-300 -translate-y-full pointer-events-none rounded-br-lg"></div>
                        </div>
                    </div>
                    <div className="h-6"></div>
                    <div className="flex flex-col gap-12 relative">
                        <div className="relative z-10">
                            <BracketMatch match={tk[2]} teams={teams} />
                            <div className="absolute -right-6 lg:-right-8 top-1/2 w-6 lg:w-8 h-[82px] border-t-2 border-r-2 border-slate-300 pointer-events-none rounded-tr-lg"></div>
                        </div>
                        <div className="relative z-10">
                            <BracketMatch match={tk[3]} teams={teams} />
                            <div className="absolute -right-6 lg:-right-8 top-1/2 w-6 lg:w-8 h-[82px] border-b-2 border-r-2 border-slate-300 -translate-y-full pointer-events-none rounded-br-lg"></div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* BK */}
            <div className="flex flex-col w-64">
                <RoundHeader label="Bán Kết (Bo1)" />
                <div className="flex flex-col justify-around flex-1 py-[48px] gap-[184px]">
                    <div className="relative z-10">
                        <div className="absolute -left-6 lg:-left-8 top-1/2 w-6 lg:w-8 h-px bg-slate-300 -translate-y-1/2"></div>
                        <BracketMatch match={bk[0]} teams={teams} />
                        <div className="absolute -right-6 lg:-right-8 top-1/2 w-6 lg:w-8 h-[134px] border-t-2 border-r-2 border-slate-300 pointer-events-none rounded-tr-lg"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="absolute -left-6 lg:-left-8 top-1/2 w-6 lg:w-8 h-px bg-slate-300 -translate-y-1/2"></div>
                        <BracketMatch match={bk[1]} teams={teams} />
                        <div className="absolute -right-6 lg:-right-8 top-1/2 w-6 lg:w-8 h-[134px] border-b-2 border-r-2 border-slate-300 -translate-y-full pointer-events-none rounded-br-lg"></div>
                    </div>
                </div>
            </div>

            {/* CK */}
            <div className="flex flex-col w-64">
                <RoundHeader label="Chung Kết (Bo3)" />
                <div className="flex flex-col justify-center flex-1 relative">
                    <div className="absolute -left-6 lg:-left-8 top-1/2 w-6 lg:w-8 h-px bg-slate-300 -translate-y-1/2 pointer-events-none"></div>
                    <div className="flex flex-col items-center">
                        <div className="mb-4 relative">
                            <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-10"></div>
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md relative z-10 ring-4 ring-white">
                                <Trophy size={32} className="text-white drop-shadow-sm" />
                            </div>
                        </div>
                        <BracketMatch match={ck} teams={teams} isFinal={true} />
                        {ck?.isFinished && (
                            <div className="mt-6 text-center animate-in zoom-in duration-300 bg-slate-900 border border-yellow-500 text-yellow-500 px-4 py-1 rounded-md font-black uppercase text-[8px] tracking-widest shadow-lg">
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
