
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement<{ className?: string }>;
    color?: string;
    onClick?: () => void;
    variant?: 'default' | 'highlight';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'text-primary', onClick, variant = 'default' }) => {
    if (variant === 'highlight') {
        return (
            <div 
                className={`bg-gradient-to-br from-primary to-info p-4 rounded-xl shadow-lg flex flex-col justify-between h-full text-white ${onClick ? 'cursor-pointer hover:brightness-105 active:scale-95 transition-all' : ''}`}
                onClick={onClick}
            >
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">{title}</p>
                <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-black">{value}</p>
                    <div className="bg-white/20 p-2 rounded-full">
                         {React.cloneElement(icon, { className: 'w-6 h-6' })}
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div 
            className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 active:scale-95' : ''}`}
            onClick={onClick}
        >
            <div className={`p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 transition-colors ${color}`}>
                {React.cloneElement(icon, { className: 'w-7 h-7' })}
            </div>
            <div className="min-w-0">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-tight leading-none mb-1 truncate">{title}</p>
                <p className="text-slate-900 dark:text-white text-2xl font-black transition-colors">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
