
import React from 'react';
import { useSettings } from '../contexts/AppContexts';
import { LogoIcon } from './Icons';

const Header: React.FC = () => {
    const { settings } = useSettings();
    const constituencyDisplay = `${settings.assemblyConstituency} | Part: ${settings.part}`;
    const APP_VERSION = "v2.5.1";
    
    return (
        <header className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center space-x-3 min-w-0">
                <LogoIcon className="w-8 h-8 text-primary flex-shrink-0"/>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-sm font-bold leading-tight tracking-tight uppercase">BLO Register Pro</h1>
                        <span className="text-[8px] bg-primary/10 text-primary px-1 rounded-sm font-bold border border-primary/20">{APP_VERSION}</span>
                    </div>
                    <div className="flex flex-col mt-0.5">
                        <span className="text-[10px] text-primary font-semibold leading-none">Imran Gani Mugloo</span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-500 font-mono leading-none mt-0.5 tracking-tighter">9149690096</span>
                    </div>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4 border-l border-slate-200 dark:border-slate-800 pl-4">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-100 truncate max-w-[120px]">{settings.bloName}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-400 truncate max-w-[120px] uppercase tracking-tighter">{constituencyDisplay}</p>
            </div>
        </header>
    );
};

export default Header;
