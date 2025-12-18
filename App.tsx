
import React, { useRef, useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/Store';
import { CategoryKey } from './types';
import { GroupRanking } from './components/GroupRanking';
import { GroupMatches } from './components/GroupMatches';
import { KnockoutManager } from './components/KnockoutManager';
import { SummaryDashboard } from './components/SummaryDashboard';
import { FinalResults } from './components/FinalResults';
import { AdminPanel } from './components/AdminPanel';
import { parseExcel, downloadTemplate } from './utils/excelParser';
import { Upload, Download, Trash2, Trophy, FileSpreadsheet, Beaker, Lock, X, LayoutDashboard, Cloud, WifiOff, LogOut, Crown, Zap, Heart, Users, Medal, Eraser, Settings, CheckCircle, Loader2, AlertCircle, RefreshCw, UploadCloud, Database, GitCommit, AlertTriangle } from 'lucide-react';

const CategoryTabs = [
  { key: 'summary', label: 'TỔNG HỢP', icon: LayoutDashboard, color: 'text-sky-400', active: 'bg-slate-800 text-sky-400' },
  { key: 'results', label: 'HUY CHƯƠNG', icon: Medal, color: 'text-yellow-400', active: 'bg-green-700 text-white' },
  { key: 'lanhdao', label: 'LÃNH ĐẠO', icon: Crown, color: 'text-yellow-600', active: 'bg-yellow-500 text-white' },
  { key: 'nam', label: 'ĐÔI NAM', icon: Zap, color: 'text-blue-600', active: 'bg-blue-600 text-white' },
  { key: 'nu', label: 'ĐÔI NỮ', icon: Heart, color: 'text-rose-500', active: 'bg-rose-500 text-white' },
  { key: 'namnu', label: 'NAM NỮ', icon: Users, color: 'text-purple-600', active: 'bg-purple-600 text-white' },
];

const GROUP_COLORS: Record<string, { bg: string, text: string, border: string }> = {
    'A': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-500' },
    'B': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500' },
    'C': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-500' },
    'D': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-500' },
    'E': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-500' },
};

// Custom Pickleball Icon
const PickleballIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="6" r="1.2" fill="currentColor"/>
      <circle cx="12" cy="18" r="1.2" fill="currentColor"/>
      <circle cx="6" cy="12" r="1.2" fill="currentColor"/>
      <circle cx="18" cy="12" r="1.2" fill="currentColor"/>
    </svg>
);

