
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { CategoryKey, Match, Team, Group } from '../types';
import { Save, Trophy, Calendar, MapPin, GripVertical, Download, Upload, Trash2, FileText, CheckCircle2, Database } from 'lucide-react';
import { exportScheduleToWord } from '../utils/wordExporter';
import { parseExcel, downloadTemplate } from '../utils/excelParser';

const CATEGORIES: { key: CategoryKey, label: string }[] = [
    { key: 'lanhdao', label: 'Lãnh đạo' },
    { key: 'nam', label: 'Đôi Nam' },
    { key: 'nu', label: 'Đôi Nữ' },
    { key: 'namnu', label: 'Nam Nữ' },
];

const MatchRow: React.FC<{ 
    match: Match, 
    teams: Team[], 
    groups: Group[], 
    onUpdate: (m: Match) => void,
}> = ({ match, teams, groups, onUpdate }) => {
    
    const [s1a, setS1a] = useState(match.score.set1.a);
    const [s1b, setS1b] = useState(match.score.set1.b);
    const [time, setTime] = useState(match.time || '');
    const [court, setCourt] = useState(match.court || '');
    const [teamAId, setTeamAId] = useState(match.teamAId || '');
    const [teamBId, setTeamBId] = useState(match.teamBId || '');
    
    useEffect(() => {
        setS1a(match.score.set1.a); setS1b(match.score.set1.b);
        setTime(match.time || ''); setCourt(match.court || '');
        setTeamAId(match.teamAId || ''); setTeamBId(match.teamBId || '');
    }, [match]);

    const isKnockout = !match.groupId;
    const hasChanges = 
        s1a !== match.score.set1.a || s1b !== match.score.set1.b ||
        time !== (match.time || '') || court !== (match.court || '') ||
        teamAId !== (match.teamAId || '') || teamBId !== (match.teamBId || '');

    const handleSave = () => {
        onUpdate({
            ...match,
            teamAId: teamAId || null,
            teamBId: teamBId || null,
            score: { ...match.score, set1: { a: s1a, b: s1b } },
            time, court,
        });
    };

    return (
        <tr className={`border-b transition-all duration-200 group ${match.isFinished ? 'bg-green-50/50' : ''}`}>
            <td className="p-2 border-r text-center w-10 text-[10px] text-slate-300 font-bold">
                {match.matchNumber}
            </td>
            <td className="p-2 border-r min-w-[100px]">
                <div className="font-black text-[9px] uppercase text-slate-500 leading-none mb-1">{match.roundName}</div>
                <div className="flex gap-1">
                    <input className="flex-1 text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-blue-400" value={time} placeholder="Giờ" onChange={e=>setTime(e.target.value)} />
                    <input className="w-12 text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-blue-400" value={court} placeholder="Sân" onChange={e=>setCourt(e.target.value)} />
                </div>
            </td>
            <td className="p-2 border-r w-48">
                 <select className={`w-full text-[10px] border rounded p-1 mb-1 outline-none font-bold ${match.winnerId === teamAId ? 'border-green-500 text-green-700 bg-green-50' : 'border-slate-200'}`} value={teamAId} onChange={e => setTeamAId(e.target.value)} disabled={!isKnockout}>
                     <option value="">-- Trống --</option>
                     {teams.map(t => <option key={t.id} value={t.id}>{t.name1} & {t.name2}</option>)}
                 </select>
                 <button onClick={() => onUpdate({ ...match, winnerId: match.winnerId === teamAId ? null : teamAId, isFinished: match.winnerId !== teamAId })} className={`w-full text-[8px] font-black py-0.5 rounded border ${match.winnerId === teamAId ? 'bg-green-600 text-white border-green-700' : 'bg-white text-slate-400'}`}>THẮNG</button>
            </td>
            <td className="p-2 border-r text-center w-24">
                <div className="flex items-center gap-1 justify-center">
                    <input type="number" className="w-8 h-8 text-center border rounded font-black text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none" value={s1a} onChange={e=>setS1a(Number(e.target.value))}/>
                    <span className="font-bold text-slate-300">:</span>
                    <input type="number" className="w-8 h-8 text-center border rounded font-black text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none" value={s1b} onChange={e=>setS1b(Number(e.target.value))}/>
                </div>
            </td>
            <td className="p-2 border-r w-48">
                 <select className={`w-full text-[10px] border rounded p-1 mb-1 outline-none font-bold ${match.winnerId === teamBId ? 'border-green-500 text-green-700 bg-green-50' : 'border-slate-200'}`} value={teamBId} onChange={e => setTeamBId(e.target.value)} disabled={!isKnockout}>
                     <option value="">-- Trống --</option>
                     {teams.map(t => <option key={t.id} value={t.id}>{t.name1} & {t.name2}</option>)}
                 </select>
                 <button onClick={() => onUpdate({ ...match, winnerId: match.winnerId === teamBId ? null : teamBId, isFinished: match.winnerId !== teamBId })} className={`w-full text-[8px] font-black py-0.5 rounded border ${match.winnerId === teamBId ? 'bg-green-600 text-white border-green-700' : 'bg-white text-slate-400'}`}>THẮNG</button>
            </td>
            <td className="p-2 text-center w-14">
                {(hasChanges) ? (
                    <button onClick={handleSave} className="bg-blue-600 text-white p-1.5 rounded shadow hover:bg-blue-700 animate-pulse"><Save size={14} /></button>
                ) : (
                    match.isFinished && <CheckCircle2 size={14} className="text-green-500 mx-auto" />
                )}
            </td>
        </tr>
    );
}

