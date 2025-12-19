
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { CategoryKey, Match, Team, MatchScore } from '../types';
import { Save, Trophy, Calendar, MapPin, GripVertical, Download, Upload, Trash2, FileText, CheckCircle2, Database, Star, Cloud } from 'lucide-react';
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
    onUpdate: (m: Match) => void,
}> = ({ match, teams, onUpdate }) => {
    
    const [score, setScore] = useState<MatchScore>(match.score);
    const [time, setTime] = useState(match.time || '');
    const [court, setCourt] = useState(match.court || '');
    const [teamAId, setTeamAId] = useState(match.teamAId || '');
    const [teamBId, setTeamBId] = useState(match.teamBId || '');
    
    useEffect(() => {
        setScore(match.score);
        setTime(match.time || ''); setCourt(match.court || '');
        setTeamAId(match.teamAId || ''); setTeamBId(match.teamBId || '');
    }, [match]);

    // LOGIC: Chỉ Chung kết mới đánh Bo3
    const isBo3 = match.note === 'CK' || match.roundName.toLowerCase().includes('chung kết');

    const hasChanges = 
        JSON.stringify(score) !== JSON.stringify(match.score) ||
        time !== (match.time || '') || court !== (match.court || '') ||
        teamAId !== (match.teamAId || '') || teamBId !== (match.teamBId || '');

    const handleSave = () => {
        let winnerId = match.winnerId;
        let isFinished = match.isFinished;

        if (isBo3) {
            const setsA = (score.set1.a > score.set1.b ? 1 : 0) + (score.set2.a > score.set2.b ? 1 : 0) + (score.set3.a > score.set3.b ? 1 : 0);
            const setsB = (score.set1.b > score.set1.a ? 1 : 0) + (score.set2.b > score.set2.a ? 1 : 0) + (score.set3.b > score.set3.a ? 1 : 0);
            if (setsA >= 2) { winnerId = teamAId; isFinished = true; }
            else if (setsB >= 2) { winnerId = teamBId; isFinished = true; }
        } else {
            if (score.set1.a !== score.set1.b) {
                winnerId = score.set1.a > score.set1.b ? teamAId : teamBId;
                isFinished = true;
            }
        }

        onUpdate({
            ...match,
            teamAId: teamAId || null,
            teamBId: teamBId || null,
            score: score,
            winnerId,
            isFinished,
            time, court,
        });
    };

    const tA = teams.find(t => t.id === teamAId);
    const tB = teams.find(t => t.id === teamBId);

    const ScoreInput = ({ s, side }: { s: keyof MatchScore, side: 'a' | 'b' }) => (
        <input 
            type="number" 
            className="w-8 h-8 text-center border border-slate-200 rounded font-black text-xs bg-white focus:border-blue-400 outline-none p-0" 
            value={score[s][side]} 
            onChange={e => setScore(prev => ({ ...prev, [s]: { ...prev[s], [side]: Number(e.target.value) } }))}
        />
    );

    return (
        <tr className={`border-b transition-colors hover:bg-slate-50 ${match.isFinished ? 'bg-green-50/40' : ''}`}>
            <td className="p-1 border-r text-center w-8 text-[9px] text-slate-300 font-bold">
                {match.matchNumber}
            </td>
            <td className="p-1 border-r w-32">
                <div className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1 truncate">{match.roundName}</div>
                <div className="flex flex-col gap-1">
                    <input className="w-full text-[9px] bg-white border border-slate-200 rounded px-1.5 py-1 outline-none focus:border-blue-400" value={time} placeholder="Giờ + Ngày" onChange={e=>setTime(e.target.value)} />
                    <input className="w-full text-[9px] bg-white border border-slate-200 rounded px-1.5 py-1 outline-none focus:border-blue-400" value={court} placeholder="Tên Sân" onChange={e=>setCourt(e.target.value)} />
                </div>
            </td>
            
            {/* Đội A */}
            <td className={`p-1 border-r w-[25%] ${match.winnerId === teamAId ? 'bg-green-100/50' : ''}`}>
                <div className="flex items-center gap-2">
                    {!match.groupId ? ( // Knockout selects
                        <select className="flex-1 text-[9px] border border-slate-200 rounded p-1 outline-none font-bold bg-white" value={teamAId} onChange={e => setTeamAId(e.target.value)}>
                            <option value="">-- Đội A --</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name1} - {t.name2}</option>)}
                        </select>
                    ) : (
                        <div className="flex-1 min-w-0 text-right">
                            <div className="text-[10px] font-black text-slate-800 truncate">{tA?.name1} & {tA?.name2}</div>
                            <div className="text-[8px] text-slate-400 truncate uppercase">{tA?.org}</div>
                        </div>
                    )}
                    <button 
                        onClick={() => onUpdate({ ...match, winnerId: match.winnerId === teamAId ? null : teamAId, isFinished: match.winnerId !== teamAId })}
                        className={`shrink-0 w-5 h-5 flex items-center justify-center rounded border ${match.winnerId === teamAId ? 'bg-green-600 text-white border-green-700 shadow-sm' : 'bg-white text-slate-200 border-slate-200'}`}
                    >
                        <Star size={10} fill={match.winnerId === teamAId ? "currentColor" : "none"} />
                    </button>
                </div>
            </td>

            {/* Tỉ số: 1 séc (Bo1) hoặc 3 séc (Bo3) */}
            <td className="p-1 border-r text-center w-36">
                <div className="flex flex-col gap-1 items-center">
                    <div className="flex items-center gap-1">
                        <ScoreInput s="set1" side="a" />
                        <span className="text-[8px] text-slate-300">S1</span>
                        <ScoreInput s="set1" side="b" />
                    </div>
                    {isBo3 && (
                        <>
                            <div className="flex items-center gap-1">
                                <ScoreInput s="set2" side="a" />
                                <span className="text-[8px] text-slate-300">S2</span>
                                <ScoreInput s="set2" side="b" />
                            </div>
                            <div className="flex items-center gap-1">
                                <ScoreInput s="set3" side="a" />
                                <span className="text-[8px] text-slate-300">S3</span>
                                <ScoreInput s="set3" side="b" />
                            </div>
                        </>
                    )}
                </div>
            </td>

            {/* Đội B */}
            <td className={`p-1 border-r w-[25%] ${match.winnerId === teamBId ? 'bg-green-100/50' : ''}`}>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onUpdate({ ...match, winnerId: match.winnerId === teamBId ? null : teamBId, isFinished: match.winnerId !== teamBId })}
                        className={`shrink-0 w-5 h-5 flex items-center justify-center rounded border ${match.winnerId === teamBId ? 'bg-green-600 text-white border-green-700 shadow-sm' : 'bg-white text-slate-200 border-slate-200'}`}
                    >
                        <Star size={10} fill={match.winnerId === teamBId ? "currentColor" : "none"} />
                    </button>
                    {!match.groupId ? (
                        <select className="flex-1 text-[9px] border border-slate-200 rounded p-1 outline-none font-bold bg-white" value={teamBId} onChange={e => setTeamBId(e.target.value)}>
                            <option value="">-- Đội B --</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name1} - {t.name2}</option>)}
                        </select>
                    ) : (
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-[10px] font-black text-slate-800 truncate">{tB?.name1} & {tB?.name2}</div>
                            <div className="text-[8px] text-slate-400 truncate uppercase">{tB?.org}</div>
                        </div>
                    )}
                </div>
            </td>

            <td className="p-1 text-center w-10">
                {(hasChanges) ? (
                    <button onClick={handleSave} className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded shadow hover:bg-blue-700 animate-pulse"><Save size={12} /></button>
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

    const groupedMatches: Record<string, Match[]> = matches.reduce((acc, m) => {
        const groupName = m.groupId ? (groups.find(g => g.id === m.groupId)?.name || 'Chưa rõ') : 'Vòng Chung Kết';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(m);
        return acc;
    }, {} as Record<string, Match[]>);

    const sortedGroups = Object.keys(groupedMatches).sort((a,b) => {
        if (a === 'Vòng Chung Kết') return 1;
        if (b === 'Vòng Chung Kết') return -1;
        return a.localeCompare(b);
    });

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col mb-10 min-h-[600px]">
            <div className="bg-slate-900 p-1 flex gap-1 shrink-0">
                {['matches', 'data', 'db'].map((t) => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all ${activeTab === t ? 'bg-white text-slate-900 shadow-lg scale-[1.01]' : 'text-slate-500 hover:text-slate-300'}`}>
                        {t === 'matches' ? 'Nhập tỉ số' : t === 'data' ? 'Excel / Word' : 'Cấu hình Cloud'}
                    </button>
                ))}
            </div>

            <div className="bg-slate-50 px-3 py-2 border-b flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
                {CATEGORIES.map(c => (
                    <button key={c.key} onClick={() => setActiveCat(c.key)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeCat === c.key ? 'bg-slate-900 text-white shadow-md scale-[1.01]' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'}`}>{c.label}</button>
                ))}
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'matches' ? (
                    <div className="h-full overflow-y-auto p-3 custom-scrollbar bg-slate-50/30">
                        {sortedGroups.map(groupName => (
                            <div key={groupName} className="mb-6">
                                <div className="flex items-center gap-3 mb-2 sticky top-0 bg-slate-50 z-10 py-1.5 px-1">
                                    <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest">{groupName === 'Vòng Chung Kết' ? 'VÒNG CHUNG KẾT' : `BẢNG ${groupName}`}</span>
                                    <div className="flex-1 h-px bg-slate-200"></div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left table-fixed">
                                        <thead className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase border-b">
                                            <tr>
                                                <th className="p-2 text-center w-8">#</th>
                                                <th className="p-2 w-32">Giờ / Sân</th>
                                                <th className="p-2 w-[25%] text-right pr-6">Đội A</th>
                                                <th className="p-2 text-center w-36">Tỉ số (Bo1/Bo3)</th>
                                                <th className="p-2 w-[25%] pl-6">Đội B</th>
                                                <th className="p-2 text-center w-10">Lưu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedMatches[groupName].sort((a,b) => (a.matchNumber || 0) - (b.matchNumber || 0)).map((m) => (
                                                <MatchRow key={m.id} match={m} teams={teams} onUpdate={m => updateMatch(activeCat, m)} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'data' ? (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-black uppercase text-xs flex items-center gap-2 text-slate-700 mb-2"><Upload size={18} className="text-blue-600"/> Nhập từ Excel</h4>
                            <button onClick={downloadTemplate} className="w-full py-3.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-colors">Tải Mẫu Excel Mới</button>
                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase hover:bg-blue-700 shadow-lg">Nhập Excel Dữ Liệu</button>
                            <input type="file" className="hidden" ref={fileInputRef} onChange={async e => { if (e.target.files?.[0]) { const teams = await parseExcel(e.target.files[0]); if (teams.length > 0) importTeams(activeCat, teams); } }} />
                        </div>
                        <div className="bg-slate-900 text-white p-8 rounded-2xl space-y-4 shadow-xl">
                            <h4 className="font-black uppercase text-xs flex items-center gap-2 mb-2"><FileText size={18} className="text-lime-400"/> Báo cáo & Đồng bộ</h4>
                            <button onClick={() => exportScheduleToWord(data, true)} className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-100 transition-colors shadow-lg">XUẤT LỊCH THI ĐẤU (WORD)</button>
                            <button onClick={uploadDataManual} className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold text-[10px] uppercase hover:bg-blue-400 shadow-lg flex items-center justify-center gap-2"><Cloud size={16}/> ĐỒNG BỘ LÊN CLOUD NGAY</button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 max-w-xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                             <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-slate-800"><Database size={18} className="text-blue-600"/> Cấu hình Firebase Cloud</h3>
                             <p className="text-slate-500 text-[10px] mb-4 italic leading-relaxed">Nhập mã cấu hình JSON để đồng bộ dữ liệu trực tuyến. Thông tin đơn vị sẽ được giữ nguyên có dấu.</p>
                             <textarea className="w-full h-48 p-4 font-mono text-[10px] rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50 shadow-inner" placeholder='{ "apiKey": "...", ... }' value={fbInput} onChange={e=>setFbInput(e.target.value)} />
                             <button onClick={() => { try { setFirebaseConfig(JSON.parse(fbInput)); alert("Đã lưu cấu hình!"); } catch(e) { alert("Lỗi JSON!"); } }} className="mt-4 w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-black transition-all">ÁP DỤNG CẤU HÌNH</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
