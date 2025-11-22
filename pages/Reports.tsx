import React, { useRef } from 'react';
import { useHouseholds, useElections, useToast, useSettings } from '../contexts/AppContexts';
import { fileService } from '../services/fileService';
import type { Household, Voter } from '../types';
import { UploadIcon, DownloadIcon, FileTextIcon } from '../components/Icons';

const Reports: React.FC = () => {
    const { settings } = useSettings();
    const { households, setHouseholds } = useHouseholds();
    const { voters, setVoters } = useElections();
    const { addToast } = useToast();
    const censusFileRef = useRef<HTMLInputElement>(null);
    const voterFileRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
        parser: (data: ArrayBuffer) => any[],
        setData: React.Dispatch<React.SetStateAction<any[]>>,
        dataType: 'Census' | 'Voter'
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = parser(e.target?.result as ArrayBuffer);
                    const mergeOrReplace = window.confirm(`"${dataType} data" detected. Click 'OK' to Merge with existing data, or 'Cancel' to Replace all data.`);

                    if (mergeOrReplace) { // Merge
                        if (dataType === 'Census') {
                            setHouseholds(prev => [...prev, ...data as Household[]]);
                        } else {
                            setVoters(prev => [...prev, ...data as Voter[]]);
                        }
                        addToast(`${dataType} data merged successfully!`, 'success');
                    } else { // Replace
                        setData(data);
                        addToast(`${dataType} data replaced successfully!`, 'success');
                    }
                } catch (error) {
                    addToast(`Error parsing ${dataType} file.`, 'error');
                    console.error(error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleExportRegister = () => {
        try {
            fileService.exportBloRegister(settings, households, voters);
            addToast("BLO Register exported successfully!", "success");
        } catch (error) {
            addToast("Failed to export BLO Register.", "error");
            console.error(error);
        }
    };

    const ReportCard: React.FC<{title: string, description: string, icon: React.ReactNode, onClick: () => void, iconBg: string}> = 
    ({title, description, icon, onClick, iconBg}) => (
        <button onClick={onClick} className="w-full bg-slate-800 p-4 rounded-xl shadow-md flex items-center justify-between text-left hover:bg-slate-700 transition-colors">
            <div>
                <h4 className="font-semibold text-white">{title}</h4>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
            <div className={`p-2 rounded-lg ${iconBg}`}>
                {icon}
            </div>
        </button>
    );

    return (
        <div className="p-4 space-y-6">
            <div className="bg-slate-800 rounded-xl p-4">
                <h2 className="text-2xl font-bold text-white">Data & Reports</h2>
                <p className="text-slate-400 mt-1">Import your census or voter list from an Excel file. You can choose to merge with existing data or replace it entirely.</p>
            </div>

             <div className="bg-slate-800 rounded-xl p-4 space-y-3">
                <input 
                    type="file"
                    accept=".xlsx, .xls"
                    ref={censusFileRef}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, fileService.parseCensusExcel, setHouseholds as React.Dispatch<React.SetStateAction<any[]>>, 'Census')}
                />
                <button onClick={() => censusFileRef.current?.click()} className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors">
                    <UploadIcon />
                    <span>Import Census</span>
                </button>
                <input 
                    type="file"
                    accept=".xlsx, .xls"
                    ref={voterFileRef}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, fileService.parseVotersExcel, setVoters as React.Dispatch<React.SetStateAction<any[]>>, 'Voter')}
                />
                <button onClick={() => voterFileRef.current?.click()} className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-success text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                    <UploadIcon />
                    <span>Import Voters</span>
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 space-y-4">
                <div className="border-b border-slate-700 pb-3">
                    <h3 className="text-lg font-semibold text-white">Generate Reports</h3>
                    <p className="text-sm text-slate-400">Export your data into standardized formats for official use.</p>
                </div>
                <div className="space-y-3">
                    <ReportCard 
                        title="Census Data (Excel)"
                        description="Export all household and member data to an .xlsx file."
                        icon={<DownloadIcon />}
                        onClick={() => fileService.exportCensusData(households)}
                        iconBg="bg-success/20 text-success"
                    />
                     <ReportCard 
                        title="Full BLO Register (PDF)"
                        description="Generate a comprehensive PDF report with statistics."
                        icon={<FileTextIcon />}
                        onClick={handleExportRegister}
                        iconBg="bg-danger/20 text-danger"
                    />
                     <ReportCard 
                        title="Updated Voter List (Excel)"
                        description="Export the current voter list, including status updates."
                        icon={<DownloadIcon />}
                        onClick={() => fileService.exportVoterList(voters)}
                        iconBg="bg-info/20 text-info"
                    />
                </div>
            </div>
        </div>
    );
};

export default Reports;