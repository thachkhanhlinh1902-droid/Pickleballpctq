
import { Match, Team, Group } from '../types';

export const generateRoundRobinMatches = (group: Group, categoryKey: string): Match[] => {
  let matches: Match[] = [];
  const teamIds = group.teamIds;

  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      matches.push({
        id: crypto.randomUUID(),
        teamAId: teamIds[i],
        teamBId: teamIds[j],
        score: { set1: { a: 0, b: 0 }, set2: { a: 0, b: 0 }, set3: { a: 0, b: 0 } },
        isFinished: false,
        winnerId: null,
        roundName: `Vòng bảng`,
        category: categoryKey as any,
        groupId: group.id
      });
    }
  }

  const isNamNu = categoryKey === 'namnu';
  const courtsCount = isNamNu ? 4 : 6;
  const courtPrefix = isNamNu ? 'B' : 'A';
  const startHour = isNamNu ? 7 : 15;
  const startDay = isNamNu ? '19/12' : '18/12';
  const minutesPerMatch = 20;

  return matches.map((m, index) => {
      const slotIndex = Math.floor(index / courtsCount);
      const totalMinutes = slotIndex * minutesPerMatch;
      const currentHour = startHour + Math.floor(totalMinutes / 60);
      const currentMin = totalMinutes % 60;
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')} ${startDay}`;
      const courtStr = `Sân ${courtPrefix}${(index % courtsCount) + 1}`;

      return {
          ...m,
          matchNumber: index + 1,
          time: timeStr,
          court: courtStr
      };
  });
};

export const calculateGroupRanking = (teams: Team[], matches: Match[], groupId: string): Team[] => {
  const groupMatches = matches.filter(m => m.groupId === groupId && m.isFinished);
  const groupTeams = teams.filter(t => t.groupId === groupId);

  const stats = groupTeams.map(team => {
    let played = 0;
    let won = 0;
    let lost = 0;
    let pointsDiff = 0;

    groupMatches.forEach(m => {
      if (m.teamAId === team.id || m.teamBId === team.id) {
        played++;
        const isTeamA = m.teamAId === team.id;
        const myScore = isTeamA ? (m.score.set1.a) : (m.score.set1.b);
        const oppScore = isTeamA ? (m.score.set1.b) : (m.score.set1.a);
        pointsDiff += (myScore - oppScore);
        if (m.winnerId === team.id) won++;
        else if (m.winnerId) lost++;
      }
    });

    return { ...team, stats: { played, won, lost, pointsDiff, points: won * 2 } };
  });

  return stats.sort((a, b) => {
    const sA = a.stats!;
    const sB = b.stats!;
    if (sB.points !== sA.points) return sB.points - sA.points;
    const tiedTeams = stats.filter(t => t.stats!.points === sA.points);
    if (tiedTeams.length === 2) {
      const h2h = groupMatches.find(m => (m.teamAId === a.id && m.teamBId === b.id) || (m.teamAId === b.id && m.teamBId === a.id));
      if (h2h?.winnerId === a.id) return -1;
      if (h2h?.winnerId === b.id) return 1;
    }
    return sB.pointsDiff - sA.pointsDiff;
  });
};
