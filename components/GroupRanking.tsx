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
      <div className={`${colorClass} px-4 py-2 border-b`}>
          <h3 className="font-bold text-gray-800 uppercase text-sm">Bảng Xếp Hạng</h3>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-white border-b">
            <tr>
              <th className="px-2 py-2 text-center w-6">#</th>
              <th className="px-2 py-2">Đội</th>
              <th className="px-1 py-2 text-center" title="Số trận đã đấu">Tr</th>
              <th className="px-1 py-2 text-center text-green-600" title="Thắng">T</th>
              <th className="px-1 py-2 text-center text-red-600" title="Thua">B</th>
              <th className="px-1 py-2 text-center" title="Hiệu số">HS</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((team, idx) => {
              // Highlight logic: Top 1 is Gold, Top 2 is Silver (Passable)
              const isQualified = idx < 2; // Assuming top 2 usually pass
              const rowClass = idx === 0 ? 'bg-yellow-50' : idx === 1 ? 'bg-green-50' : 'bg-white';
              
              return (
                <tr key={team.id} className={`${rowClass} border-b hover:bg-gray-100 last:border-0 transition-colors`}>
                  <td className="px-2 py-2 text-center font-bold text-gray-900 relative">
                      {idx + 1}
                      {idx === 0 && <Star size={10} className="absolute top-1 left-1 text-yellow-500 fill-yellow-500" />}
                  </td>
                  <td className="px-2 py-2">
                     <div className={`font-bold text-xs ${isQualified ? 'text-gray-900' : 'text-gray-600'}`}>{team.name1}</div>
                     <div className={`font-bold text-xs ${isQualified ? 'text-gray-900' : 'text-gray-600'}`}>{team.name2}</div>
                     <div className="text-[9px] text-gray-500 uppercase mt-0.5">{team.org}</div>
                  </td>
                  <td className="px-1 py-2 text-center">{team.stats?.played || 0}</td>
                  <td className="px-1 py-2 text-center font-bold text-green-600">{team.stats?.won || 0}</td>
                  <td className="px-1 py-2 text-center text-red-600">{team.stats?.lost || 0}</td>
                  <td className="px-1 py-2 text-center font-mono">{team.stats?.pointsDiff || 0}</td>
                </tr>
              );
            })}
            {ranking.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-400 italic text-xs">Chưa có đội</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};