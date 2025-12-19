
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

        <div className={`flex items-center h-full border-l ${isWinner ? 'border-blue-500' : 'border-slate-100'}`}>
          {!isBo3 ? (
            <div className={`w-10 h-full flex items-center justify-center font-mono font-black text-base ${isWinner ? 'bg-blue-700 text-white' : match?.isFinished ? 'bg-slate-100 text-slate-900' : 'bg-slate-50 text-slate-400'}`}>
              {match ? match.score.set1[side] : '-'}
            </div>
          ) : (
            <div className="flex h-full divide-x divide-white/10">
              {[1, 2, 3].map(setNum => {
                const sKey = `set${setNum}` as keyof typeof match.score;
                const scoreSelf = match?.score[sKey][side] || 0;
                const scoreOpp = match?.score[sKey][side === 'a' ? 'b' : 'a'] || 0;
                const isSetWinner = scoreSelf > scoreOpp;
                const hasScore = scoreSelf > 0 || scoreOpp > 0 || match?.isFinished;

                return (
                  <div key={setNum} className={`w-8 h-full flex items-center justify-center font-mono font-black text-[10px] ${isWinner ? (isSetWinner ? 'bg-blue-800 text-yellow-400' : 'bg-blue-700 text-blue-300') : (isSetWinner ? 'bg-slate-200 text-blue-700' : 'bg-slate-50 text-slate-400')}`}>
                    {hasScore ? scoreSelf : '-'}
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
    <div className={`w-72 shrink-0 relative flex flex-col group ${isFinal ? 'scale-105 z-20' : 'z-10'}`}>
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
    <div className="mb-6 w-full flex justify-center">
        <div className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-[0.2em] py-1.5 px-6 rounded-full shadow-sm border-b-2 border-blue-500">
            {label}
        </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-auto custom-scrollbar bg-[#f8fafc] relative">
      <div className="min-w-max flex flex-col items-center py-12 px-12">
        <div className="flex items-start gap-12 lg:gap-20">
            
            {/* TỨ KẾT */}
            {tk.some(m => m) && (
              <div className="flex flex-col w-72">
                <RoundHeader label="Vòng Tứ Kết" />
                <div className="flex flex-col gap-10">
                    <BracketMatch match={tk[0]} teams={teams} />
                    <BracketMatch match={tk[1]} teams={teams} />
                    <div className="h-4"></div>
                    <BracketMatch match={tk[2]} teams={teams} />
                    <BracketMatch match={tk[3]} teams={teams} />
                </div>
              </div>
            )}

            {/* BÁN KẾT */}
            <div className="flex flex-col w-72">
                <RoundHeader label="Vòng Bán Kết" />
                <div className="flex flex-col gap-[120px] pt-[60px]">
                    <BracketMatch match={bk[0]} teams={teams} />
                    <BracketMatch match={bk[1]} teams={teams} />
                </div>
            </div>

            {/* CHUNG KẾT */}
            <div className="flex flex-col w-72">
                <RoundHeader label="Trận Chung Kết" />
                <div className="flex flex-col items-center pt-[140px]">
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20"></div>
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl relative z-10 ring-4 ring-white">
                            <Trophy size={40} className="text-white drop-shadow-sm" />
                        </div>
                    </div>
                    <BracketMatch match={ck} teams={teams} isFinal={true} />
                    {ck?.isFinished && (
                        <div className="mt-8 text-center animate-bounce bg-slate-900 border border-yellow-500 text-yellow-400 px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl ring-4 ring-yellow-400/20">
                            VÔ ĐỊCH
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