export const AdminPanel: React.FC = () => {
    const { data, updateMatch, uploadDataManual, importTeams, fbConfig, setFirebaseConfig } = useStore();
    const [activeCat, setActiveCat] = useState<CategoryKey>('lanhdao');
    const [activeTab, setActiveTab] = useState<'matches' | 'data' | 'db'>('matches');
    const [fbInput, setFbInput] = useState(fbConfig ? JSON.stringify(fbConfig, null, 2) : '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentCatData = data.categories[activeCat];
    const { matches, teams, groups } = currentCatData;

    // Nhóm trận theo Bảng
    const groupedMatches: Record<string, Match[]> = matches.reduce((acc, m) => {
        const groupName = m.groupId ? (groups.find(g => g.id === m.groupId)?.name || 'Unknown') : 'Playoff';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(m);
        return acc;
    }, {} as Record<string, Match[]>);

    const sortedGroups = Object.keys(groupedMatches).sort((a,b) => a === 'Playoff' ? 1 : b === 'Playoff' ? -1 : a.localeCompare(b));

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col mb-20 min-h-[600px]">
            <div className="bg-slate-900 p-1 flex gap-1 shrink-0">
                <button onClick={() => setActiveTab('matches')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${activeTab === 'matches' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Nhập tỉ số</button>
                <button onClick={() => setActiveTab('data')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${activeTab === 'data' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Dữ liệu Excel</button>
                <button onClick={() => setActiveTab('db')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${activeTab === 'db' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Database</button>
            </div>

            <div className="bg-slate-100 px-4 py-2 border-b flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
                {CATEGORIES.map(c => (
                    <button key={c.key} onClick={() => setActiveCat(c.key)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeCat === c.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>{c.label}</button>
                ))}
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'matches' ? (
                    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                        {sortedGroups.map(groupName => (
                            <div key={groupName} className="mb-8">
                                <div className="flex items-center gap-3 mb-2 sticky top-0 bg-white z-10 py-1">
                                    <span className="bg-slate-800 text-white px-3 py-1 rounded font-black text-[10px] uppercase tracking-widest">{groupName === 'Playoff' ? 'VÒNG PLAYOFF' : `BẢNG ${groupName}`}</span>
                                    <div className="flex-1 h-px bg-slate-200"></div>
                                </div>
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-[8px] font-black uppercase">
                                            <tr>
                                                <th className="p-3 text-center w-10">#</th>
                                                <th className="p-3">Lịch / Sân</th>
                                                <th className="p-3">Đội 1</th>
                                                <th className="p-3 text-center">Tỉ số</th>
                                                <th className="p-3">Đội 2</th>
                                                <th className="p-3 text-center">Lưu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedMatches[groupName].sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0)).map((m) => (
                                                <MatchRow key={m.id} match={m} teams={teams} groups={groups} onUpdate={m => updateMatch(activeCat, m)} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'data' ? (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border-2 border-slate-200 p-8 rounded-3xl space-y-4 shadow-sm">
                            <h4 className="font-black uppercase text-xs flex items-center gap-2 text-slate-700"><Upload size={16} className="text-blue-600"/> Nhập từ Excel</h4>
                            <button onClick={downloadTemplate} className="w-full py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-colors">Tải Mẫu Excel</button>
                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase hover:bg-blue-700 shadow-lg">Chọn File & Nhập</button>
                            <input type="file" className="hidden" ref={fileInputRef} onChange={async e => { if (e.target.files?.[0]) { const teams = await parseExcel(e.target.files[0]); if (teams.length > 0) importTeams(activeCat, teams); } }} />
                        </div>
                        <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4 shadow-xl">
                            <h4 className="font-black uppercase text-xs flex items-center gap-2"><FileText size={16} className="text-lime-400"/> Biên Bản / Lịch Đấu</h4>
                            <button onClick={() => exportScheduleToWord(data, true)} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-[10px] uppercase hover:bg-slate-100">XUẤT LỊCH THI ĐẤU</button>
                            <button onClick={uploadDataManual} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-[10px] uppercase hover:bg-blue-400 shadow-lg">ĐỒNG BỘ CLOUD</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200">
                             <h3 className="font-black uppercase text-sm mb-4">Cấu hình Firebase Online</h3>
                             <textarea className="w-full h-40 p-4 font-mono text-[10px] rounded-xl border-2 border-slate-200 outline-none" placeholder='{ "apiKey": "...", ... }' value={fbInput} onChange={e=>setFbInput(e.target.value)} />
                             <button onClick={() => { try { setFirebaseConfig(JSON.parse(fbInput)); alert("Thành công!"); } catch(e) { alert("Lỗi JSON!"); } }} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg">LƯU CẤU HÌNH</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
