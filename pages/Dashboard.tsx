
import React, { useMemo, useState } from 'react';
import { useHouseholds, useElections } from '../contexts/AppContexts';
import StatCard from '../components/StatCard';
import { HomeIcon, UsersIcon, MaleIcon, FemaleIcon, UserPlusIcon, UserXIcon, TrendingUpIcon, PieChartIcon, PhoneIcon, XIcon, VoterListIcon } from '../components/Icons';
import DoughnutChart from '../components/DoughnutChart';
import type { Member } from '../types';

type Turning18Member = Member & { houseNo: string, hofName: string };

const getAge = (dob: string) => {
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

// --- Members Turning 18 Modal ---
const Turning18Modal: React.FC<{ members: Turning18Member[], onClose: () => void }> = ({ members, onClose }) => {
    const getPreciseAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        return `${years}y ${months}m ${days}d`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Prospective Voters (17yo)</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><XIcon /></button>
                </div>
                <div className="overflow-y-auto space-y-3 pr-1">
                    {members.length > 0 ? members.map(member => (
                        <div key={member.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center border border-slate-100 dark:border-slate-700">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-primary transition-colors">{member.name}</p>
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-300 transition-colors">House: {member.houseNo} | HOF: {member.hofName}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono transition-colors">Age: {getPreciseAge(member.dob)}</p>
                            </div>
                            {member.phone && (
                                <a href={`tel:${member.phone}`} className="p-2.5 bg-success text-white rounded-full hover:bg-emerald-600 shadow-lg shadow-success/20 transition-all active:scale-90">
                                    <PhoneIcon className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    )) : <p className="text-center text-slate-400 py-12">No members are turning 18 soon.</p>}
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
    const { households } = useHouseholds();
    const { voters } = useElections();
    const [activeTab, setActiveTab] = useState<'census' | 'election'>('census');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const APP_VERSION = "v2.5.1";

    const stats = useMemo(() => {
        const allMembers = households.flatMap(h => h.members);
        const totalPopulation = allMembers.length;
        const maleCount = allMembers.filter(m => m.gender === 'Male').length;
        const femaleCount = allMembers.filter(m => m.gender === 'Female').length;
        
        const prospectiveVoters = households.flatMap(h => {
             const hof = h.members.find(m => m.isHof);
             return h.members
                .filter(m => getAge(m.dob) === 17)
                .map(m => ({ ...m, houseNo: h.houseNo, hofName: hof?.name || 'N/A', phone: m.phone || hof?.phone }));
        });

        const registeredMemberIds = new Set(voters.map(v => v.linkedMemberId).filter(Boolean));
        const unregisteredAdults = allMembers.filter(m => getAge(m.dob) >= 18 && !registeredMemberIds.has(m.id)).length;
        
        const totalElectors = voters.length;
        const maleVoters = voters.filter(v => v.gender === 'Male').length;
        const femaleVoters = voters.filter(v => v.gender === 'Female').length;
        const markedVoters = voters.filter(v => v.status !== 'Active').length;
        const epRatio = totalPopulation > 0 ? Math.round((totalElectors / totalPopulation) * 1000) : 0;
        const genderRatio = maleVoters > 0 ? Math.round((femaleVoters / maleVoters) * 1000) : 0;

        const voterStatusCounts = voters.reduce((acc, voter) => {
            acc[voter.status] = (acc[voter.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const voterChartData = [
            { label: 'Active', value: voterStatusCounts['Active'] || 0, color: 'rgb(16 185 129)' },
            { label: 'Expired', value: voterStatusCounts['Expired'] || 0, color: 'rgb(244 63 94)' },
            { label: 'Shifted', value: voterStatusCounts['Shifted'] || 0, color: 'rgb(245 158 11)' },
            { label: 'Duplicate', value: voterStatusCounts['Duplicate'] || 0, color: 'rgb(6 182 212)' },
        ];

        return {
            totalHouseholds: households.length, totalPopulation, maleCount, femaleCount, prospectiveVoters, unregisteredAdults,
            totalElectors, markedVoters, epRatio, genderRatio, voterChartData
        };
    }, [households, voters]);

    const renderTabs = () => (
      <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex mb-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <button
          onClick={() => setActiveTab('census')}
          className={`w-1/2 py-2.5 rounded-full font-black transition-all text-[11px] uppercase tracking-widest ${activeTab === 'census' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <UsersIcon className="w-4 h-4" />
            <span>Census</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('election')}
          className={`w-1/2 py-2.5 rounded-full font-black transition-all text-[11px] uppercase tracking-widest ${activeTab === 'election' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <VoterListIcon className="w-4 h-4" />
            <span>Election</span>
          </div>
        </button>
      </div>
    );
    
    return (
        <div className="p-4 space-y-4">
            {isModalOpen && <Turning18Modal members={stats.prospectiveVoters} onClose={() => setIsModalOpen(false)} />}
            
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
                    <HomeIcon className="w-5 h-5 text-primary" />
                    Dashboard
                </h2>
                <div className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-mono tracking-tighter transition-colors uppercase">
                    Live Status {APP_VERSION}
                </div>
            </div>

            {renderTabs()}

            {activeTab === 'census' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard title="Total Households" value={stats.totalHouseholds} icon={<HomeIcon />} color="text-info" />
                        <StatCard title="Total Population" value={stats.totalPopulation} icon={<UsersIcon />} color="text-success" />
                        <StatCard title="Male Population" value={stats.maleCount} icon={<MaleIcon />} color="text-primary" />
                        <StatCard title="Female Population" value={stats.femaleCount} icon={<FemaleIcon />} color="text-rose-400" />
                        <StatCard 
                            title="Prospective (17yo)" 
                            value={stats.prospectiveVoters.length} 
                            icon={<UserPlusIcon />} 
                            variant="highlight"
                            onClick={() => setIsModalOpen(true)}
                        />
                        <StatCard 
                            title="Unregistered (18+)" 
                            value={stats.unregisteredAdults} 
                            icon={<UserPlusIcon />} 
                            variant="highlight"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'election' && (
                <div className="space-y-4 animate-fade-in">
                     <div className="grid grid-cols-2 gap-4">
                        <StatCard title="Total Electors" value={stats.totalElectors} icon={<UsersIcon />} color="text-primary" />
                        <StatCard title="Marked Voters" value={stats.markedVoters} icon={<UserXIcon />} color="text-danger" />
                        <StatCard title="EP Ratio" value={stats.epRatio} icon={<TrendingUpIcon />} color="text-warning" />
                        <StatCard title="Gender Ratio" value={stats.genderRatio} icon={<PieChartIcon />} color="text-info" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-100 dark:border-slate-700 transition-colors">
                         <DoughnutChart title="Voter Status Breakdown" data={stats.voterChartData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
