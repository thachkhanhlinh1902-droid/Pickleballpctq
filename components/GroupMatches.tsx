import React from 'react';
import { Group, Match, Team } from '../types';
import { MatchCard } from './MatchCard';

interface Props {
  group: Group;
  matches: Match[];
  teams: Team[];
  categoryName: string;
  colorClass: string;
}

export const GroupMatches: React.FC<Props> = ({ group, matches, teams, categoryName, colorClass }) => {
  const groupMatches = matches.filter(m => m.groupId === group.id);

  return (
    <div className="border rounded-lg bg-gray-50/50 h-full flex flex-col">
       <div className={`${colorClass} px-4 py-2 border-b rounded-t-lg mb-2`}>
          <h3 className="font-bold text-gray-800 uppercase text-sm">Lịch Thi Đấu</h3>
       </div>
      
      <div className="p-2 flex-1 overflow-y-auto max-h-[400px]">
        {groupMatches.length === 0 && <p className="text-gray-400 italic text-sm text-center py-4">Chưa có lịch thi đấu.</p>}
        {groupMatches.map(match => {
           const teamA = teams.find(t => t.id === match.teamAId);
           const teamB = teams.find(t => t.id === match.teamBId);
           return <MatchCard key={match.id} match={match} teamA={teamA} teamB={teamB} categoryName={categoryName} />;
        })}
      </div>
    </div>
  );
};