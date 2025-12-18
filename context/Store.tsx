
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { TournamentData, CategoryKey, Team, Match, Group } from '../types';
import { generateRoundRobinMatches, calculateGroupRanking } from '../utils/logic';
import { initFirebase, doc, getDoc, setDoc, onSnapshot } from '../utils/firebaseConfig';

const STORAGE_KEY = 'PC_TUYENQUANG_PICKLEBALL_V3';
const FIREBASE_CONFIG_KEY = 'PC_TQ_FIREBASE_CONFIG';

const initialData: TournamentData = {
  categories: {
    lanhdao: { key: 'lanhdao', name: 'Đôi Lãnh đạo', groups: [], matches: [], teams: [] },
    nam: { key: 'nam', name: 'Đôi Nam', groups: [], matches: [], teams: [] },
    nu: { key: 'nu', name: 'Đôi Nữ', groups: [], matches: [], teams: [] },
    namnu: { key: 'namnu', name: 'Đôi Nam Nữ', groups: [], matches: [], teams: [] },
  }
};

interface StoreContextType {
  data: TournamentData;
  setData: React.Dispatch<React.SetStateAction<TournamentData>>;
  importTeams: (category: CategoryKey, teams: Team[]) => void;
  updateMatch: (category: CategoryKey, match: Match) => void;
  reorderMatches: (category: CategoryKey, matches: Match[]) => void;
  resetData: () => void;
  clearCategory: (category: CategoryKey) => void;
  addKnockoutMatch: (category: CategoryKey, match: Match) => void;
  simulateResults: (category: CategoryKey) => void;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isOnline: boolean;
  serverMode: 'firebase' | 'real-db' | 'temporary-memory' | 'offline'; 
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  uploadDataManual: () => Promise<void>;
  isLoading: boolean;
  fbConfig: any | null;
  setFirebaseConfig: (config: any) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<TournamentData>(initialData);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [isOnline, setIsOnline] = useState(false);
  const [serverMode, setServerMode] = useState<any>('offline');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const [fbConfig, setFbConfig] = useState(() => {
      const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
      return saved ? JSON.parse(saved) : null;
  });

