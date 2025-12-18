
import React, { useState } from 'react';
import { CategoryData, Match, Team } from '../types';
import { useStore } from '../context/Store';
import { calculateGroupRanking } from '../utils/logic';
import { RefreshCcw, Medal } from 'lucide-react';
import { MatchCard } from './MatchCard';

interface Props {
  categoryData: CategoryData;
}

export const KnockoutManager: React.FC<Props> = ({ categoryData }) => {
  const { addKnockoutMatch, updateMatch, isAdmin } = useStore();
  const { key, matches, groups, teams } = categoryData;
  const knockoutMatches = matches.filter(m => !m.groupId);
  const [lanhDaoOption, setLanhDaoOption] = useState<'A' | 'B'>('A');

  const getRanked = (groupName: string) => {
    const group = groups.find(g => g.name === groupName);
    return group ? calculateGroupRanking(teams, matches, group.id) : [];
  };

  const runLogic = () => {
    if (!isAdmin) return;
    const isNamNu = key === 'namnu';
    const courtPrefix = isNamNu ? 'B' : 'A';
    const defaultTime = isNamNu ? '14:00 19/12' : '08:00 19/12';

    const createOrUpdate = (note: string, roundName: string, tA: Team | null, tB: Team | null) => {
        const existing = knockoutMatches.find(m => m.note === note);
        if (existing) {
            if (!existing.isFinished) updateMatch(key, { ...existing, teamAId: tA?.id || null, teamBId: tB?.id || null });
        } else {
            addKnockoutMatch(key, {
                id: crypto.randomUUID(), teamAId: tA?.id || null, teamBId: tB?.id || null,
                score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } },
                isFinished: false, winnerId: null, roundName, category: key, note,
                time: defaultTime, court: `Sân ${courtPrefix}1`
            });
        }
    };

    if (key === 'lanhdao' || key === 'nam') {
        const rA = getRanked('A'); const rB = getRanked('B'); const rC = getRanked('C'); const rD = getRanked('D');
        let tB1 = rB[0], tB2 = rB[1], tD1 = rD[0], tD2 = rD[1];

        // Logic Lãnh đạo Phương án B: Lấy Nhì và Ba bảng B, D
        if (key === 'lanhdao' && lanhDaoOption === 'B') {
            tB1 = rB[1] || null; tB2 = rB[2] || null; 
            tD1 = rD[1] || null; tD2 = rD[2] || null;
        }

        // Bắt cặp chéo Tứ kết: A-C, B-D
        createOrUpdate('TK1', 'Tứ kết 1 (1A-2C)', rA[0] || null, rC[1] || null);
        createOrUpdate('TK2', 'Tứ kết 2 (1C-2A)', rC[0] || null, rA[1] || null);
        createOrUpdate('TK3', 'Tứ kết 3 (1B-2D)', tB1 || null, tD2 || null);
        createOrUpdate('TK4', 'Tứ kết 4 (1D-2B)', tD1 || null, tB2 || null);
        
        createOrUpdate('BK1', 'Bán kết 1', null, null); createOrUpdate('BK2', 'Bán kết 2', null, null);
        createOrUpdate('CK', 'Chung kết', null, null);
    } else if (key === 'namnu') {
        const rA = getRanked('A'); const rB = getRanked('B'); const rC = getRanked('C');
        const thirds = [rA[2], rB[2], rC[2]].filter(t => t).sort((a,b) => (b!.stats?.points || 0) - (a!.stats?.points || 0));
        
        createOrUpdate('TK1', 'Tứ kết 1', rA[0] || null, rC[1] || null);
        createOrUpdate('TK2', 'Tứ kết 2', rB[0] || null, thirds[1] || null);
        createOrUpdate('TK3', 'Tứ kết 3', rC[0] || null, rA[1] || null);
        createOrUpdate('TK4', 'Tứ kết 4', rB[1] || null, thirds[0] || null);
        
        createOrUpdate('BK1', 'Bán kết 1', null, null); createOrUpdate('BK2', 'Bán kết 2', null, null);
        createOrUpdate('CK', 'Chung kết', null, null);
    } else if (key === 'nu') {
        const rA = getRanked('A'); const rB = getRanked('B');
        createOrUpdate('BK1', 'Bán kết 1', rA[0] || null, rB[1] || null);
        createOrUpdate('BK2', 'Bán kết 2', rB[0] || null, rA[1] || null);
        createOrUpdate('CK', 'Chung kết', null, null);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-100 p-4 rounded-xl border border-slate-200 gap-4">
        <h2 className="text-xl font-black text-slate-700 flex items-center gap-3 italic uppercase"><Medal size={24} className="text-orange-500" /> Vòng Chung Kết</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knockoutMatches.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 uppercase font-bold text-xs bg-white rounded-xl border-2 border-dashed">Chưa có dữ liệu vòng chung kết</div>
          ) : knockoutMatches.sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0)).map(m => (
              <MatchCard key={m.id} match={m} teamA={teams.find(t=>t.id===m.teamAId)} teamB={teams.find(t=>t.id===m.teamBId)} categoryName="" isKnockout={true} />
          ))}
      </div>
    </div>
  );
};
