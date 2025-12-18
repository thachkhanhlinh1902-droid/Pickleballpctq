
import React from 'react';
import { CategoryData, Match, Team } from '../types';
import { useStore } from '../context/Store';
import { calculateGroupRanking } from '../utils/logic';
import { RefreshCcw, Medal, Trophy, Clock, MapPin } from 'lucide-react';
import { MatchCard } from './MatchCard';

interface Props {
  categoryData: CategoryData;
}

export const KnockoutManager: React.FC<Props> = ({ categoryData }) => {
  const { addKnockoutMatch, updateMatch, isAdmin } = useStore();
  const { key, matches, groups, teams } = categoryData;
  const knockoutMatches = matches.filter(m => !m.groupId);

  const getRank = (groupName: string, rankIndex: number): Team | null => {
      const group = groups.find(g => g.name === groupName);
      if (!group) return null;
      const ranking = calculateGroupRanking(teams, matches, group.id);
      return ranking[rankIndex] || null;
  }

  const runLogic = () => {
    if (!isAdmin) return;
    const A1 = getRank('A', 0); const A2 = getRank('A', 1);
    const B1 = getRank('B', 0); const B2 = getRank('B', 1);
    const C1 = getRank('C', 0); const C2 = getRank('C', 1);
    const D1 = getRank('D', 0); const D2 = getRank('D', 1);

    const isNamNu = key === 'namnu';
    const courtPrefix = isNamNu ? 'B' : 'A';
    const defaultTime = isNamNu ? '14:00 19/12' : '08:00 19/12';

    const createOrUpdate = (note: string, roundName: string, tA: Team | null, tB: Team | null) => {
        const existing = knockoutMatches.find(m => m.note === note);
        if (existing) {
             if (!existing.isFinished) {
                 updateMatch(key, { 
                     ...existing, 
                     teamAId: existing.teamAId || tA?.id || null, 
                     teamBId: existing.teamBId || tB?.id || null 
                 });
             }
        } else {
             addKnockoutMatch(key, {
                id: crypto.randomUUID(),
                teamAId: tA?.id || null,
                teamBId: tB?.id || null,
                score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } },
                isFinished: false,
                winnerId: null,
                roundName,
                category: key,
                note: note,
                time: defaultTime,
                court: `Sân ${courtPrefix}1`
            });
        }
    };

    if (key === 'lanhdao' || key === 'nam') {
        createOrUpdate('TK1', 'Tứ kết 1', A1, B2);
        createOrUpdate('TK2', 'Tứ kết 2', C1, A2);
        createOrUpdate('TK3', 'Tứ kết 3', B1, D2);
        createOrUpdate('TK4', 'Tứ kết 4', D1, C2); 
        createOrUpdate('BK1', 'Bán kết 1', null, null);
        createOrUpdate('BK2', 'Bán kết 2', null, null);
        createOrUpdate('CK', 'Chung kết', null, null);
    } else if (key === 'namnu') {
        createOrUpdate('TK1', 'Tứ kết 1', A2, B2);
        createOrUpdate('TK2', 'Tứ kết 2', C2, A2);
        createOrUpdate('BK1', 'Bán kết 1', A1, null);
        createOrUpdate('BK2', 'Bán kết 2', B1, null);
        createOrUpdate('CK', 'Chung kết', null, null);
    } else if (key === 'nu') {
        createOrUpdate('BK1', 'Bán kết 1', A1, B2);
        createOrUpdate('BK2', 'Bán kết 2', B1, A2);
        createOrUpdate('CK', 'Chung kết', null, null);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-8 bg-slate-100 p-4 rounded-xl border border-slate-200">
        <h2 className="text-xl font-black text-slate-700 flex items-center gap-3 italic uppercase">
            <Medal size={28} className="text-orange-500" /> Vòng Chung Kết (19/12)
        </h2>
        {isAdmin && (
            <button onClick={runLogic} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-lg font-bold transition-all active:scale-95 text-xs uppercase tracking-widest">
                <RefreshCcw size={18} /> Cập nhật Nhánh
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knockoutMatches.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white opacity-50">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Chưa có dữ liệu vòng chung kết</p>
              </div>
          ) : (
              knockoutMatches.sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0)).map(m => (
                  <MatchCard key={m.id} match={m} teamA={teams.find(t=>t.id===m.teamAId)} teamB={teams.find(t=>t.id===m.teamBId)} categoryName="" isKnockout={true} />
              ))
          )}
      </div>
    </div>
  );
};
