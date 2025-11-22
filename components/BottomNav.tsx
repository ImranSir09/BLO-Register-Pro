
import React from 'react';
import type { Page } from '../types';
import { HomeIcon, UsersIcon, VoterListIcon, BarChartIcon, SettingsIcon } from './Icons';

interface BottomNavProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    const activeClasses = 'text-primary scale-105';
    const inactiveClasses = 'text-slate-500 hover:text-slate-400';

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full py-3 ${isActive ? activeClasses : inactiveClasses} transition-all duration-200 active:scale-95`}
        >
            <div className={`${isActive ? 'bg-primary/10 p-1 rounded-xl' : ''} transition-all duration-300`}>
                {icon}
            </div>
            <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
        </button>
    );
};

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
    const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
        { page: 'Dashboard', label: 'Home', icon: <HomeIcon /> },
        { page: 'Census', label: 'Census', icon: <UsersIcon /> },
        { page: 'Elections', label: 'Elections', icon: <VoterListIcon /> },
        { page: 'Reports', label: 'Reports', icon: <BarChartIcon /> },
        { page: 'Settings', label: 'Settings', icon: <SettingsIcon /> },
    ];
    return (
        <nav className="w-full bg-slate-900 border-t border-slate-800 flex justify-around z-30 py-2 shadow-[0_-5px_20px_rgba(0,0,0,0.2)] flex-shrink-0">
            {navItems.map(item => (
                <NavItem
                    key={item.page}
                    label={item.label}
                    icon={item.icon}
                    isActive={activePage === item.page}
                    onClick={() => setActivePage(item.page)}
                />
            ))}
        </nav>
    );
};

export default BottomNav;
