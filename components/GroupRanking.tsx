
import React from 'react';
import { Group, Match, Team } from '../types';
import { calculateGroupRanking } from '../utils/logic';
import { Star } from 'lucide-react';

interface Props {
  group: Group;
  matches: Match[];
  teams: Team[];
  colorClass: string;
}

export const GroupRanking: React.FC<Props> = ({ group, matches, teams, colorClass }) => {
  const ranking = calculateGroupRanking(teams, matches, group.id);

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className={`${colorClass} px-3 py-1.5 border-b`}>
          <h3 className="font-bold text-gray-800 uppercase text-xs">Xếp Hạng</h3>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full text-[11px] text-left text-gray-500">
          <thead className="text-[10px] text-gray-700 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-2 py-2 text-center w-6">#</th>
              <th className="px-2 py-2">Cặp VĐV / Đơn vị</th>
              <th className="px-1 py-2 text-center text-blue-700" title="Điểm">Đ</th>
              <th className="px-1 py-2 text-center">Tr</th>
              <th className="px-1 py-2 text-center text-green-600">T</th>
              <th className="px-1 py-2 text-center text-red-500">B</th>
              <th className="px-1 py-2 text-center">HS</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((team, idx) => {
              const rowClass = idx === 0 ? 'bg-yellow-50/50' : idx === 1 ? 'bg-green-50/30' : 'bg-white';
              return (
                <tr key={team.id} className={`${rowClass} border-b last:border-0 hover:bg-slate-50 transition-colors`}>
                  <td className="px-2 py-1 text-center font-bold text-gray-900 relative">
                      {idx + 1}
                      {idx === 0 && <Star size={8} className="absolute top-0.5 left-0.5 text-yellow-500 fill-yellow-500" />}
                  </td>
                  <td className="px-2 py-1 min-w-[120px]">
                     <div className="font-black text-slate-800 leading-[1.1]">
                         <div>{team.name1}</div>
                         <div>{team.name2}</div>
                     </div>
                     <div className="text-[9px] text-slate-400 uppercase mt-0.5 italic truncate leading-none">{team.org}</div>
                  </td>
                  <td className="px-1 py-1 text-center font-black text-blue-800 bg-blue-50/30">{team.stats?.points || 0}</td>
                  <td className="px-1 py-1 text-center">{team.stats?.played || 0}</td>
                  <td className="px-1 py-1 text-center font-bold text-green-600">{team.stats?.won || 0}</td>
                  <td className="px-1 py-1 text-center font-bold text-red-500">{team.stats?.lost || 0}</td>
                  <td className="px-1 py-1 text-center font-mono font-bold text-slate-700">{team.stats?.pointsDiff || 0}</td>
                </tr>
              );
            })}
            {ranking.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-300 italic text-[10px] uppercase font-bold">Chưa có đội trong bảng</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
