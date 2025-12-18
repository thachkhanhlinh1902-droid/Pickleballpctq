import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign, Header, Footer, PageNumber, PageBreak } from "docx";
import FileSaver from "file-saver";
import { Match, Team, TournamentData, CategoryKey } from "../types";

// --- HELPERS ---
const createEmptyLine = () => new Paragraph({ text: "" });

const createTextCell = (
    text: string, 
    options: { bold?: boolean, align?: typeof AlignmentType.CENTER | typeof AlignmentType.LEFT | typeof AlignmentType.RIGHT, width?: number, size?: number, color?: string, italics?: boolean },
    cellOptions?: { fill?: string }
) => {
    return new TableCell({
        width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        shading: cellOptions?.fill ? { fill: cellOptions.fill } : undefined,
        children: [
            new Paragraph({
                alignment: options.align || AlignmentType.CENTER,
                children: [new TextRun({ 
                    text: text, 
                    bold: options.bold, 
                    size: options.size || 22, 
                    font: "Times New Roman",
                    color: options.color || "000000",
                    italics: options.italics
                })]
            })
        ]
    });
};

export const generateMatchReport = async (match: Match, teamA?: Team, teamB?: Team, categoryName?: string) => {
    if (!teamA || !teamB) { alert("Thiếu thông tin đội."); return; }
    
    const titleStyle = { bold: true, size: 28, font: "Times New Roman" };
    const normalStyle = { size: 26, font: "Times New Roman" };
    const boldStyle = { size: 26, bold: true, font: "Times New Roman" };
    const formatOrg = (org: string) => org ? `(${org})` : "";
    const isThreeSets = match.roundName.includes('Bán kết') || match.roundName.includes('Chung kết');
    const scoreCells = [];
    scoreCells.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: isThreeSets ? "Séc 1: ..... - ....." : "Tỷ số: ..... - .....", ...normalStyle })] }));
    if (isThreeSets) {
        scoreCells.push(createEmptyLine());
        scoreCells.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Séc 2: ..... - .....", ...normalStyle })] }));
        scoreCells.push(createEmptyLine());
        scoreCells.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Séc 3: ..... - .....", ...normalStyle })] }));
    }

    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
            children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", ...titleStyle, size: 24 })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", ...titleStyle, size: 24, underline: {} })] }),
                createEmptyLine(),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "GIẢI PICKLEBALL CÔNG TY ĐIỆN LỰC TUYÊN QUANG", ...titleStyle, size: 24 })] }),
                createEmptyLine(),
                new Paragraph({ alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "BIÊN BẢN TRẬN ĐẤU", ...titleStyle, size: 36 })] }),
                createEmptyLine(),
                new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: `Nội dung: ${categoryName}`, ...normalStyle }), new TextRun({ text: ` - Vòng: ${match.roundName}`, ...boldStyle })] }),
                createEmptyLine(),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({ children: [
                            createTextCell("ĐỘI 1", { bold: true, width: 40 }),
                            createTextCell("TỶ SỐ", { bold: true, width: 20 }),
                            createTextCell("ĐỘI 2", { bold: true, width: 40 })
                        ]}),
                        new TableRow({ height: { value: 2000, rule: "atLeast" }, children: [
                            new TableCell({ verticalAlign: VerticalAlign.CENTER, children: [
                                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: teamA.name1, ...boldStyle })] }),
                                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: teamA.name2, ...boldStyle })] }),
                                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formatOrg(teamA.org), ...normalStyle, italics: true })] })
                            ]}),
                            new TableCell({ verticalAlign: VerticalAlign.CENTER, children: scoreCells }),
                            new TableCell({ verticalAlign: VerticalAlign.CENTER, children: [
                                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: teamB.name1, ...boldStyle })] }),
                                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: teamB.name2, ...boldStyle })] }),
                                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formatOrg(teamB.org), ...normalStyle, italics: true })] })
                            ]})
                        ]})
                    ]
                }),
                createEmptyLine(),
                new Paragraph({ children: [new TextRun({ text: "Đội thắng: ................................................................................................", ...normalStyle })] }),
                 createEmptyLine(), createEmptyLine(),
                 new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
                    rows: [
                        new TableRow({ children: [
                            createTextCell("ĐẠI DIỆN ĐỘI 1\n(Ký tên)", { bold: true }),
                            createTextCell("TRỌNG TÀI\n(Ký tên)", { bold: true }),
                            createTextCell("ĐẠI DIỆN ĐỘI 2\n(Ký tên)", { bold: true })
                        ]})
                    ]
                 })
            ]
        }]
    });
    const blob = await Packer.toBlob(doc);
    FileSaver.saveAs(blob, `BienBan-${categoryName}-${match.roundName}.docx`);
};

