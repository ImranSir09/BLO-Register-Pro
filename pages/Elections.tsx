
import React, { useState, useMemo } from 'react';
import { useElections, useHouseholds, useToast } from '../contexts/AppContexts';
import type { Voter, Member, VoterStatus } from '../types';
import { SearchIcon, LinkIcon, MoreVerticalIcon, ChevronDownIcon, VoterListIcon, HomeIcon, UsersIcon, AtSymbolIcon, XIcon, AlertTriangleIcon, ArrowRightCircleIcon, CopyIcon, CheckIcon, SparklesIcon } from '../components/Icons';

// --- VoterLinker Modal ---
interface VoterLinkerProps {
  voter: Voter;
  isOpen: boolean;
  onClose: () => void;
}

const VoterLinker: React.FC<VoterLinkerProps> = ({ voter, isOpen, onClose }) => {
    const { households } = useHouseholds();
    const { linkVoterToMember, updateVoter } = useElections();
    const { addToast } = useToast();

    const suggestions = useMemo(() => {
        if (!isOpen) return [];

        const allMembers = households.flatMap(h => h.members.map(m => ({ ...m, houseNo: h.houseNo })));
        const voterNameLower = (voter.name || '').toLowerCase();
        const voterHouseNoLower = (voter.houseNo || '').toLowerCase();
        
        return allMembers
            .map(member => {
                let score = 0;
                const memberHouseNoLower = (member.houseNo || '').toLowerCase();
                const memberNameLower = (member.name || '').toLowerCase();

                if (memberHouseNoLower && voterHouseNoLower && memberHouseNoLower === voterHouseNoLower) score += 5;
                if (memberNameLower && voterNameLower && (memberNameLower.includes(voterNameLower) || voterNameLower.includes(memberNameLower))) score += 3;
                
                const getAge = (dob: string) => dob ? new Date().getFullYear() - new Date(dob).getFullYear() : -100;
                if (Math.abs(getAge(member.dob) - voter.age) <= 2) score += 2;
                
                return { member, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

    }, [voter, households, isOpen]);

    const handleLink = (member: Member & { houseNo: string }) => {
        linkVoterToMember(voter.id, member.id);
        if (window.confirm("Do you want to update voter details from census data?")) {
            const getAge = (dob: string) => new Date().getFullYear() - new Date(dob).getFullYear();
            const updatedVoter: Voter = {
                ...voter,
                name: member.name,
                gender: member.gender,
                age: getAge(member.dob),
                houseNo: member.houseNo,
            };
            updateVoter(updatedVoter);
            addToast("Voter linked and details updated.", "success");
        } else {
            addToast("Voter linked successfully.", "success");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-30 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-11/12 max-w-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Link Voter: {voter.name}</h3>
                <p className="mb-2 text-sm text-slate-300">EPIC: {voter.epicNo}, House: {voter.houseNo}</p>
                <h4 className="font-semibold mt-4 text-white">Suggested Links from Census:</h4>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        suggestions.map(({ member }) => (
                            <div key={member.id} className="p-3 bg-slate-700/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-primary">{member.name}</p>
                                    <p className="text-sm text-slate-300">House: {member.houseNo}, Gender: {member.gender}</p>
                                </div>
                                <button onClick={() => handleLink(member as any)} className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-sky-600 flex items-center space-x-1"><LinkIcon className="w-3 h-3"/><span>Link</span></button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 p-4">No suggestions found.</p>
                    )}
                </div>
                 <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-500 flex items-center space-x-2"><XIcon className="w-4 h-4"/><span>Close</span></button>
                </div>
            </div>
        </div>
    );
};

// --- Voter Card ---
const VoterCard: React.FC<{ voter: Voter }> = ({ voter }) => {
    const { households } = useHouseholds();
    const { updateVoterStatus } = useElections();
    const [isLinkerOpen, setLinkerOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);

    const linkedMemberInfo = useMemo(() => {
        if (!voter.linkedMemberId) return null;
        for (const house of households) {
            const member = house.members.find(m => m.id === voter.linkedMemberId);
            if (member) return { houseNo: house.houseNo, memberName: member.name, status: member.status };
        }
        return null;
    }, [voter, households]);
    
    const handleMark = (status: VoterStatus) => {
        updateVoterStatus(voter.id, status);
        setMenuOpen(false);
    }

    const statusColors: Record<VoterStatus, string> = {
        Active: 'border-success',
        Expired: 'border-danger',
        Shifted: 'border-warning',
        Duplicate: 'border-info',
    }

    return (
        <div className={`bg-slate-700/50 rounded-lg p-3 border-l-4 ${statusColors[voter.status]}`}>
            <div className="flex justify-between items-start">
                <div className="flex-grow space-y-2">
                    <p className="font-bold text-white text-lg">{voter.name}</p>
                    
                    <div className="flex items-center space-x-2 text-sky-300">
                        <AtSymbolIcon className="w-5 h-5" />
                        <p className="font-mono text-base tracking-wider">{voter.epicNo}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300 pt-2">
                        <div className="flex items-center space-x-1.5">
                            <HomeIcon className="w-3.5 h-3.5 text-slate-400"/>
                            <span>H.No: <span className="font-semibold text-white">{voter.houseNo}</span></span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                           <span>Age: <span className="font-semibold text-white">{voter.age}</span></span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <span>{voter.gender}</span>
                        </div>
                        {voter.dob && (
                            <div className="flex items-center space-x-1.5">
                                <span>DOB: {voter.dob}</span>
                            </div>
                        )}
                    </div>
                    
                    {voter.relationName && 
                        <p className="text-slate-400 text-xs pt-1">
                            {voter.relationType || 'Relation'}: {voter.relationName}
                        </p>
                    }
                </div>
                
                <div className="relative flex-shrink-0 ml-2">
                     <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-1 text-slate-400 hover:text-white"><MoreVerticalIcon /></button>
                     {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg z-20 border border-slate-600 py-1">
                            {voter.status === 'Active' && <button onClick={() => setLinkerOpen(true)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 flex items-center space-x-2"><LinkIcon className="w-4 h-4"/><span>Link to Census</span></button>}
                            {voter.status === 'Active' && <div className="border-t border-slate-600 my-1"></div>}
                            <p className="px-4 pt-2 pb-1 text-xs text-slate-400 uppercase tracking-wider font-semibold">Mark as:</p>
                            {voter.status !== 'Expired' && <button onClick={() => handleMark('Expired')} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-slate-600 flex items-center space-x-2"><AlertTriangleIcon className="w-4 h-4"/><span>Expired</span></button>}
                            {voter.status !== 'Shifted' && <button onClick={() => handleMark('Shifted')} className="w-full text-left px-4 py-2 text-sm text-warning hover:bg-slate-600 flex items-center space-x-2"><ArrowRightCircleIcon className="w-4 h-4"/><span>Shifted</span></button>}
                            {voter.status !== 'Duplicate' && <button onClick={() => handleMark('Duplicate')} className="w-full text-left px-4 py-2 text-sm text-info hover:bg-slate-600 flex items-center space-x-2"><CopyIcon className="w-4 h-4"/><span>Duplicate</span></button>}
                            {voter.status !== 'Active' && <button onClick={() => handleMark('Active')} className="w-full text-left px-4 py-2 text-sm text-success hover:bg-slate-600 flex items-center space-x-2"><CheckIcon className="w-4 h-4"/><span>Active</span></button>}
                        </div>
                     )}
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-600/50">
                 <p className="text-xs text-slate-500 font-mono">
                    {voter.partNo ? `Part: ${voter.partNo}` : ''}
                    {(voter.partNo && voter.partSerialNo) ? ' / ' : ''}
                    {voter.partSerialNo ? `S.No: ${voter.partSerialNo}`: ''}
                </p>
                 {linkedMemberInfo && <p className="text-xs text-green-400 font-semibold flex items-center gap-1">
                     <LinkIcon className="w-3 h-3"/>
                     <span>{linkedMemberInfo.memberName}</span>
                 </p>}
            </div>
            <VoterLinker voter={voter} isOpen={isLinkerOpen} onClose={() => setLinkerOpen(false)} />
        </div>
    );
};

// --- Main Elections View ---
const Elections: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { voters, autoLinkVoters } = useElections();
    const [activeFilter, setActiveFilter] = useState<VoterStatus | 'All'>('All');
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const toggleItem = (key: string) => setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));

    const filteredVoters = useMemo(() => {
        return voters.filter(v => {
            const matchesFilter = activeFilter === 'All' || v.status === activeFilter;
            const matchesSearch = !searchTerm ||
                (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (v.epicNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (v.houseNo || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [voters, searchTerm, activeFilter]);
    
    const groupedVoters = useMemo<Record<string, Record<string, Voter[]>>>(() => {
        const groups: Record<string, Record<string, Voter[]>> = {};
        for (const voter of filteredVoters) {
            const sectionKey = voter.section || (voter.sectionNumber ? `Section ${voter.sectionNumber}` : 'Uncategorized');
            const houseKey = voter.houseNo || 'Unassigned House';

            if (!groups[sectionKey]) {
                groups[sectionKey] = {};
            }
            if (!groups[sectionKey][houseKey]) {
                groups[sectionKey][houseKey] = [];
            }
            groups[sectionKey][houseKey].push(voter);
        }

        for (const section in groups) {
            for (const house in groups[section]) {
                groups[section][house].sort((a, b) => (a.partSerialNo || 0) - (b.partSerialNo || 0) || a.name.localeCompare(b.name));
            }
        }
        return groups;
    }, [filteredVoters]);

    const voterCounts = useMemo(() => voters.reduce((acc, v) => {
        acc.All = (acc.All || 0) + 1;
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>), [voters]);

    const FilterPill: React.FC<{label: string, value: VoterStatus | 'All'}> = ({label, value}) => (
        <button 
        onClick={() => setActiveFilter(value)}
        className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${activeFilter === value ? 'bg-primary text-white' : 'bg-slate-700 text-slate-300'}`}
        >
            {label} <span className="text-xs ml-1 bg-black/20 px-1.5 py-0.5 rounded-full">{voterCounts[value] || 0}</span>
        </button>
    );

    return (
        <div className="p-4">
            <div className="bg-slate-800 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="bg-primary/20 text-primary p-3 rounded-lg">
                            <VoterListIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Voter List</h2>
                            <p className="text-slate-400 text-sm">Manage & verify electors.</p>
                        </div>
                    </div>
                    <button 
                        onClick={autoLinkVoters} 
                        className="bg-purple-600/20 text-purple-300 p-2 rounded-lg flex flex-col items-center justify-center text-xs hover:bg-purple-600/30 transition-colors"
                        title="Automatically link voters to census data"
                    >
                        <SparklesIcon className="w-5 h-5 mb-1" />
                        <span>Auto Link</span>
                    </button>
                </div>
            </div>

            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search by Name, EPIC, or H.No..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-700 rounded-lg bg-slate-700 placeholder-slate-400 text-white"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-4 -mx-4 px-4">
                <FilterPill label="All" value="All" />
                <FilterPill label="Active" value="Active" />
                <FilterPill label="Expired" value="Expired" />
                <FilterPill label="Shifted" value="Shifted" />
                <FilterPill label="Duplicate" value="Duplicate" />
            </div>

            {Object.keys(groupedVoters).length > 0 ? (
                <div className="space-y-3">
                    {Object.entries(groupedVoters).sort(([a], [b]) => a.localeCompare(b, undefined, {numeric: true})).map(([section, households]) => {
                         const sectionKey = `section-${section}`;
                         const isSectionExpanded = expandedItems[sectionKey] ?? false;
                         const totalVotersInSection = Object.values(households).reduce((sum, v) => sum + v.length, 0);
                         const totalHouseholdsInSection = Object.keys(households).length;
                         return (
                            <div key={section} className="bg-slate-800 rounded-xl shadow-md overflow-hidden">
                                <button
                                    onClick={() => toggleItem(sectionKey)}
                                    className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-700/50"
                                    aria-expanded={isSectionExpanded}
                                >
                                    <h3 className="font-semibold text-white">{section}</h3>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xs bg-slate-700 px-3 py-1 rounded-full">{totalHouseholdsInSection} Houses / {totalVotersInSection} Voters</span>
                                        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isSectionExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {isSectionExpanded && (
                                    <div className="px-2 pb-2 space-y-2">
                                        {Object.entries(households).sort(([a], [b]) => a.localeCompare(b, undefined, {numeric: true})).map(([houseNo, voterList]) => {
                                            const houseKey = `house-${section}-${houseNo}`;
                                            const isHouseExpanded = expandedItems[houseKey] ?? false;
                                            return (
                                                <div key={houseNo} className="bg-slate-900/50 rounded-lg overflow-hidden">
                                                    <button 
                                                        onClick={() => toggleItem(houseKey)} 
                                                        className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-700/30"
                                                        aria-expanded={isHouseExpanded}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <HomeIcon className="w-4 h-4 text-slate-400" />
                                                            <span className="font-medium text-slate-200">H.No: {houseNo}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full flex items-center space-x-1"><UsersIcon className="w-3 h-3"/><span>{voterList.length}</span></span>
                                                            <ChevronDownIcon className={`w-4 h-4 text-slate-500 transition-transform ${isHouseExpanded ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </button>
                                                    {isHouseExpanded && (
                                                        <div className="p-2 border-t border-slate-700/50 space-y-2">
                                                            {voterList.map(voter => <VoterCard key={voter.id} voter={voter} />)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-center text-slate-400 mt-8 py-8">No voters match the current filter.</p>
            )}
        </div>
    );
};

export default Elections;
