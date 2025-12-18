
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { CategoryKey, Match, Team, Group } from '../types';
import { Save, Trophy, Calendar, MapPin, Printer, GripVertical, ListOrdered, Cloud, Settings, Download, Upload, Move, FileSpreadsheet, Trash2, FileText, CheckCircle2, Database, Share2 } from 'lucide-react';
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
    isDragEnabled: boolean,
    onDragStart: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void,
    onDragEnter: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void,
    onDragEnd: () => void,
    index: number,
    dragOverIndex: number | null
}> = ({ match, teams, groups, onUpdate, isDragEnabled, onDragStart, onDragEnter, onDragEnd, index, dragOverIndex }) => {
    
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

    const rowStyle = dragOverIndex === index ? 'bg-blue-100 border-t-4 border-blue-600' : match.isFinished ? 'bg-green-50/50' : '';

    return (
        <tr className={`border-b transition-all duration-200 ${rowStyle}`} draggable={isDragEnabled} onDragStart={(e) => onDragStart(e, index)} onDragEnter={(e) => onDragEnter(e, index)} onDragEnd={onDragEnd} onDragOver={(e) => e.preventDefault()}>
            <td className="p-3 border-r text-center w-12">{isDragEnabled ? <GripVertical size={20} className="text-blue-500 mx-auto" /> : <span className="text-slate-300 text-[10px]">{index + 1}</span>}</td>
            <td className="p-3 border-r min-w-[140px]"><div className="font-black text-xs uppercase mb-1">{match.roundName}</div></td>
            <td className="p-3 border-r w-36"><div className="space-y-1"><input className="w-full text-[10px] bg-slate-50 border rounded px-1 py-1" value={time} onChange={e=>setTime(e.target.value)} /><input className="w-full text-[10px] bg-slate-50 border rounded px-1 py-1" value={court} onChange={e=>setCourt(e.target.value)} /></div></td>
            <td className="p-3 border-r w-64">
                 <select className="w-full text-[11px] border rounded p-1.5 mb-1" value={teamAId} onChange={e => setTeamAId(e.target.value)} disabled={!isKnockout}>
                     <option value="">-- Trống --</option>
                     {teams.map(t => <option key={t.id} value={t.id}>{t.name1} & {t.name2}</option>)}
                 </select>
                 <button onClick={() => onUpdate({ ...match, winnerId: match.winnerId === teamAId ? null : teamAId, isFinished: match.winnerId !== teamAId })} className={`w-full text-[9px] font-black py-1 rounded border ${match.winnerId === teamAId ? 'bg-green-600 text-white' : 'bg-white text-slate-400'}`}>THẮNG</button>
            </td>
            <td className="p-3 border-r text-center w-28"><div className="flex items-center gap-1 justify-center"><input type="number" className="w-8 h-8 text-center border rounded font-black" value={s1a} onChange={e=>setS1a(Number(e.target.value))}/><input type="number" className="w-8 h-8 text-center border rounded font-black" value={s1b} onChange={e=>setS1b(Number(e.target.value))}/></div></td>
            <td className="p-3 border-r w-64">
                 <select className="w-full text-[11px] border rounded p-1.5 mb-1" value={teamBId} onChange={e => setTeamBId(e.target.value)} disabled={!isKnockout}>
                     <option value="">-- Trống --</option>
                     {teams.map(t => <option key={t.id} value={t.id}>{t.name1} & {t.name2}</option>)}
                 </select>
                 <button onClick={() => onUpdate({ ...match, winnerId: match.winnerId === teamBId ? null : teamBId, isFinished: match.winnerId !== teamBId })} className={`w-full text-[9px] font-black py-1 rounded border ${match.winnerId === teamBId ? 'bg-green-600 text-white' : 'bg-white text-slate-400'}`}>THẮNG</button>
            </td>
            <td className="p-3 text-center w-20">{hasChanges && <button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded shadow-lg hover:scale-110"><Save size={16} /></button>}</td>
        </tr>
    );
}

export const AdminPanel: React.FC = () => {
    const { data, updateMatch, reorderMatches, uploadDataManual, importTeams, clearCategory, fbConfig, setFirebaseConfig, serverMode } = useStore();
    const [activeCat, setActiveCat] = useState<CategoryKey>('lanhdao');
    const [filter, setFilter] = useState<'all' | 'knockout' | 'group'>('all');
    const [sortMode, setSortMode] = useState<'default' | 'custom'>('default');
    const [activeTab, setActiveTab] = useState<'matches' | 'data' | 'db'>('matches');

    const [fbInput, setFbInput] = useState(fbConfig ? JSON.stringify(fbConfig, null, 2) : '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const currentCatData = data.categories[activeCat];
    let filteredMatches = [...currentCatData.matches].filter(m => filter === 'knockout' ? !m.groupId : filter === 'group' ? !!m.groupId : true).sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));

    const handleDragEnd = () => {
        const source = dragItem.current;
        const dest = dragOverItem.current;
        if (source !== null && dest !== null && source !== dest) {
            const newList = [...filteredMatches];
            const [moved] = newList.splice(source, 1);
            newList.splice(dest, 0, moved);
            reorderMatches(activeCat, newList.map((m, i) => ({ ...m, matchNumber: i + 1 })));
        }
        dragItem.current = null; dragOverItem.current = null;
    };

    return (
        <div className="bg-white rounded-[40px] shadow-2xl border-4 border-slate-900 overflow-hidden flex flex-col mb-20">
            <div className="bg-slate-900 p-2 flex gap-1">
                <button onClick={() => setActiveTab('matches')} className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase ${activeTab === 'matches' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>QUẢN LÝ TRẬN ĐẤU</button>
                <button onClick={() => setActiveTab('data')} className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase ${activeTab === 'data' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>NHẬP / XUẤT</button>
                <button onClick={() => setActiveTab('db')} className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase ${activeTab === 'db' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>ONLINE DATABASE</button>
            </div>

            {activeTab === 'db' ? (
                <div className="p-10 space-y-6">
                    <div className="bg-slate-100 p-6 rounded-3xl border-2 border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Database className="text-blue-600" />
                            <h3 className="font-black uppercase text-sm">Cấu hình Firebase Firestore</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 italic leading-relaxed">Nếu không dùng GitHub, hãy tạo một Project tại console.firebase.google.com, bật Firestore và dán đoạn mã cấu hình (Config Object) vào đây để dữ liệu được lưu online mãi mãi.</p>
                        <textarea className="w-full h-48 p-4 font-mono text-[10px] rounded-xl border-2 border-slate-300 outline-none" placeholder='{ "apiKey": "...", "projectId": "...", ... }' value={fbInput} onChange={e=>setFbInput(e.target.value)} />
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => { try { setFirebaseConfig(JSON.parse(fbInput)); alert("Đã lưu cấu hình Firebase!"); } catch(e) { alert("Lỗi JSON!"); } }} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase">KẾT NỐI DATABASE</button>
                            <button onClick={() => { setFirebaseConfig(null); setFbInput(''); }} className="px-6 bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase">XÓA</button>
                        </div>
                    </div>
                    <div className="bg-blue-900 p-6 rounded-3xl text-white">
                        <h4 className="font-bold text-xs uppercase mb-2 flex items-center gap-2"><Share2 size={14}/> Trạng thái server</h4>
                        <div className="text-xs font-mono bg-black/30 p-3 rounded-lg">MODE: {serverMode.toUpperCase()}</div>
                    </div>
                </div>
            ) : activeTab === 'data' ? (
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 border-2 border-slate-200 p-8 rounded-[40px] space-y-4">
                        <h4 className="font-black uppercase text-xs flex items-center gap-2"><Upload size={16}/> Nhập Dữ Liệu</h4>
                        <button onClick={downloadTemplate} className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-bold text-[10px] uppercase">1. Tải Mẫu Excel</button>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase">2. Nhập Excel</button>
                        <input type="file" className="hidden" ref={fileInputRef} onChange={async e => { if (e.target.files?.[0]) { const teams = await parseExcel(e.target.files[0]); if (teams.length > 0) importTeams(activeCat, teams); } }} />
                    </div>
                    <div className="bg-slate-900 text-white p-8 rounded-[40px] space-y-4">
                        <h4 className="font-black uppercase text-xs flex items-center gap-2"><Download size={16}/> Xuất Báo Cáo</h4>
                        <button onClick={() => exportScheduleToWord(data, true)} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-[10px] uppercase">XUẤT LỊCH ĐẤU (WORD)</button>
                        <button onClick={uploadDataManual} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase">ĐỒNG BỘ CLOUD</button>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex flex-col flex-1 h-[700px]">
                    <div className="flex gap-2 mb-6 bg-slate-100 p-2 rounded-2xl overflow-x-auto">
                        {CATEGORIES.map(c => (
                            <button key={c.key} onClick={() => setActiveCat(c.key)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeCat === c.key ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>{c.label}</button>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                             {['all', 'group', 'knockout'].map(f => <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{f}</button>)}
                        </div>
                        <button onClick={() => setSortMode(sortMode === 'default' ? 'custom' : 'default')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 ${sortMode === 'custom' ? 'bg-purple-600 text-white border-purple-200' : 'bg-white border-slate-200 text-slate-500'}`}>{sortMode === 'default' ? 'SẮP XẾP' : 'XONG: LƯU'}</button>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar border-2 border-slate-100 rounded-3xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-white text-[9px] font-black uppercase sticky top-0">
                                <tr>
                                    <th className="p-4 text-center">#</th>
                                    <th className="p-4">Trận</th>
                                    <th className="p-4">Lịch</th>
                                    <th className="p-4">Đội A</th>
                                    <th className="p-4 text-center">Tỷ số</th>
                                    <th className="p-4">Đội B</th>
                                    <th className="p-4 text-center">Lưu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMatches.map((m, idx) => (
                                    <MatchRow key={m.id} match={m} teams={currentCatData.teams} groups={currentCatData.groups} onUpdate={m => updateMatch(activeCat, m)} isDragEnabled={sortMode === 'custom'} onDragStart={(_, i) => { dragItem.current = i; }} onDragEnter={(_, i) => { dragOverItem.current = i; }} onDragEnd={handleDragEnd} index={idx} dragOverIndex={null} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
