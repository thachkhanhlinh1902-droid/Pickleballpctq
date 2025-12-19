
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
      <div className={`flex items-center h-12 px-3 transition-all duration-300 ${isWinner ? 'bg-blue-600' : 'bg-white'} ${isTop ? 'border-b border-slate-100' : ''}`}>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
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
            {isWinner && (
              <div className="flex items-center gap-1 shrink-0 animate-in zoom-in duration-500">
                <Crown size={10} className="text-yellow-300 fill-yellow-300" />
                {isFinal && (
                  <span className="bg-yellow-400 text-blue-900 text-[8px] px-1.5 rounded font-black animate-pulse whitespace-nowrap shadow-sm">
                    VÔ ĐỊCH
                  </span>
                )}
              </div>
            )}
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
      <div className={`bg-white border-2 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isFinal ? 'border-yellow-500 shadow-yellow-500/30 ring-4 ring-yellow-400/10' : 'border-slate-200 group-hover:border-blue-400 group-hover:shadow-blue-100'}`}>
        {renderTeam(tA, 'a', true)}
        {renderTeam(tB, 'b', false)}
      </div>

      {(match?.time || match?.court) && (
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-1 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
            {match.time && <span className="text-[6px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">{match.time}</span>}
            {match.court && <span className="text-[6px] font-black text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 uppercase">{match.court}</span>}
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
        <span className="italic text-[10px] uppercase font-black tracking-widest text-slate-300">Chưa có thông tin Playoff</span>
      </div>
    );
  }

  const RoundHeader = ({ label }: { label: string }) => (
    <div className="mb-8 w-full flex justify-center">
        <div className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] py-2 px-8 rounded-full shadow-lg border-b-2 border-blue-500">
            {label}
        </div>
    </div>
  );

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-auto custom-scrollbar bg-[#f8fafc] relative">
      <div className="min-w-max flex flex-col items-center py-12 px-12">
        <div className="flex items-start gap-16 lg:gap-24">
            
            {/* TỨ KẾT */}
            {tk.some(m => m) && (
              <div className="flex flex-col w-72 animate-in slide-in-from-left-4 duration-500">
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
            <div className="flex flex-col w-72 animate-in fade-in duration-700 delay-200">
                <RoundHeader label="Vòng Bán Kết" />
                <div className="flex flex-col gap-[120px] pt-[64px]">
                    <BracketMatch match={bk[0]} teams={teams} />
                    <BracketMatch match={bk[1]} teams={teams} />
                </div>
            </div>

            {/* CHUNG KẾT */}
            <div className="flex flex-col w-72 animate-in slide-in-from-right-4 duration-1000 delay-300">
                <RoundHeader label="Trận Chung Kết" />
                <div className="flex flex-col items-center pt-[144px]">
                    <div className="mb-8 relative group">
                        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl relative z-10 ring-4 ring-white group-hover:scale-110 transition-transform duration-500">
                            <Trophy size={48} className="text-white drop-shadow-md" />
                        </div>
                    </div>
                    <BracketMatch match={ck} teams={teams} isFinal={true} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