const MainContent: React.FC = () => {
  // Fix: Removed 'forceSync' and 'errorMsg' which are not defined in StoreContextType, replaced with 'uploadDataManual'
  const { data, importTeams, setData, resetData, clearCategory, simulateResults, isAdmin, login, logout, isOnline, saveStatus, uploadDataManual, isLoading, serverMode } = useStore();
  const [activeTab, setActiveTab] = useState<CategoryKey | 'summary' | 'results' | 'admin'>('summary');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Security Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{action: () => void, message: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleTabs = isAdmin 
    ? CategoryTabs 
    : CategoryTabs.filter(tab => tab.key === 'summary' || tab.key === 'results');

  useEffect(() => {
      if (!isAdmin && activeTab !== 'summary' && activeTab !== 'results' && activeTab !== 'admin') {
          setActiveTab('summary');
      }
  }, [isAdmin, activeTab]);

  if (isLoading) {
      return (
          <div className="fixed inset-0 bg-slate-100 flex flex-col items-center justify-center z-[9999]">
              <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                   <PickleballIcon size={64} className="text-lime-500 animate-spin-slow" />
                   <h2 className="text-xl font-black text-slate-800 tracking-wider text-center">GIẢI PICKLEBALL CÔNG TY ĐIỆN LỰC TUYÊN QUANG</h2>
                   <div className="flex items-center gap-2 text-blue-600 font-medium">
                       <Loader2 size={20} className="animate-spin" />
                       Đang đồng bộ dữ liệu...
                   </div>
              </div>
          </div>
      );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeTab === 'summary' || activeTab === 'results' || activeTab === 'admin') {
        alert("Vui lòng chọn một nội dung cụ thể để nhập dữ liệu.");
        e.target.value = '';
        return;
    }
    if (e.target.files && e.target.files[0]) {
      try {
        const teams = await parseExcel(e.target.files[0]);
        if (teams.length > 0) {
           importTeams(activeTab as CategoryKey, teams);
           alert(`Đã nhập thành công ${teams.length} đội.`);
        } else {
           alert('Không tìm thấy dữ liệu hợp lệ trong file Excel.');
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
      }
      e.target.value = ''; 
    }
  };

  const handleExportData = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-pickleball-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result as string);
                if (parsed.categories) {
                    setData(parsed);
                    alert("Khôi phục dữ liệu thành công!");
                }
            } catch (err) {
                alert("File dữ liệu lỗi.");
            }
        }
        reader.readAsText(e.target.files[0]);
    }
  }

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(passwordInput)) {
        setShowAuthModal(false);
        setPasswordInput('');
    } else {
        alert("Mật khẩu sai! Vui lòng thử lại.");
        setPasswordInput('');
    }
  };

  const triggerDeleteAction = (action: () => void, message: string) => {
      setPendingDeleteAction({ action, message });
      setShowDeleteModal(true);
  }

  const handleDeleteSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (deletePassword === 'Pickleballpctq') {
          if (pendingDeleteAction) pendingDeleteAction.action();
          setShowDeleteModal(false);
          setDeletePassword('');
          setPendingDeleteAction(null);
      } else {
          alert("Mật khẩu bảo mật không đúng! Không thể xóa.");
          setDeletePassword('');
      }
  }

  const activeCategory = (activeTab !== 'summary' && activeTab !== 'results' && activeTab !== 'admin') ? data.categories[activeTab as CategoryKey] : null;
  const hasData = activeCategory ? activeCategory.teams.length > 0 : false;

  const getHeaderColor = () => {
      const tab = CategoryTabs.find(t => t.key === activeTab);
      if (tab?.key === 'lanhdao') return 'text-yellow-600';
      if (tab?.key === 'nam') return 'text-blue-700';
      if (tab?.key === 'nu') return 'text-rose-600';
      if (tab?.key === 'namnu') return 'text-purple-700';
      if (tab?.key === 'results') return 'text-green-600';
      if (activeTab === 'admin') return 'text-slate-800';
      return 'text-slate-800';
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10">
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Lock size={20} /> Đăng nhập Admin</h3>
                  <button onClick={() => setShowAuthModal(false)}><X size={24} /></button>
              </div>
              <div className="p-6">
                  <p className="text-gray-600 mb-4 text-sm">Nhập mật khẩu quản trị viên để chỉnh sửa dữ liệu.</p>
                  <form onSubmit={handleAuthSubmit}>
                      <input 
                          type="password" 
                          className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-slate-500 outline-none"
                          placeholder="Mật khẩu..."
                          autoFocus
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                      />
                      <button type="submit" className="w-full bg-slate-800 text-white p-2 rounded font-medium hover:bg-slate-900">Đăng nhập</button>
                  </form>
              </div>
           </div>
        </div>
      )}

      {/* SECURITY DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-red-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in zoom-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border-2 border-red-500">
              <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2"><AlertTriangle size={20} /> Xác nhận Xóa Dữ Liệu</h3>
                  <button onClick={() => setShowDeleteModal(false)}><X size={24} /></button>
              </div>
              <div className="p-6">
                  <p className="text-red-600 font-bold mb-2 text-sm uppercase">Hành động này không thể hoàn tác!</p>
                  <p className="text-gray-700 mb-4 text-sm italic">"{pendingDeleteAction?.message}"</p>
                  <form onSubmit={handleDeleteSubmit}>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Nhập mật khẩu bảo mật (Pickleballpctq):</label>
                      <input 
                          type="password" 
                          className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                          placeholder="Nhập mật khẩu xác nhận..."
                          autoFocus
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-200 text-gray-700 p-2 rounded font-medium hover:bg-gray-300">Hủy</button>
                        <button type="submit" className="flex-1 bg-red-600 text-white p-2 rounded font-medium hover:bg-red-700">Xác nhận XÓA</button>
                      </div>
                  </form>
              </div>
           </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="sticky top-0 z-50 flex flex-col shadow-lg bg-slate-900 text-white">
          
          {/* BANNER ROW */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 py-2 px-4 flex justify-between items-center relative border-b border-white/10 h-14">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>

              {/* LEFT: STATUS */}
              <div className="flex items-center gap-2 z-10 shrink-0">
                  <div className="flex items-center gap-2">
                        {/* Fix: Replaced forceSync with uploadDataManual */}
                        {serverMode === 'real-db' && (
                            <span onClick={uploadDataManual} className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold border border-green-500/30 cursor-pointer hover:bg-green-500/30 transition-colors" title="Đã kết nối Database Vĩnh Viễn (KV)"><Database size={10}/> ONLINE</span>
                        )}
                        {serverMode === 'temporary-memory' && (
                            <span onClick={uploadDataManual} className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30 cursor-pointer hover:bg-amber-500/30 transition-colors" title="Đang dùng bộ nhớ tạm"><Database size={10}/> TEMP</span>
                        )}
                        {serverMode === 'offline' && (
                            <span onClick={uploadDataManual} className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold border border-red-500/30 cursor-pointer hover:bg-red-500/30 transition-colors" title="Không kết nối được Server"><WifiOff size={10}/> OFFLINE</span>
                        )}
                        
                        {saveStatus === 'saving' && <span className="flex items-center gap-1 text-[10px] text-blue-300 animate-pulse font-medium hidden md:flex"><Loader2 size={10} className="animate-spin"/> Lưu...</span>}
                        {saveStatus === 'saved' && <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium hidden md:flex"><CheckCircle size={10}/> Đã lưu</span>}
                        {saveStatus === 'error' && <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium hidden md:flex"><AlertCircle size={10}/> Lỗi</span>}
                  </div>
              </div>

              {/* CENTER: TITLE (Updated) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-auto pointer-events-none">
                  <h1 className="text-[10px] md:text-sm lg:text-xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-2 whitespace-nowrap">
                       <span className="hidden lg:block"><PickleballIcon className="text-lime-400 shrink-0 drop-shadow-md" size={24} /></span>
                       <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-100">
                           GIẢI PICKLEBALL CÔNG TY ĐIỆN LỰC TUYÊN QUANG ĐÁNH DẤU 71 NĂM NGÀY TRUYỀN THỐNG NGÀNH ĐIỆN LỰC
                       </span>
                       <span className="hidden lg:block"><PickleballIcon className="text-lime-400 shrink-0 drop-shadow-md" size={24} /></span>
                  </h1>
              </div>

              {/* RIGHT: ACTIONS */}
              <div className="flex items-center gap-2 z-10 shrink-0">
                  {!isAdmin ? (
                      <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition-all border border-white/10">
                          <Lock size={14} /> <span className="hidden sm:inline">Admin</span>
                      </button>
                  ) : (
                      <>
                            <label className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-xs font-medium cursor-pointer transition-colors text-white" title="Import Backup">
                              <Upload size={14} /> 
                              <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                          </label>
                          <button onClick={handleExportData} className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded hover:bg-white/20 text-xs font-medium transition-colors border border-white/10" title="Backup Data">
                              <Download size={14} /> 
                          </button>
                          <button onClick={() => triggerDeleteAction(resetData, "Xóa toàn bộ dữ liệu (Hard Reset)?")} className="p-1.5 text-red-300 hover:bg-red-500/20 rounded transition-colors" title="Reset All">
                              <Trash2 size={16} />
                          </button>
                          <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 bg-red-600/80 text-white rounded hover:bg-red-600 text-xs font-bold transition-colors shadow-sm ml-2">
                              <LogOut size={14} /> <span className="hidden sm:inline">Thoát</span>
                          </button>
                      </>
                  )}
              </div>
          </div>

          {/* TABS ROW */}
           <div className="bg-slate-900/95 text-white px-4 pb-0 overflow-x-auto hide-scrollbar border-t border-slate-700/50 backdrop-blur-sm">
            <div className="flex justify-center min-w-max mx-auto">
                {visibleTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-4 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                        ? `${tab.active} border-yellow-500`
                        : `text-slate-400 border-transparent hover:text-white hover:bg-white/5`
                    }`}
                >
                    <Icon size={16} className={isActive ? 'text-current' : `text-slate-500`} />
                    {tab.label}
                </button>
                )})}
                
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-4 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'admin'
                            ? `bg-slate-700 text-white border-yellow-500`
                            : `text-slate-400 border-transparent hover:text-white hover:bg-white/5`
                        }`}
                    >
                        <Settings size={16} />
                        CẤU HÌNH
                    </button>
                )}
            </div>
          </div>
      </div>

      <main className="p-4 md:p-6 max-w-[1920px] mx-auto">
         {activeTab === 'summary' ? (
             <SummaryDashboard data={data} />
         ) : activeTab === 'results' ? (
             <FinalResults data={data} />
         ) : activeTab === 'admin' ? (
             <AdminPanel />
         ) : (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                {isAdmin && (
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
                             Quản lý: <span className={`${getHeaderColor()}`}>{activeCategory?.name}</span>
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <button 
                                onClick={() => simulateResults(activeTab as CategoryKey)}
                                disabled={hasData}
                                title={hasData ? "Hãy xóa dữ liệu trước khi chạy kiểm thử" : "Tạo dữ liệu giả và chạy hết giải đấu"}
                                className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded uppercase tracking-wider transition-colors border ${
                                    hasData 
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                    : 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100'
                                }`}
                            >
                                <Beaker size={14} /> Kiểm thử (Auto)
                            </button>
                            
                            <div className="h-6 w-px bg-gray-200 mx-2"></div>
                            
                            <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                            <button 
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded hover:bg-blue-100 transition-colors"
                            >
                                <FileSpreadsheet size={16} /> File Mẫu
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 text-sm text-white bg-green-600 px-3 py-2 rounded shadow hover:bg-green-700 transition-colors"
                            >
                                <Upload size={16} /> Nhập Excel
                            </button>

                             <div className="h-6 w-px bg-gray-200 mx-2"></div>

                             {/* CLEAR CATEGORY DATA - PROTECTED */}
                             <button 
                                onClick={() => triggerDeleteAction(() => clearCategory(activeTab as CategoryKey), `Xóa toàn bộ dữ liệu của nội dung ${activeCategory?.name}?`)}
                                disabled={!hasData}
                                className={`flex items-center gap-2 text-sm px-3 py-2 rounded shadow transition-colors ${
                                    !hasData
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'text-white bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                <Eraser size={16} /> Xóa dữ liệu
                            </button>
                        </div>
                    </div>
                )}
                
                {!isAdmin && (
                    <div className={`mb-6 border-l-4 pl-4 ${
                        activeTab === 'lanhdao' ? 'border-yellow-500' :
                        activeTab === 'nam' ? 'border-blue-600' :
                        activeTab === 'nu' ? 'border-rose-500' : 'border-purple-600'
                    }`}>
                         <h2 className={`text-2xl font-bold ${getHeaderColor()}`}>{activeCategory?.name}</h2>
                    </div>
                )}

                {activeCategory && activeCategory.groups.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-400 text-lg">Chưa có dữ liệu cho nội dung này.</p>
                        {isAdmin && <p className="text-gray-400 text-sm mt-2">Vui lòng nhập Excel hoặc chạy Kiểm thử.</p>}
                    </div>
                ) : (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {activeCategory?.groups.map(group => {
                                const style = GROUP_COLORS[group.name] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-400' };
                                return (
                                    <div key={group.id} className={`bg-white rounded-xl shadow-md border-t-8 ${style.border} flex flex-col`}>
                                        <div className={`${style.bg} px-4 py-3 relative flex justify-center items-center border-b`}>
                                            <h3 className={`text-xl font-black ${style.text} text-center`}>BẢNG {group.name}</h3>
                                            <span className="absolute right-4 text-[10px] font-bold uppercase tracking-widest bg-white/60 px-2 py-1 rounded text-gray-600">Vòng Bảng</span>
                                        </div>
                                        <div className="p-4 space-y-4 flex-1 flex flex-col">
                                            <div className="flex-shrink-0">
                                                <GroupRanking 
                                                    group={group} 
                                                    matches={activeCategory.matches} 
                                                    teams={activeCategory.teams}
                                                    colorClass={style.bg}
                                                />
                                            </div>
                                            <div className="flex-1 min-h-[300px]">
                                                <GroupMatches 
                                                    group={group} 
                                                    matches={activeCategory.matches} 
                                                    teams={activeCategory.teams} 
                                                    categoryName={activeCategory.name}
                                                    colorClass={style.bg}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-12 bg-slate-800 p-1 rounded-2xl shadow-xl">
                            <div className="bg-slate-50 rounded-xl p-6">
                                <KnockoutManager categoryData={activeCategory!} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
         )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
};

export default App;
