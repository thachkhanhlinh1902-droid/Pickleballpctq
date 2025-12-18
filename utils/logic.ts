
import { Match, Team, Group } from '../types';

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

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

  // Sắp xếp ngẫu nhiên ban đầu
  matches = shuffleArray(matches);

  // Cấu hình thời gian và sân dựa trên nội dung
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
        const myScore = isTeamA ? (m.score.set1.a + m.score.set2.a + m.score.set3.a) : (m.score.set1.b + m.score.set2.b + m.score.set3.b);
        const oppScore = isTeamA ? (m.score.set1.b + m.score.set2.b + m.score.set3.b) : (m.score.set1.a + m.score.set2.a + m.score.set3.a);
        
        pointsDiff += (myScore - oppScore);

        if (m.winnerId === team.id) won++;
        else if (m.winnerId) lost++;
      }
    });

    return { ...team, stats: { played, won, lost, pointsDiff } };
  });

  return stats.sort((a, b) => {
    if (b.stats!.won !== a.stats!.won) return b.stats!.won - a.stats!.won;
    return b.stats!.pointsDiff - a.stats!.pointsDiff;
  });
};

export const generateRandomTeam = (groupName?: string): Team => {
  const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
  const TEN = ['Hùng', 'Dũng', 'Lan', 'Huệ', 'Cường', 'Tuấn', 'Hạnh', 'Thảo', 'Nam', 'Bắc', 'Tâm', 'Sơn'];
  const DON_VI = ['Điện Lực TP', 'Phòng Kỹ Thuật', 'Phòng Kinh Doanh', 'Điện Lực Yên Sơn', 'Điện Lực Hàm Yên'];

  const getName = () => `${HO[Math.floor(Math.random() * HO.length)]} ${TEN[Math.floor(Math.random() * TEN.length)]}`;

  return {
    id: crypto.randomUUID(),
    name1: getName(),
    name2: getName(),
    org: DON_VI[Math.floor(Math.random() * DON_VI.length)],
    initialGroupName: groupName
  };
};
