import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Household, Member, Voter, VoterStatus, Settings } from '../types';

// Helper to convert Excel date serial number to YYYY-MM-DD string
const excelDateToJSDate = (serial: any): string => {
    if (typeof serial === 'number') {
        // Excel's epoch starts on 1900-01-01, which is 25569 days before Unix epoch.
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        
        const year = date_info.getUTCFullYear();
        const month = (date_info.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date_info.getUTCDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    // Attempt to parse if it's a date string
    try {
        const d = new Date(serial);
        if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch (e) {
        // Fallback for other formats
    }
    return serial?.toString() || '';
};

const getAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const parseCensusExcel = (data: ArrayBuffer): Household[] => {
    const workbook = XLSX.read(data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: any[] = XLSX.utils.sheet_to_json(worksheet);

    const householdsMap: Map<string, Household> = new Map();

    json.forEach((row, index) => {
        const houseNo = row['House No']?.toString().trim();
        if (!houseNo) return;

        const member: Member = {
            id: `m_${Date.now()}_${index}`,
            name: row['Member Name'] || 'Unnamed',
            dob: excelDateToJSDate(row['DOB']),
            gender: row['Gender'] || 'Other',
            isHof: ['yes', 'true'].includes(row['Is HOF']?.toString().toLowerCase()),
            aadhar: row['Aadhar']?.toString() || undefined,
            phone: row['Phone']?.toString() || undefined,
            status: 'Active',
        };

        let household = householdsMap.get(houseNo);
        if (household) {
            household.members.push(member);
        } else {
            household = {
                id: `h_${Date.now()}_${houseNo}`,
                houseNo,
                address: row['Address'] || '',
                members: [member],
            };
            householdsMap.set(houseNo, household);
        }
    });
    
    // Ensure each household has one HOF. Prioritize the first one marked, or the first member.
    householdsMap.forEach(h => {
        const hofIndex = h.members.findIndex(m => m.isHof);
        if (hofIndex !== -1) {
            h.members.forEach((m, i) => { m.isHof = (i === hofIndex); });
        } else if (h.members.length > 0) {
            h.members[0].isHof = true;
        }
    });

    return Array.from(householdsMap.values());
};

const parseVotersExcel = (data: ArrayBuffer): Voter[] => {
    const workbook = XLSX.read(data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Use { defval: "" } to ensure all cells have a value, preventing errors on empty cells
    const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (json.length === 0) return [];
    
    // Normalize headers from the file for case-insensitive and space/dot-insensitive matching
    const headers = Object.keys(json[0]);
    const normalizedFileHeaders: { [key: string]: string } = {};
    headers.forEach(h => {
        normalizedFileHeaders[h.toLowerCase().trim().replace(/[\s.]+/g, '')] = h;
    });

    // Helper to find the actual header key from the file based on a list of potential normalized keys
    const findHeader = (potentialKeys: string[]): string | undefined => {
        for (const key of potentialKeys) {
            if (normalizedFileHeaders[key]) {
                return normalizedFileHeaders[key];
            }
        }
        return undefined;
    };
    
    // Map internal property names to the actual headers found in the Excel file
    const mappedHeaders = {
        epicNo: findHeader(['epicno', 'epic']),
        firstName: findHeader(['firstname']),
        lastName: findHeader(['lastname']),
        name: findHeader(['name', 'fullname']),
        gender: findHeader(['gender']),
        age: findHeader(['age']),
        dob: findHeader(['dob', 'dateofbirth']),
        relationType: findHeader(['rlntype', 'relationtype']),
        relationName: findHeader(['rlnname', 'relationname', 'rln']),
        address: findHeader(['address', 'houseno']),
        section: findHeader(['section']),
        sectionNo: findHeader(['sectionno', 'sectionnumber']),
        partNo: findHeader(['partno']),
        partSerialNo: findHeader(['partserialno', 'slnoinpart', 'serialno']),
    };

    const getGender = (genderStr: any): 'Male' | 'Female' | 'Other' => {
        const g = (genderStr || '').toString().trim().toUpperCase();
        if (g.startsWith('M')) return 'Male';
        if (g.startsWith('F')) return 'Female';
        return 'Other';
    };

    const parseOptionalInt = (value: any): number | undefined => {
        if (value === null || value === undefined || value === "") return undefined;
        const num = parseInt(value, 10);
        return isNaN(num) ? undefined : num;
    };

    return json.map((row, index) => {
        const firstName = mappedHeaders.firstName ? row[mappedHeaders.firstName]?.toString().trim() : '';
        const lastName = mappedHeaders.lastName ? row[mappedHeaders.lastName]?.toString().trim() : '';
        let name = mappedHeaders.name ? row[mappedHeaders.name]?.toString().trim() : '';

        if (!name && (firstName || lastName)) {
            name = `${firstName} ${lastName}`.trim();
        }
        
        const dobValue = mappedHeaders.dob ? row[mappedHeaders.dob] : undefined;
        const dob = dobValue ? excelDateToJSDate(dobValue) : undefined;
        
        let age = mappedHeaders.age ? parseInt(row[mappedHeaders.age], 10) : NaN;
        if (isNaN(age) && dob) {
            age = getAge(dob);
        }
        
        const voter: Voter = {
            id: `v_${Date.now()}_${index}`,
            epicNo: mappedHeaders.epicNo ? row[mappedHeaders.epicNo]?.toString() || '' : '',
            name: name || 'Unnamed',
            gender: getGender(mappedHeaders.gender ? row[mappedHeaders.gender] : 'Other'),
            age: isNaN(age) ? 0 : age,
            houseNo: mappedHeaders.address ? row[mappedHeaders.address]?.toString() || '' : '',
            section: mappedHeaders.section ? row[mappedHeaders.section]?.toString() : undefined,
            sectionNumber: parseOptionalInt(mappedHeaders.sectionNo ? row[mappedHeaders.sectionNo] : undefined),
            status: 'Active' as VoterStatus,
            linkedMemberId: undefined,
            dob: dob,
            relationType: mappedHeaders.relationType ? row[mappedHeaders.relationType]?.toString() : undefined,
            relationName: mappedHeaders.relationName ? row[mappedHeaders.relationName]?.toString() : undefined,
            partNo: parseOptionalInt(mappedHeaders.partNo ? row[mappedHeaders.partNo] : undefined),
            partSerialNo: parseOptionalInt(mappedHeaders.partSerialNo ? row[mappedHeaders.partSerialNo] : undefined),
        };
        return voter;
    });
};

const exportCensusData = (households: Household[]) => {
    const flattenedData = households.flatMap(h => 
        h.members.map(m => ({
            'House No': h.houseNo,
            'Address': h.address,
            'Member Name': m.name,
            'DOB': m.dob,
            'Gender': m.gender,
            'Is HOF': m.isHof ? 'Yes' : 'No',
            'Aadhar': m.aadhar || '',
            'Phone': m.phone || '',
        }))
    );
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Census Data');
    XLSX.writeFile(workbook, 'census_data_export.xlsx');
};

const exportVoterList = (voters: Voter[]) => {
    const dataToExport = voters.map(v => ({
        'EPIC No': v.epicNo,
        'Name': v.name,
        'Gender': v.gender,
        'Age': v.age,
        'House No': v.houseNo,
        'Section': v.section || '',
        'Section Number': v.sectionNumber || '',
        'Status': v.status,
        'Linked Member ID': v.linkedMemberId || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Voter List');
    XLSX.writeFile(workbook, 'voter_list_export.xlsx');
};

const downloadJsonBackup = (data: object, filename: string) => {
    const jsonString = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const exportBloRegister = (settings: Settings, households: Household[], voters: Voter[]) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    const allMembers = households.flatMap(h => 
        h.members.map(m => ({ ...m, houseNo: h.houseNo, householdId: h.id }))
    );
    const hofMap = new Map<string, { name: string, phone?: string }>();
    households.forEach(h => {
        const hof = h.members.find(m => m.isHof);
        if (hof) {
            hofMap.set(h.id, { name: hof.name, phone: hof.phone });
        }
    });
    
    // --- Page 1: Cover Page ---
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // Border
    doc.setFontSize(12);
    doc.text("Election Commission of India", pageWidth / 2, 30, { align: 'center' });
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("BOOTH LEVEL OFFICER'S REGISTER", pageWidth / 2, 50, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Summary of Census and Electoral Roll Data", pageWidth / 2, 60, { align: 'center' });
    
    autoTable(doc, {
        startY: 80,
        body: [
            ['Assembly Constituency:', settings.assemblyConstituency],
            ['Part No & Name:', settings.part],
            ['BLO Name:', settings.bloName],
            ['BLO Designation:', settings.bloDesignation],
            ['BLO Address:', settings.bloAddress],
            ['BLO Mobile:', settings.bloMobile],
        ],
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 2, halign: 'left' },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 'auto' },
        },
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    const year = new Date().getFullYear() + 1;
    doc.text(`Generated ${year} | BLO Register App`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // --- Data Calculation ---
    const totalPopulation = allMembers.length;
    const malePopulation = allMembers.filter(m => m.gender === 'Male').length;
    const femalePopulation = allMembers.filter(m => m.gender === 'Female').length;
    const totalElectors = voters.length;
    const maleElectors = voters.filter(v => v.gender === 'Male').length;
    const femaleElectors = voters.filter(v => v.gender === 'Female').length;
    const epRatio = totalPopulation > 0 ? Math.round((totalElectors / totalPopulation) * 1000) : 0;
    const genderRatio = maleElectors > 0 ? Math.round((femaleElectors / maleElectors) * 1000) : 0;
    
    let pageNumber = 2;
    const addHeaderAndFooter = (title: string) => {
        doc.setFontSize(9);
        doc.setTextColor(100);
        const headerText = `${settings.assemblyConstituency} | Part: ${settings.part}`;
        doc.text(headerText, 15, 10);
        doc.text(`Page ${pageNumber}`, pageWidth - 25, 10);
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40);
        doc.text(title, 15, 25);
        doc.setFont('helvetica', 'normal');
        
        doc.setFontSize(8);
        doc.setTextColor(150);
        const today = new Date().toLocaleDateString('en-GB');
        doc.text(`Generated on: ${today}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pageNumber++;
    };

    // --- Page 2: Statistical Summary ---
    doc.addPage();
    addHeaderAndFooter("Statistical Summary");
    
    autoTable(doc, {
        head: [['Census Statistics', 'Value']],
        body: [
            ['Total Households', households.length],
            ['Total Population', totalPopulation],
            ['Male Population', malePopulation],
            ['Female Population', femalePopulation],
        ],
        startY: 35,
        theme: 'grid',
        tableWidth: 'auto',
        margin: { right: pageWidth / 2 + 5 }
    });

    autoTable(doc, {
        head: [['Election Statistics', 'Value']],
        body: [
            ['Total Electors', totalElectors],
            ['Male Electors', maleElectors],
            ['Female Electors', femaleElectors],
            ['EP Ratio (Electors per 1000 population)', epRatio],
            ['Gender Ratio (Females per 1000 males)', genderRatio],
        ],
        startY: 35,
        theme: 'grid',
        tableWidth: 'auto',
        margin: { left: pageWidth / 2 + 5 }
    });

    // --- Page 3: Age Cohort Analysis ---
    doc.addPage();
    addHeaderAndFooter("STATEMENT-1: Age Cohort Analysis");
    const cohorts = [
        { label: '0-17', min: 0, max: 17 }, { label: '18-19', min: 18, max: 19 },
        { label: '20-29', min: 20, max: 29 }, { label: '30-39', min: 30, max: 39 },
        { label: '40-49', min: 40, max: 49 }, { label: '50-59', min: 50, max: 59 },
        { label: '60-69', min: 60, max: 69 }, { label: '70-79', min: 70, max: 79 },
        { label: '80+', min: 80, max: Infinity },
    ];
    const ageCohortAnalysisData = cohorts.map(cohort => {
        const populationInCohort = allMembers.filter(m => getAge(m.dob) >= cohort.min && getAge(m.dob) <= cohort.max).length;
        const electorsInCohort = voters.filter(v => v.age >= cohort.min && v.age <= cohort.max).length;
        return [
            cohort.label,
            populationInCohort,
            totalPopulation > 0 ? ((populationInCohort / totalPopulation) * 100).toFixed(2) : '0.00',
            electorsInCohort,
            totalElectors > 0 ? ((electorsInCohort / totalElectors) * 100).toFixed(2) : '0.00',
            populationInCohort > 0 ? ((electorsInCohort / populationInCohort) * 100).toFixed(2) : '0.00',
        ];
    });
    autoTable(doc, {
        head: [['Age Cohort', 'Projected Population', '%age to Pop.', 'Electors', '%age to Electors', '% Registered']],
        body: ageCohortAnalysisData,
        startY: 35, theme: 'grid'
    });
    
    // --- Page 4: Prospective Voters (Age 17) ---
    doc.addPage();
    addHeaderAndFooter("List of Prospective Voters (Age 17)");
    const prospectiveVotersData = allMembers
        .filter(m => getAge(m.dob) === 17)
        .map((m, index) => ([
            index + 1, m.name, hofMap.get(m.householdId)?.name || '', m.gender,
            m.dob, m.houseNo, m.phone || hofMap.get(m.householdId)?.phone || '',
        ]));
    autoTable(doc, {
        head: [['S.No', 'Name', 'Parentage', 'Gender', 'DOB', 'House No.', 'Phone']],
        body: prospectiveVotersData,
        startY: 35, theme: 'grid'
    });

    // --- Page 5: Unregistered Voters (Age 18+) ---
    doc.addPage();
    addHeaderAndFooter("List of Unregistered Voters (Age 18+)");
    const linkedMemberIds = new Set(voters.map(v => v.linkedMemberId).filter(Boolean));
    const unregisteredVotersData = allMembers
        .filter(m => getAge(m.dob) >= 18 && !linkedMemberIds.has(m.id))
        .map((m, index) => ([
            index + 1, m.name, hofMap.get(m.householdId)?.name || '', m.gender,
            getAge(m.dob), m.houseNo, m.phone || hofMap.get(m.householdId)?.phone || '',
        ]));
    autoTable(doc, {
        head: [['S.No', 'Name', 'Parentage', 'Gender', 'Age', 'House No.', 'Phone']],
        body: unregisteredVotersData,
        startY: 35, theme: 'grid'
    });

    // --- Sheet 6: Marked Voters ---
    doc.addPage();
    addHeaderAndFooter("List of Marked Voters (Expired/Shifted/Duplicate)");
    const markedVotersData = voters.filter(v => v.status !== 'Active');
    if (markedVotersData.length > 0) {
        autoTable(doc, {
            head: [['S.No', 'EPIC No', 'Name', 'Status', 'House No.']],
            body: markedVotersData.map((v, index) => ([
                index + 1, v.epicNo, v.name, v.status, v.houseNo,
            ])),
            startY: 35, theme: 'grid'
        });
    } else {
        doc.text("No voters have been marked as Expired, Shifted, or Duplicate.", 15, 35);
    }
    
    // --- Final Page: Signatures ---
    doc.addPage();
    addHeaderAndFooter("");
    
    const finalY = pageHeight - 40;
    doc.text("Signature of BLO", 40, finalY);
    doc.text("(with date and seal)", 40, finalY + 5);
    doc.text("Signature of Supervisor", pageWidth - 80, finalY);
    doc.text("(with date and seal)", pageWidth - 80, finalY + 5);
    
    doc.save('BLO_Register_Report.pdf');
};

export const fileService = {
    parseCensusExcel,
    parseVotersExcel,
    exportCensusData,
    exportVoterList,
    downloadJsonBackup,
    exportBloRegister,
};