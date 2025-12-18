import * as XLSX from 'xlsx';
import { Team } from '../types';

export const parseExcel = async (file: File): Promise<Team[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const teams: Team[] = [];

        if (!jsonData || jsonData.length === 0) {
            resolve([]);
            return;
        }

        // Check format: 
        // Format Mới (1 Cột): STT | Cặp VĐV | Đơn vị | Bảng
        // Format Cũ (2 Cột): STT | VĐV 1 | VĐV 2 | Đơn vị | Bảng
        
        // Scan from row 1
        for (let i = 1; i < jsonData.length; i++) {
            const row: any = jsonData[i];
            if (Array.isArray(row) && row.length >= 2) {
                const cell1 = row[1] ? String(row[1]).trim() : '';
                
                // Bỏ qua dòng tiêu đề hoặc dòng trống
                if (!cell1 || cell1.toLowerCase().includes('tên vđv') || cell1.toLowerCase().includes('cặp vđv')) continue;

                let name1 = '';
                let name2 = '';
                let org = '';
                let grp = '';

                // Logic nhận diện Format Mới: Có ký tự ngăn cách trong ô đầu tiên
                const separators = [" - ", " – ", "-", " & ", " và ", ","];
                const usedSeparator = separators.find(s => cell1.includes(s));

                if (usedSeparator) {
                    // Format 1 cột: [Name1 - Name2] [Org] [Group]
                    const parts = cell1.split(usedSeparator);
                    name1 = parts[0].trim();
                    name2 = parts.length > 1 ? parts[1].trim() : '???';
                    org = row[2] ? String(row[2]).trim() : '';
                    grp = row[3] ? String(row[3]).trim() : '';
                } else {
                    // Fallback về Format Cũ: [Name1] [Name2] [Org] [Group]
                    // Nếu ô thứ 2 cũng là Tên (không phải Đơn vị)
                    // Heuristic: Đơn vị thường dài hoặc chứa "Điện lực", "Phòng", "Ban". Tên người thường ngắn (2-4 từ).
                    // Tuy nhiên để đơn giản: Nếu có cột 3 và 4, thì khả năng cao cột 2 là Tên 2.
                    
                    if (row[2] && row[3]) {
                        // Đủ cột cho format cũ
                        name1 = cell1;
                        name2 = String(row[2]).trim();
                        org = String(row[3]).trim();
                        grp = row[4] ? String(row[4]).trim() : '';
                    } else {
                        // Trường hợp không rõ ràng, mặc định format cũ nếu không có separator
                        name1 = cell1;
                        name2 = row[2] ? String(row[2]).trim() : '???';
                        org = row[3] ? String(row[3]).trim() : '';
                        grp = row[4] ? String(row[4]).trim() : '';
                    }
                }

                teams.push({
                    id: crypto.randomUUID(),
                    name1: name1,
                    name2: name2,
                    org: org,
                    initialGroupName: grp ? grp.toUpperCase() : undefined
                });
            }
        }
        resolve(teams);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

export const downloadTemplate = () => {
  // Format Mới: Gộp cột tên để dễ nhập liệu
  const header = ["STT", "Cặp VĐV (VĐV 1 - VĐV 2)", "Đơn vị", "Bảng (A/B/C)"];
  
  const data = [
    header,
    [1, "Nguyễn Văn A - Trần Thị B", "Điện lực TP", "A"],
    [2, "Lê Văn C - Hoàng Thị D", "Phòng Kỹ Thuật", "A"],
    [3, "Phạm Văn E - Vũ Thị F", "Điện lực Yên Sơn", "B"],
    [4, "Đặng Văn G - Ngô Thị H", "Phòng Kinh Doanh", "B"],
    [5, "Trịnh Văn I - Lý Thị K", "Ban Giám Đốc", "C"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set col widths
  ws['!cols'] = [
      { wch: 5 }, 
      { wch: 40 }, // Cột tên rộng hơn
      { wch: 25 }, 
      { wch: 10 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DanhSachDangKy");
  XLSX.writeFile(wb, "Mau_Nhap_Lieu_PC_TuyenQuang.xlsx");
};