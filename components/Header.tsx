import React from 'react';
import { useSettings } from '../contexts/AppContexts';
import { LogoIcon } from './Icons';

const Header: React.FC = () => {
    const { settings } = useSettings();
    const constituencyDisplay = `${settings.assemblyConstituency} | Part: ${settings.part}`;
    
    return (
        <header className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-10 border-b border-slate-800">
            <div className="flex items-center space-x-3">
                <LogoIcon className="w-8 h-8 text-primary"/>
                <h1 className="text-2xl font-bold">BLO Pro</h1>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold">{settings.bloName}</p>
                <p className="text-xs text-slate-400">{constituencyDisplay}</p>
            </div>
        </header>
    );
};

export default Header;