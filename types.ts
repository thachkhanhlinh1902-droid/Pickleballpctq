
export type CategoryKey = 'lanhdao' | 'nam' | 'nu' | 'namnu';

export interface Player {
  name: string;
}

export interface Team {
  id: string;
  name1: string;
  name2: string;
  org: string; // Đơn vị
  groupId?: string;
  initialGroupName?: string; // Dùng để map bảng khi import excel
  stats?: {
    played: number;
    won: number;
    lost: number;
    pointsDiff: number; // Hiệu số
  };
}

export interface MatchScore {
  set1: { a: number; b: number };
  set2: { a: number; b: number };
  set3: { a: number; b: number };
}

export interface Match {
  id: string;
  teamAId: string | null; // null if not determined yet
  teamBId: string | null;
  score: MatchScore;
  isFinished: boolean;
  winnerId: string | null;
  roundName: string; // "Vòng bảng", "Tứ kết 1", "Bán kết", "Chung kết"
  category: CategoryKey;
  groupId?: string; // Only for group stage
  note?: string;
  matchNumber?: number;
  time?: string;
  court?: string;
  isStarred?: boolean; // Highlight important matches
}

export interface Group {
  id: string;
  name: string; // A, B, C, D, E
  teamIds: string[];
}

export interface CategoryData {
  key: CategoryKey;
  name: string;
  groups: Group[];
  matches: Match[]; // All matches (Group + Knockout)
  teams: Team[];
}

export interface TournamentData {
  categories: Record<CategoryKey, CategoryData>;
}