  // --- FIREBASE SYNC LOGIC ---
  useEffect(() => {
    if (!fbConfig) return;
    const db = initFirebase(fbConfig);
    if (!db) return;

    setServerMode('firebase');
    setIsOnline(true);
    
    // Listen for real-time updates
    const unsub = onSnapshot(doc(db, "tournaments", "pc_tuyen_quang"), (docSnap) => {
        if (docSnap.exists()) {
            const cloudData = docSnap.data() as TournamentData;
            setData(cloudData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
            setIsLoading(false);
        }
    });

    return () => unsub();
  }, [fbConfig]);

  // --- INITIAL LOAD (LOCAL + VERCEL KV) ---
  useEffect(() => {
    if (fbConfig) return; // If firebase is active, let its effect handle loading

    const initApp = async () => {
        setIsLoading(true);
        try {
            const local = localStorage.getItem(STORAGE_KEY);
            if (local) setData(JSON.parse(local));

            const res = await fetch(`/api/data?t=${Date.now()}`);
            if (res.ok) {
                const cloudData = await res.json();
                setIsOnline(true);
                setServerMode(cloudData._serverMode || 'real-db');
                if (cloudData && cloudData.categories) {
                    setData(cloudData);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
                }
            }
        } catch (e) {
            setIsOnline(false);
            setServerMode('offline');
        } finally {
            setIsLoading(false);
        }
    };
    initApp();
  }, [fbConfig]);

  // --- AUTO SAVE LOGIC ---
  useEffect(() => {
    if (!isAdmin || isLoading) return;
    
    const timeout = setTimeout(async () => {
        setSaveStatus('saving');
        try {
            // Save to Local
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

            // Save to Firebase if active
            if (fbConfig) {
                const db = initFirebase(fbConfig);
                if (db) {
                    await setDoc(doc(db, "tournaments", "pc_tuyen_quang"), data);
                }
            } 
            // Save to Vercel KV if online
            else if (isOnline) {
                await fetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (e) {
            setSaveStatus('error');
        }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [data, isAdmin, isOnline, fbConfig]);

  const setFirebaseConfig = (config: any) => {
    if (!config) {
        localStorage.removeItem(FIREBASE_CONFIG_KEY);
        setFbConfig(null);
    } else {
        localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
        setFbConfig(config);
    }
  };

  const uploadDataManual = async () => {
      if (!isAdmin) return;
      setSaveStatus('saving');
      try {
          if (fbConfig) {
              const db = initFirebase(fbConfig);
              if (db) await setDoc(doc(db, "tournaments", "pc_tuyen_quang"), data);
          } else {
              await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          }
          alert("✅ Đồng bộ thành công!");
          setSaveStatus('saved');
      } catch (e) { alert("❌ Lỗi!"); }
  };

  const login = (password: string) => {
    if (['123456', 'Pickleballpctq'].includes(password)) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const importTeams = (category: CategoryKey, newTeams: Team[]) => {
    if (!isAdmin) return;
    setData(prev => {
      const cat = prev.categories[category];
      let groupNames = (category === 'lanhdao' || category === 'nam') ? ['A', 'B', 'C', 'D'] : (category === 'namnu' ? ['A', 'B', 'C'] : ['A', 'B']);
      const excelGroups = new Set(newTeams.map(t => t.initialGroupName).filter(Boolean) as string[]);
      const finalGroupNames = Array.from(new Set([...groupNames, ...excelGroups])).sort();
      const groups: Group[] = finalGroupNames.map(name => ({ id: crypto.randomUUID(), name, teamIds: [] }));
      newTeams.forEach((team, index) => {
        const targetGroup = team.initialGroupName ? groups.find(g => g.name === team.initialGroupName) : groups[index % groups.length];
        if (targetGroup) { targetGroup.teamIds.push(team.id); team.groupId = targetGroup.id; }
      });
      let newMatches: Match[] = [];
      groups.forEach(g => { newMatches = [...newMatches, ...generateRoundRobinMatches(g, category)]; });
      return { ...prev, categories: { ...prev.categories, [category]: { ...cat, teams: newTeams, groups, matches: newMatches } } };
    });
  };

  const updateMatch = (category: CategoryKey, updatedMatch: Match) => {
    if (!isAdmin) return;
    setData(prev => {
      const cat = prev.categories[category];
      let matches = cat.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
      return { ...prev, categories: { ...prev.categories, [category]: { ...cat, matches } } };
    });
  };

  const reorderMatches = (category: CategoryKey, orderedMatches: Match[]) => {
      if (!isAdmin) return;
      setData(prev => ({ 
          ...prev, 
          categories: { 
              ...prev.categories, 
              [category]: { ...prev.categories[category], matches: orderedMatches } 
          } 
      }));
  }

  const addKnockoutMatch = (category: CategoryKey, match: Match) => {
    if (!isAdmin) return;
    setData(prev => {
       const cat = prev.categories[category];
       return { ...prev, categories: { ...prev.categories, [category]: { ...cat, matches: [...cat.matches, match] } } }
    });
  }

  const simulateResults = (category: CategoryKey) => {
    if (!isAdmin) return;
    setData(prev => {
        const cat = { ...prev.categories[category] };
        if (cat.teams.length === 0) return prev;
        cat.matches = cat.matches.map(m => {
            if (m.groupId && !m.isFinished) {
                const sA = Math.floor(Math.random() * 8) + 8;
                const sB = Math.floor(Math.random() * 10);
                return { ...m, isFinished: true, score: { ...m.score, set1: { a: sA, b: sB } }, winnerId: sA > sB ? m.teamAId : m.teamBId };
            }
            return m;
        });
        return { ...prev, categories: { ...prev.categories, [category]: cat } };
    });
  };

  const clearCategory = (category: CategoryKey) => {
      if(!isAdmin) return;
      setData(prev => ({ ...prev, categories: { ...prev.categories, [category]: { ...prev.categories[category], groups: [], matches: [], teams: [] } } }));
  }

  return (
    <StoreContext.Provider value={{ data, setData, importTeams, updateMatch, reorderMatches, resetData: ()=>setData(initialData), clearCategory, addKnockoutMatch, simulateResults, isAdmin, login, logout: () => setIsAdmin(false), isOnline, saveStatus, uploadDataManual, isLoading, fbConfig, setFirebaseConfig, serverMode }}>
      {children}
    </StoreContext.Provider>
  );
};