// --- MAIN EXPORT FUNCTION ---
export const exportScheduleToWord = async (data: TournamentData, includeDetails: boolean = false) => {
    const docTitleStyle = { bold: true, size: 28, font: "Times New Roman", color: "2E7D32" }; // Green Title
    const catHeaderStyle = { bold: true, size: 28, font: "Times New Roman", color: "FFFFFF" };
    const groupTitleStyle = { bold: true, size: 24, font: "Times New Roman", color: "C2185B" }; // Pink/Red for Groups
    const headerCellStyle = { bold: true, size: 20, font: "Times New Roman", color: "FFFFFF" };
    
    const teamNameStyle = { bold: true, size: 20, font: "Times New Roman" };
    const orgStyle = { italics: true, size: 16, font: "Times New Roman", color: "666666" };
    const vsStyle = { bold: true, size: 18, font: "Times New Roman", color: "FF0000" };
    
    const categories: {key: CategoryKey, name: string}[] = [
        { key: 'lanhdao', name: 'NỘI DUNG: ĐÔI LÃNH ĐẠO' },
        { key: 'nam', name: 'NỘI DUNG: ĐÔI NAM' },
        { key: 'nu', name: 'NỘI DUNG: ĐÔI NỮ' },
        { key: 'namnu', name: 'NỘI DUNG: ĐÔI NAM NỮ' },
    ];

    const children: any[] = [];

    // --- TRANG BÌA ---
    children.push(
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CÔNG TY ĐIỆN LỰC TUYÊN QUANG", bold: true, size: 24, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "______________________", bold: true, size: 24 })] }),
        createEmptyLine(), createEmptyLine(), createEmptyLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "LỊCH THI ĐẤU", ...docTitleStyle, size: 36 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "GIẢI PICKLEBALL CÔNG TY ĐIỆN LỰC TUYÊN QUANG", ...docTitleStyle, size: 28, color: "000000" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ĐÁNH DẤU 71 NĂM NGÀY TRUYỀN THỐNG NGÀNH ĐIỆN LỰC", ...docTitleStyle, size: 24, color: "000000" })] }),
        createEmptyLine(), createEmptyLine(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Tuyên Quang, tháng 12 năm 2024`, italics: true, size: 24, font: "Times New Roman" })] }),
        new Paragraph({ children: [new PageBreak()] }) // Sang trang mới bắt đầu nội dung
    );

    for (const cat of categories) {
        const catData = data.categories[cat.key];
        const allMatches = [...catData.matches];
        
        if (allMatches.length === 0) continue;

        // -- TIÊU ĐỀ NỘI DUNG (Mỗi nội dung sang trang mới, trừ trang đầu tiên sau bìa) --
        if (children.length > 10) children.push(new Paragraph({ children: [new PageBreak()] }));

        children.push(
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE } },
                rows: [
                    new TableRow({ children: [
                        new TableCell({
                            shading: { fill: "1565C0" }, // Blue Header
                            verticalAlign: VerticalAlign.CENTER,
                            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new TextRun({ text: cat.name, ...catHeaderStyle })] })]
                        })
                    ]})
                ]
            }),
            createEmptyLine()
        );

        // 1. XỬ LÝ VÒNG BẢNG (GROUP STAGE)
        // Lấy danh sách ID các bảng đấu
        const groupIds = Array.from(new Set(allMatches.filter(m => m.groupId).map(m => m.groupId)));
        
        // Sắp xếp ID bảng đấu dựa theo TÊN BẢNG (A, B, C...) thay vì ID loằng ngoằng
        groupIds.sort((idA, idB) => {
            const nameA = catData.groups.find(g => g.id === idA)?.name || '';
            const nameB = catData.groups.find(g => g.id === idB)?.name || '';
            return nameA.localeCompare(nameB);
        });

        if (groupIds.length > 0) {
            for (const gid of groupIds) {
                if (!gid) continue;
                // Tìm tên bảng dựa trên gid
                const groupObj = catData.groups.find(g => g.id === gid);
                const groupName = groupObj ? groupObj.name : 'Unknown';

                // Lọc trận của bảng này
                const groupMatches = allMatches.filter(m => m.groupId === gid).sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
                
                // Tiêu đề Bảng: HIỂN THỊ TÊN BẢNG (A, B...) CHỨ KHÔNG PHẢI ID
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: `❖ BẢNG ${groupName}`, ...groupTitleStyle })],
                        spacing: { before: 200, after: 100 }
                    })
                );

                // Header Cột
                const rows = [
                    new TableRow({
                        tableHeader: true,
                        children: [
                            createTextCell("STT", { ...headerCellStyle, width: 5 }, { fill: "757575" }),
                            createTextCell("ĐỘI 1", { ...headerCellStyle, width: 35 }, { fill: "757575" }),
                            createTextCell("VS", { ...headerCellStyle, width: 8 }, { fill: "757575" }),
                            createTextCell("ĐỘI 2", { ...headerCellStyle, width: 35 }, { fill: "757575" }),
                            createTextCell("THỜI GIAN", { ...headerCellStyle, width: 12 }, { fill: "757575" }),
                            createTextCell("SÂN", { ...headerCellStyle, width: 5 }, { fill: "757575" }),
                        ]
                    })
                ];

                groupMatches.forEach((m, idx) => {
                    const tA = catData.teams.find(t => t.id === m.teamAId);
                    const tB = catData.teams.find(t => t.id === m.teamBId);

                    const timeText = includeDetails && m.time ? m.time : ".......";
                    const courtText = includeDetails && m.court ? m.court : "...";

                    rows.push(new TableRow({
                        height: { value: 800, rule: "atLeast" },
                        children: [
                            createTextCell(`${idx + 1}`, { size: 20 }), // STT
                            // Team A (Right Align)
                            new TableCell({
                                verticalAlign: VerticalAlign.CENTER,
                                children: [
                                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: tA ? `${tA.name1} & ${tA.name2}` : '...', ...teamNameStyle })] }),
                                    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: tA ? `(${tA.org})` : '', ...orgStyle })] })
                                ]
                            }),
                            createTextCell("vs", { ...vsStyle }),
                            // Team B (Left Align)
                            new TableCell({
                                verticalAlign: VerticalAlign.CENTER,
                                children: [
                                    new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: tB ? `${tB.name1} & ${tB.name2}` : '...', ...teamNameStyle })] }),
                                    new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: tB ? `(${tB.org})` : '', ...orgStyle })] })
                                ]
                            }),
                            createTextCell(timeText, { color: includeDetails ? "000000" : "CCCCCC", size: 20 }),
                            createTextCell(courtText, { color: includeDetails ? "000000" : "CCCCCC", size: 20 }),
                        ]
                    }));
                });

                children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows }), createEmptyLine());
            }
        }

        // 2. XỬ LÝ VÒNG CHUNG KẾT (KNOCKOUT)
        const knockoutMatches = allMatches.filter(m => !m.groupId).sort((a,b) => {
            const getScore = (round: string) => {
                if(round.includes('Tứ kết')) return 1;
                if(round.includes('Bán kết')) return 2;
                if(round.includes('Tranh')) return 3;
                if(round.includes('Chung kết')) return 4;
                return 5;
            };
            const sA = getScore(a.roundName);
            const sB = getScore(b.roundName);
            if (sA !== sB) return sA - sB;
            return (a.matchNumber || 0) - (b.matchNumber || 0);
        });

        if (knockoutMatches.length > 0) {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: `❖ VÒNG CHUNG KẾT`, ...groupTitleStyle, color: "E65100" })],
                    spacing: { before: 200, after: 100 }
                })
            );

            const rows = [
                new TableRow({
                    tableHeader: true,
                    children: [
                        createTextCell("STT", { ...headerCellStyle, width: 5 }, { fill: "546E7A" }),
                        createTextCell("VÒNG", { ...headerCellStyle, width: 15 }, { fill: "546E7A" }),
                        createTextCell("ĐỘI 1", { ...headerCellStyle, width: 30 }, { fill: "546E7A" }),
                        createTextCell("VS", { ...headerCellStyle, width: 5 }, { fill: "546E7A" }),
                        createTextCell("ĐỘI 2", { ...headerCellStyle, width: 30 }, { fill: "546E7A" }),
                        createTextCell("THỜI GIAN", { ...headerCellStyle, width: 10 }, { fill: "546E7A" }),
                        createTextCell("SÂN", { ...headerCellStyle, width: 5 }, { fill: "546E7A" }),
                    ]
                })
            ];

            knockoutMatches.forEach((m, idx) => {
                const tA = catData.teams.find(t => t.id === m.teamAId);
                const tB = catData.teams.find(t => t.id === m.teamBId);
                let roundName = m.roundName.replace('Tứ kết', 'Tứ kết ').replace('Bán kết', 'Bán kết ');

                const timeText = includeDetails && m.time ? m.time : ".......";
                const courtText = includeDetails && m.court ? m.court : "...";

                rows.push(new TableRow({
                    height: { value: 800, rule: "atLeast" },
                    children: [
                        createTextCell(`${idx + 1}`, { size: 20 }),
                        createTextCell(roundName, { size: 20, bold: true }),
                        // Team A
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: tA ? `${tA.name1} & ${tA.name2}` : '...', ...teamNameStyle })] }),
                                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: tA ? `(${tA.org})` : '', ...orgStyle })] })
                            ]
                        }),
                        createTextCell("vs", { ...vsStyle }),
                        // Team B
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                                new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: tB ? `${tB.name1} & ${tB.name2}` : '...', ...teamNameStyle })] }),
                                new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: tB ? `(${tB.org})` : '', ...orgStyle })] })
                            ]
                        }),
                        createTextCell(timeText, { color: includeDetails ? "000000" : "CCCCCC", size: 20 }),
                        createTextCell(courtText, { color: includeDetails ? "000000" : "CCCCCC", size: 20 }),
                    ]
                }));
            });

            children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows }));
        }
    }

    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
            headers: {
                default: new Header({ children: [ new Paragraph({ children: [ new TextRun({ text: "PC TUYÊN QUANG - GIẢI PICKLEBALL 2024", size: 16, italics: true, color: "888888" }) ], alignment: AlignmentType.RIGHT }) ] }),
            },
            footers: {
                default: new Footer({ children: [ new Paragraph({ children: [ new TextRun({ text: "Trang ", size: 16 }), PageNumber.CURRENT, new TextRun({ text: " / ", size: 16 }), PageNumber.TOTAL_PAGES ], alignment: AlignmentType.CENTER }) ] }),
            },
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    FileSaver.saveAs(blob, `Lich_Thi_Dau_PC_TuyenQuang.docx`);
}