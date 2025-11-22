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
                className={`bg-gradient-to-br from-primary to-info p-4 rounded-xl shadow-lg flex flex-col justify-between h-full text-white ${onClick ? 'cursor-pointer' : ''}`}
                onClick={onClick}
            >
                <p className="font-medium text-white/90">{title}</p>
                <div className="flex justify-between items-end mt-2">
                    <p className="text-3xl font-bold">{value}</p>
                    <div className="bg-white/20 p-2 rounded-full">
                         {React.cloneElement(icon, { className: 'w-6 h-6' })}
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div 
            className={`bg-slate-800 p-4 rounded-xl shadow-lg flex items-center space-x-4 ${onClick ? 'cursor-pointer hover:bg-slate-700' : ''}`}
            onClick={onClick}
        >
            <div className={`p-3 rounded-lg bg-slate-900 ${color}`}>
                {React.cloneElement(icon, { className: 'w-7 h-7' })}
            </div>
            <div>
                <p className="text-slate-300 text-sm">{title}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;