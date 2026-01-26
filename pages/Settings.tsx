
import React, { useState, useRef, useEffect } from 'react';
import { useSettings, useHouseholds, useElections, useToast } from '../contexts/AppContexts';
import { fileService } from '../services/fileService';
import type { Household, Voter, Settings as SettingsType, Member } from '../types';
import { UserCircleIcon, MapPinIcon, EditIcon, SaveIcon, DownloadIcon, UploadIcon, TrashIcon, PhoneIcon, XIcon, BriefcaseIcon, SunIcon, MoonIcon } from '../components/Icons';

const transformBackupHouseholds = (backupHouseholds: any[]): Household[] => {
    return backupHouseholds.map(h => {
        if (h.headOfFamily && typeof h.headOfFamily === 'object') {
            const newHof: Member = { ...h.headOfFamily, isHof: true };
            const otherMembers: Member[] = Array.isArray(h.members)
                ? h.members
                    .filter((m: any) => m.id !== newHof.id) 
                    .map((m: any) => ({ ...m, isHof: false }))
                : [];

            return {
                id: h.id,
                houseNo: h.houseNumber || h.houseNo,
                address: h.address,
                members: [newHof, ...otherMembers]
            };
        }
        return h as Household; 
    });
};

const ProfileEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: SettingsType;
    onSave: (settings: SettingsType) => void;
}> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => { setLocalSettings(settings) }, [settings, isOpen]);

    if (!isOpen) return null;
    
    const inputClasses = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400";
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 w-11/12 max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Officer Profile</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><XIcon/></button>
                </div>
                <div className="space-y-4">
                     <input type="text" placeholder="BLO Name" value={localSettings.bloName} onChange={e => setLocalSettings(s => ({...s, bloName: e.target.value}))} className={inputClasses} />
                     <input type="text" placeholder="BLO Designation" value={localSettings.bloDesignation} onChange={e => setLocalSettings(s => ({...s, bloDesignation: e.target.value}))} className={inputClasses} />
                     <input type="text" placeholder="BLO Mobile" value={localSettings.bloMobile} onChange={e => setLocalSettings(s => ({...s, bloMobile: e.target.value}))} className={inputClasses} />
                     <input type="text" placeholder="Assembly Constituency" value={localSettings.assemblyConstituency} onChange={e => setLocalSettings(s => ({...s, assemblyConstituency: e.target.value}))} className={inputClasses} />
                     <input type="text" placeholder="Part No. & Name" value={localSettings.part} onChange={e => setLocalSettings(s => ({...s, part: e.target.value}))} className={inputClasses} />
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={() => { onSave(localSettings); onClose(); }} className="w-full py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-sky-600 flex items-center justify-center space-x-2 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <SaveIcon className="w-5 h-5"/>
                        <span>Save Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


