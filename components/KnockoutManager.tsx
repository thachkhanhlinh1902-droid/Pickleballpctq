
import React, { useState } from 'react';
import { CategoryData, Match, Team } from '../types';
import { useStore } from '../context/Store';
import { calculateGroupRanking } from '../utils/logic';
import { RefreshCcw, Medal, LayoutGrid, GitBranch } from 'lucide-react';
import { MatchCard } from './MatchCard';
import { TournamentBracket } from './TournamentBracket';

interface Props {
  categoryData: CategoryData;
}

export const KnockoutManager: React.FC<Props> = ({ categoryData }) => {
  const { addKnockoutMatch, updateMatch, isAdmin } = useStore();
  const { key, matches, groups, teams } = categoryData;
  const knockoutMatches = matches.filter(m => !m.groupId);
  const [lanhDaoOption, setLanhDaoOption] = useState<'A' | 'B'>('A');
  const [viewMode, setViewMode] = useState<'bracket' | 'grid'>('bracket');

  const getRanked = (groupName: string) => {
    const group = groups.find(g => g.name === groupName);
    return group ? calculateGroupRanking(teams, matches, group.id) : [];
  };

  /**
   * Tính toán điểm số "Công bằng" cho đội hạng 3 để xét vé vớt
   * Nếu bảng có 5 đội, loại bỏ kết quả với đội bét bảng (hạng 5)
   */
  const getAdjustedThirdPlaceStats = (groupName: string) => {
    const group = groups.find(g => g.name === groupName);
    if (!group) return null;
    
    const ranking = calculateGroupRanking(teams, matches, group.id);
    const team = ranking[2]; // Đội hạng 3
    if (!team) return null;

    let points = team.stats?.points || 0;
    let diff = team.stats?.pointsDiff || 0;

    // Nếu bảng có 5 đội, thực hiện loại trừ trận với đội hạng 5
    if (ranking.length >= 5) {
        const lastTeam = ranking[ranking.length - 1];
        const groupMatches = matches.filter(m => m.groupId === group.id && m.isFinished);
        const matchAgainstLast = groupMatches.find(m => 
            (m.teamAId === team.id && m.teamBId === lastTeam.id) ||
            (m.teamAId === lastTeam.id && m.teamBId === team.id)
        );

        if (matchAgainstLast) {
            const isA = matchAgainstLast.teamAId === team.id;
            const scoreSelf = isA ? matchAgainstLast.score.set1.a : matchAgainstLast.score.set1.b;
            const scoreOpp = isA ? matchAgainstLast.score.set1.b : matchAgainstLast.score.set1.a;
            
            // Loại bỏ điểm (thường là thắng được 2 điểm)
            if (matchAgainstLast.winnerId === team.id) points -= 2;
            // Loại bỏ hiệu số
            diff -= (scoreSelf - scoreOpp);
        }
    }

    return { team, points, diff };
  };

  const runLogic = () => {
    if (!isAdmin) return;
    const isNamNu = key === 'namnu';
    const courtPrefix = isNamNu ? 'B' : 'A';
    const defaultTime = isNamNu ? '14:00 19/12' : '08:00 19/12';

    const createOrUpdate = (note: string, roundName: string, tA: Team | null, tB: Team | null, mNum: number) => {
        const existing = knockoutMatches.find(m => m.note === note);
        if (existing) {
            if (!existing.isFinished) {
                updateMatch(key, { ...existing, teamAId: tA?.id || null, teamBId: tB?.id || null, matchNumber: mNum });
            }
        } else {
            addKnockoutMatch(key, {
                id: crypto.randomUUID(), teamAId: tA?.id || null, teamBId: tB?.id || null,
                score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } },
                isFinished: false, winnerId: null, roundName, category: key, note,
                time: defaultTime, court: `Sân ${courtPrefix}1`, matchNumber: mNum
            });
        }
    };

    if (key === 'lanhdao' || key === 'nam') {
        const rA = getRanked('A'); const rB = getRanked('B'); const rC = getRanked('C'); const rD = getRanked('D');
        
        let tB1 = rB[0], tB2 = rB[1], tD1 = rD[0], tD2 = rD[1];
        if (key === 'lanhdao' && lanhDaoOption === 'B') {
            tB1 = rB[1] || null; tB2 = rB[2] || null; 
            tD1 = rD[1] || null; tD2 = rD[2] || null;
        }

        /**
         * SẮP XẾP CHỐNG TÁI ĐẤU (4 BẢNG):
         * Đã hoán đổi vị trí trận 2 và 3 (TK2 <=> TK3)
         * Nhánh 1: TK1 + TK2
         * Nhánh 2: TK3 + TK4
         */
        createOrUpdate('TK1', 'Tứ kết 1 (1A-2D)', rA[0] || null, tD2 || null, 1);
        createOrUpdate('TK2', 'Tứ kết 2 (1D-2A)', tD1 || null, rA[1] || null, 2); // Đổi 3 thành 2
        createOrUpdate('TK3', 'Tứ kết 3 (1C-2B)', rC[0] || null, tB2 || null, 3); // Đổi 2 thành 3
        createOrUpdate('TK4', 'Tứ kết 4 (1B-2C)', tB1 || null, rC[1] || null, 4);
        
        createOrUpdate('BK1', 'Bán kết 1', null, null, 5); 
        createOrUpdate('BK2', 'Bán kết 2', null, null, 6);
        createOrUpdate('CK', 'Chung kết', null, null, 7);
    } 
    else if (key === 'namnu') {
        const rA = getRanked('A'); const rB = getRanked('B'); const rC = getRanked('C');
        
        // Tính toán vé vớt dựa trên điểm số đã điều chỉnh (Normalised)
        const adjA = getAdjustedThirdPlaceStats('A');
        const adjB = getAdjustedThirdPlaceStats('B');
        const adjC = getAdjustedThirdPlaceStats('C');

        const thirds = [adjA, adjB, adjC]
            .filter(x => x !== null)
            .sort((a, b) => (b!.points - a!.points) || (b!.diff - a!.diff));

        const LL1 = thirds[0]?.team || null;
        const LL2 = thirds[1]?.team || null;

        /**
         * LOGIC NAM NỮ (3 bảng + 2 vé vớt):
         * TK1: 1A - LL2
         * TK2: 1B - 2C
         * TK3: 2A - LL1
         * TK4: 1C - 2B
         */
        createOrUpdate('TK1', 'Tứ kết 1 (1A-LL2)', rA[0] || null, LL2, 1);
        createOrUpdate('TK2', 'Tứ kết 2 (1B-2C)', rB[0] || null, rC[1] || null, 2);
        createOrUpdate('TK3', 'Tứ kết 3 (2A-LL1)', rA[1] || null, LL1, 3);
        createOrUpdate('TK4', 'Tứ kết 4 (1C-2B)', rC[0] || null, rB[1] || null, 4);
        
        createOrUpdate('BK1', 'Bán kết 1', null, null, 5); 
        createOrUpdate('BK2', 'Bán kết 2', null, null, 6);
        createOrUpdate('CK', 'Chung kết', null, null, 7);
    } 
    else if (key === 'nu') {
        const rA = getRanked('A'); const rB = getRanked('B');
        createOrUpdate('BK1', 'Bán kết 1 (1A-2B)', rA[0] || null, rB[1] || null, 1);
        createOrUpdate('BK2', 'Bán kết 2 (1B-2A)', rB[0] || null, rA[1] || null, 2);
        createOrUpdate('CK', 'Chung kết', null, null, 3);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-100 p-4 rounded-xl border border-slate-200 gap-4">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-700 flex items-center gap-3 italic uppercase"><Medal size={24} className="text-orange-500" /> Playoff</h2>
            <div className="flex bg-white rounded-lg p-1 border border-slate-300 shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}><LayoutGrid size={16}/></button>
                <button onClick={() => setViewMode('bracket')} className={`p-1.5 rounded-md transition-all ${viewMode === 'bracket' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}><GitBranch size={16}/></button>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {key === 'lanhdao' && isAdmin && (
                <div className="flex bg-white rounded-lg p-1 border border-slate-300 shadow-sm">
                    <button onClick={() => setLanhDaoOption('A')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${lanhDaoOption === 'A' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}>P.Án A</button>
                    <button onClick={() => setLanhDaoOption('B')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${lanhDaoOption === 'B' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}>P.Án B</button>
                </div>
            )}
            {isAdmin && <button onClick={runLogic} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold text-xs uppercase shadow-md active:scale-95 transition-all"><RefreshCcw size={16} /> Cập nhật Nhánh</button>}
        </div>
      </div>

      <div className="min-h-[400px]">
          {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {knockoutMatches.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-slate-400 uppercase font-bold text-xs bg-white rounded-xl border-2 border-dashed">Chưa có dữ liệu vòng chung kết</div>
                  ) : knockoutMatches.sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0)).map(m => (
                      <MatchCard key={m.id} match={m} teamA={teams.find(t=>t.id===m.teamAId)} teamB={teams.find(t=>t.id===m.teamBId)} categoryName="" isKnockout={true} />
                  ))}
              </div>
          ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-[600px]">
                  <TournamentBracket matches={knockoutMatches} teams={teams} />
              </div>
          )}
      </div>
    </div>
  );
};
