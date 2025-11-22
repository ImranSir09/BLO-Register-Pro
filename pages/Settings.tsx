
import React, { useState, useRef, useEffect } from 'react';
import { useSettings, useHouseholds, useElections, useToast } from '../contexts/AppContexts';
import { fileService } from '../services/fileService';
import type { Household, Voter, Settings as SettingsType, Member } from '../types';
import { UserCircleIcon, MapPinIcon, EditIcon, SaveIcon, DownloadIcon, UploadIcon, TrashIcon, PhoneIcon, XIcon, BriefcaseIcon, SunIcon, MoonIcon } from '../components/Icons';

const transformBackupHouseholds = (backupHouseholds: any[]): Household[] => {
    return backupHouseholds.map(h => {
        // Handle a legacy format where HOF was a separate object
        if (h.headOfFamily && typeof h.headOfFamily === 'object') {
            const newHof: Member = { ...h.headOfFamily, isHof: true };
            
            // Ensure members is an array and filter out any potential duplicate HOF to prevent data corruption
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
        // This handles the current format
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
    
    const inputClasses = "w-full p-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-slate-400";
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-30 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-11/12 max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Edit Officer Profile</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><XIcon/></button>
                </div>
                <div className="space-y-4">
                     <input type="text" placeholder="BLO Name" value={localSettings.bloName} onChange={e => setLocalSettings(s => ({...s, bloName: e.target.value}))} className={inputClasses} />
                     <input type="text" placeholder="BLO Designation" value={localSettings.bloDesignation} onChange={e => setLocalSettings(s => ({...s, bloDesignation: e.target.value}))} className={inputClasses} />
                     <input type="text" placeholder="BLO Mobile" value={localSettings.bloMobile} onChange={e => setLocalSettings(s => ({...s, bloMobile: e.target.value}))} className={inputClasses} />
                     <input type="text" placeholder="Assembly Constituency" value={localSettings.assemblyConstituency} onChange={e => setLocalSettings(s => ({...s, assemblyConstituency: e.target.value}))} className={inputClasses} />
                     <input type="text" placeholder="Part No. & Name" value={localSettings.part} onChange={e => setLocalSettings(s => ({...s, part: e.target.value}))} className={inputClasses} />
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={() => { onSave(localSettings); onClose(); }} className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-sky-600 flex items-center justify-center space-x-2">
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
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const restoreFileRef = useRef<HTMLInputElement>(null);
    
    const handleSaveSettings = (newSettings: SettingsType) => {
        saveSettings(newSettings);
        addToast("Profile information saved!", "success");
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
                    addToast(`Restore successful: ${restoredCount.households} households, ${restoredCount.voters} voters, and settings loaded.`, "success");
                } else {
                    addToast("Backup file did not contain any data to restore.", "info");
                }

            } catch (error) {
                if (error instanceof SyntaxError) {
                    addToast("Restore failed. The file is not a valid JSON backup file.", "error");
                } else {
                    addToast("An unexpected error occurred during restore.", "error");
                }
                console.error("Restore Error:", error);
            } finally {
                cleanup();
            }
        };

        reader.onerror = () => {
            addToast("Error reading file. Please ensure it is a valid backup file.", "error");
            console.error("FileReader Error:", reader.error);
            cleanup();
        };
        
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (window.confirm("ARE YOU SURE? This will delete all households, voters, and reset your profile settings on this device. This action cannot be undone.")) {
            setHouseholds([]);
            setVoters([]);
            // Reset settings to their default state
            saveSettings({
                bloName: 'BLO Name',
                bloDesignation: '',
                bloAddress: '',
                bloMobile: '',
                assemblyConstituency: 'Constituency',
                part: '',
                syncId: '',
                syncKey: '',
            });
            addToast("All local data has been cleared.", "success");
        }
    };
    
    const ProfileField: React.FC<{label: string, value?: string, icon: React.ReactNode}> = ({label, value, icon}) => (
        <div className="flex items-start space-x-3">
             <div className="bg-slate-700 p-2 rounded-lg text-primary shrink-0 mt-1">
                {icon}
             </div>
            <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-white font-medium">{value || 'Not Set'}</p>
            </div>
        </div>
    );

    return (
        <div className="p-4 space-y-6">
            <ProfileEditModal isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} settings={settings} onSave={handleSaveSettings} />
             <div className="bg-slate-800 rounded-xl p-4">
                <h2 className="text-2xl font-bold text-white">App Settings</h2>
                <p className="text-slate-400 mt-1">Configure your profile, manage app data, and change the theme.</p>
            </div>

             <div className="bg-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-semibold text-white">Appearance</h3>
                <div className="flex justify-between items-center">
                    <p className="text-slate-200">Theme</p>
                     <div className="bg-slate-700 p-1 rounded-full flex items-center">
                        <div className="p-1.5 rounded-full bg-slate-600 text-yellow-400 mr-1">
                            <SunIcon className="w-4 h-4"/>
                        </div>
                         <div className="p-1.5 rounded-full text-slate-400">
                            <MoonIcon className="w-4 h-4"/>
                        </div>
                     </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                    <h3 className="text-lg font-semibold text-white">Officer Profile for Reports</h3>
                    <button onClick={() => setIsEditingProfile(true)} className="flex items-center space-x-2 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-md text-white transition-colors">
                        <EditIcon className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                </div>
                <div className="space-y-4">
                    <ProfileField label="Assembly Constituency & Part" value={`${settings.assemblyConstituency} | ${settings.part}`} icon={<MapPinIcon className="w-5 h-5"/>} />
                    <ProfileField label="BLO Name" value={settings.bloName} icon={<UserCircleIcon className="w-5 h-5"/>} />
                    <ProfileField label="Designation" value={settings.bloDesignation} icon={<BriefcaseIcon className="w-5 h-5"/>} />
                    <ProfileField label="Mobile" value={settings.bloMobile} icon={<PhoneIcon className="w-5 h-5"/>} />
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">Local Data Management</h3>
                <input type="file" accept=".json,application/json" ref={restoreFileRef} className="hidden" onChange={handleRestore}/>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleBackup} className="flex items-center justify-center space-x-2 py-3 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                        <DownloadIcon />
                        <span>Backup Data</span>
                    </button>
                    <button onClick={() => restoreFileRef.current?.click()} className="flex items-center justify-center space-x-2 py-3 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                        <UploadIcon />
                        <span>Restore Data</span>
                    </button>
                </div>
            </div>

             <div className="bg-rose-900/50 rounded-xl border border-rose-500/50 p-4">
                 <div className="flex items-center space-x-2 mb-2 border-b border-rose-300/50 pb-2">
                     <TrashIcon className="w-5 h-5 text-rose-400"/>
                     <h3 className="text-lg font-semibold text-rose-200">Danger Zone</h3>
                 </div>
                 <p className="text-sm text-rose-300 my-3">This action is irreversible and will permanently delete all data stored on this device.</p>
                 <button onClick={handleClearData} className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-danger text-white rounded-lg hover:bg-rose-600 transition-colors">
                    <TrashIcon />
                    <span>Clear All Local Data</span>
                </button>
             </div>
        </div>
    );
};

export default Settings;