const Settings: React.FC = () => {
    const { settings, saveSettings } = useSettings();
    const { households, setHouseholds } = useHouseholds();
    const { voters, setVoters } = useElections();
    const { addToast } = useToast();
    const APP_VERSION = "v2.5.1";
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const restoreFileRef = useRef<HTMLInputElement>(null);
    
    const handleSaveSettings = (newSettings: SettingsType) => {
        saveSettings(newSettings);
        addToast("Profile information saved!", "success");
    };

    const handleThemeToggle = (newTheme: 'light' | 'dark') => {
        saveSettings({ ...settings, theme: newTheme });
    };

    const handleBackup = () => {
        const backupData = { bloInfo: settings, households, voters };
        fileService.downloadJsonBackup(backupData, 'blo_pro_backup');
        addToast("Backup downloaded.", "success");
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputElement = event.target;
        const file = inputElement.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        const cleanup = () => {
            if (inputElement) {
                inputElement.value = '';
            }
        };

        reader.onload = (e) => {
            try {
                const backupContent = e.target?.result as string;
                if (!backupContent) {
                    addToast("Backup file appears to be empty.", "error");
                    return;
                }
                const data = JSON.parse(backupContent);

                if (typeof data !== 'object' || data === null || (!data.households && !data.voters && !data.bloInfo && !data.settings)) {
                    addToast("Invalid backup file. Please select a valid BLO Pro JSON backup.", "error");
                    return;
                }
                
                let restoredCount = { households: 0, voters: 0, settings: false };

                if (data.households && Array.isArray(data.households)) {
                    const transformedHouseholds = transformBackupHouseholds(data.households);
                    setHouseholds(transformedHouseholds);
                    restoredCount.households = transformedHouseholds.length;
                }
                
                if (data.voters && Array.isArray(data.voters)) {
                    setVoters(data.voters);
                    restoredCount.voters = data.voters.length;
                }

                const settingsData = data.bloInfo || data.settings;
                if (settingsData) {
                    saveSettings({ ...settings, ...settingsData });
                    restoredCount.settings = true;
                }

                if (restoredCount.households > 0 || restoredCount.voters > 0 || restoredCount.settings) {
                    addToast(`Restore successful!`, "success");
                } else {
                    addToast("Backup file did not contain any data to restore.", "info");
                }

            } catch (error) {
                addToast("Restore failed. Invalid format.", "error");
                console.error("Restore Error:", error);
            } finally {
                cleanup();
            }
        };

        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (window.confirm("ARE YOU SURE? This will delete everything.")) {
            setHouseholds([]);
            setVoters([]);
            saveSettings({
                bloName: 'BLO Name',
                bloDesignation: '',
                bloAddress: '',
                bloMobile: '',
                assemblyConstituency: 'Constituency',
                part: '',
                syncId: '',
                syncKey: '',
                theme: 'dark',
            });
            addToast("All data cleared.", "success");
        }
    };
    
    const ProfileField: React.FC<{label: string, value?: string, icon: React.ReactNode}> = ({label, value, icon}) => (
        <div className="flex items-start space-x-3">
             <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-primary shrink-0 mt-1 transition-colors">
                {icon}
             </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">{label}</p>
                <p className="text-slate-800 dark:text-white font-semibold transition-colors">{value || 'Not Set'}</p>
            </div>
        </div>
    );

    return (
        <div className="p-4 space-y-4">
            <ProfileEditModal isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} settings={settings} onSave={handleSaveSettings} />
             
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">App Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Personalize your experience and manage data.</p>
            </div>

             <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-4 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Theme Appearance</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Switch between light and dark mode</p>
                    </div>
                     <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full flex items-center transition-colors">
                        <button 
                            onClick={() => handleThemeToggle('light')}
                            className={`p-2 rounded-full transition-all duration-300 ${settings.theme === 'light' ? 'bg-white text-yellow-500 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <SunIcon className="w-5 h-5"/>
                        </button>
                         <button 
                            onClick={() => handleThemeToggle('dark')}
                            className={`p-2 rounded-full transition-all duration-300 ${settings.theme === 'dark' ? 'bg-slate-900 text-primary shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-300'}`}
                        >
                            <MoonIcon className="w-5 h-5"/>
                        </button>
                     </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-4 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Officer Profile</h3>
                    <button onClick={() => setIsEditingProfile(true)} className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-md text-slate-600 dark:text-white transition-all">
                        <EditIcon className="w-3.5 h-3.5" />
                        <span>Edit</span>
                    </button>
                </div>
                <div className="space-y-4">
                    <ProfileField label="Area Detail" value={`${settings.assemblyConstituency} | ${settings.part}`} icon={<MapPinIcon className="w-5 h-5"/>} />
                    <ProfileField label="BLO Name" value={settings.bloName} icon={<UserCircleIcon className="w-5 h-5"/>} />
                    <ProfileField label="Designation" value={settings.bloDesignation} icon={<BriefcaseIcon className="w-5 h-5"/>} />
                    <ProfileField label="Contact Mobile" value={settings.bloMobile} icon={<PhoneIcon className="w-5 h-5"/>} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-4 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Data Management</h3>
                <input type="file" accept=".json" ref={restoreFileRef} className="hidden" onChange={handleRestore}/>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleBackup} className="flex flex-col items-center justify-center space-y-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                        <DownloadIcon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Backup</span>
                    </button>
                    <button onClick={() => restoreFileRef.current?.click()} className="flex flex-col items-center justify-center space-y-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                        <UploadIcon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Restore</span>
                    </button>
                </div>
            </div>

             <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-500/50 p-4 transition-colors">
                 <div className="flex items-center space-x-2 mb-2 border-b border-rose-200 dark:border-rose-300/20 pb-2">
                     <TrashIcon className="w-5 h-5 text-rose-500"/>
                     <h3 className="text-base font-bold text-rose-600 dark:text-rose-200">Danger Zone</h3>
                 </div>
                 <p className="text-[11px] text-rose-600 dark:text-rose-300/80 my-2 font-medium">Irreversible action. Deletes all local records.</p>
                 <button onClick={handleClearData} className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all font-bold shadow-lg shadow-rose-500/20 text-sm">
                    <TrashIcon className="w-4 h-4" />
                    <span>Clear Local Data</span>
                </button>
             </div>

             <div className="text-center py-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">BLO Register Pro {APP_VERSION}</p>
                <p className="text-[9px] text-slate-500 mt-1 font-mono">Developed for Booth Level Officers</p>
             </div>
        </div>
    );
};

export default Settings;
