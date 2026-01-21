
import React, { useState, useMemo, useEffect } from 'react';
import { useElections, useHouseholds, useToast } from '../contexts/AppContexts';
import type { Voter, Member, VoterStatus } from '../types';
import { SearchIcon, LinkIcon, MoreVerticalIcon, ChevronDownIcon, VoterListIcon, HomeIcon, UsersIcon, AtSymbolIcon, XIcon, AlertTriangleIcon, ArrowRightCircleIcon, CopyIcon, CheckIcon, SparklesIcon, PlusIcon, ArrowLeftIcon, SaveIcon, EditIcon, TrashIcon } from '../components/Icons';

// --- Voter Entry/Edit Modal ---
interface VoterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (voter: Voter) => void;
    existingVoter?: Voter;
}

const VoterModal: React.FC<VoterModalProps> = ({ isOpen, onClose, onSave, existingVoter }) => {
    const [name, setName] = useState('');
    const [epicNo, setEpicNo] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [age, setAge] = useState('');
    const [houseNo, setHouseNo] = useState('');
    const [relationType, setRelationType] = useState('Father');
    const [relationName, setRelationName] = useState('');
    const [sectionNo, setSectionNo] = useState('');
    const [partSerialNo, setPartSerialNo] = useState('');
    const [status, setStatus] = useState<VoterStatus>('Active');

    const { addToast } = useToast();

    useEffect(() => {
        if (existingVoter) {
            setName(existingVoter.name);
            setEpicNo(existingVoter.epicNo);
            setGender(existingVoter.gender);
            setAge(existingVoter.age.toString());
            setHouseNo(existingVoter.houseNo);
            setRelationType(existingVoter.relationType || 'Father');
            setRelationName(existingVoter.relationName || '');
            setSectionNo(existingVoter.sectionNumber?.toString() || '');
            setPartSerialNo(existingVoter.partSerialNo?.toString() || '');
            setStatus(existingVoter.status);
        } else {
            setName('');
            setEpicNo('');
            setGender('Male');
            setAge('');
            setHouseNo('');
            setRelationType('Father');
            setRelationName('');
            setSectionNo('');
            setPartSerialNo('');
            setStatus('Active');
        }
    }, [existingVoter, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name || !epicNo || !houseNo || !age) {
            addToast("Name, EPIC No, Age and House No are required.", "error");
            return;
        }

        const voterData: Voter = {
            id: existingVoter?.id || `v_${Date.now()}`,
            name,
            epicNo: epicNo.toUpperCase(),
            gender,
            age: parseInt(age),
            houseNo,
            relationType,
            relationName,
            sectionNumber: sectionNo ? parseInt(sectionNo) : undefined,
            partSerialNo: partSerialNo ? parseInt(partSerialNo) : undefined,
            status,
            linkedMemberId: existingVoter?.linkedMemberId
        };

        onSave(voterData);
        onClose();
    };

    const inputClasses = "w-full p-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-slate-400 text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-40 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">{existingVoter ? 'Edit' : 'Add'} Voter</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><XIcon /></button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Full Name *</label>
                            <input type="text" placeholder="Voter Name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">EPIC Number *</label>
                            <input type="text" placeholder="EPIC NO" value={epicNo} onChange={e => setEpicNo(e.target.value)} className={`${inputClasses} font-mono`} />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">House No *</label>
                            <input type="text" placeholder="H.No" value={houseNo} onChange={e => setHouseNo(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Gender</label>
                            <select value={gender} onChange={e => setGender(e.target.value as any)} className={inputClasses}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Age *</label>
                            <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-700 pt-3">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Relation Type</label>
                            <select value={relationType} onChange={e => setRelationType(e.target.value)} className={inputClasses}>
                                <option>Father</option>
                                <option>Mother</option>
                                <option>Husband</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Relation Name</label>
                            <input type="text" placeholder="Name" value={relationName} onChange={e => setRelationName(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Section No</label>
                            <input type="number" placeholder="Section" value={sectionNo} onChange={e => setSectionNo(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Part Sl No</label>
                            <input type="number" placeholder="Serial No" value={partSerialNo} onChange={e => setPartSerialNo(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Voter Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as VoterStatus)} className={`${inputClasses} ${status === 'Active' ? 'text-success' : 'text-danger'}`}>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Shifted">Shifted</option>
                            <option value="Duplicate">Duplicate</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 text-white text-sm">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 flex items-center space-x-2 text-sm font-bold">
                        <SaveIcon className="w-4 h-4"/>
                        <span>{existingVoter ? 'Update' : 'Save'} Voter</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

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
                if (memberHouseNoLower === voterHouseNoLower) score += 5;
                if (memberNameLower.includes(voterNameLower) || voterNameLower.includes(memberNameLower)) score += 3;
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
            updateVoter({ ...voter, name: member.name, gender: member.gender, age: getAge(member.dob), houseNo: member.houseNo, linkedMemberId: member.id });
            addToast("Voter linked and details updated.", "success");
        } else {
            addToast("Voter linked successfully.", "success");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-40 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-white">Link Voter: {voter.name}</h3>
                <p className="mb-2 text-sm text-slate-300">EPIC: {voter.epicNo}, House: {voter.houseNo}</p>
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        suggestions.map(({ member }) => (
                            <div key={member.id} className="p-3 bg-slate-700/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-primary">{member.name}</p>
                                    <p className="text-[10px] text-slate-400">House: {member.houseNo} | Age: {new Date().getFullYear() - new Date(member.dob).getFullYear()}</p>
                                </div>
                                <button onClick={() => handleLink(member as any)} className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30"><LinkIcon className="w-4 h-4"/></button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 p-4">No suggestions found in Census.</p>
                    )}
                </div>
                 <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-700 rounded text-white text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

// --- Voter Card ---
const VoterCard: React.FC<{ voter: Voter, onEdit: (voter: Voter) => void }> = ({ voter, onEdit }) => {
    const { households } = useHouseholds();
    const { updateVoterStatus, setVoters } = useElections();
    const [isLinkerOpen, setLinkerOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const { addToast } = useToast();

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
        addToast(`Voter marked as ${status}`, 'info');
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this voter record?")) {
            setVoters(prev => prev.filter(v => v.id !== voter.id));
            addToast("Voter deleted", "success");
        }
    };

    const statusColors: Record<VoterStatus, string> = {
        Active: 'border-success',
        Expired: 'border-danger',
        Shifted: 'border-warning',
        Duplicate: 'border-info',
    };

    return (
        <div className={`bg-slate-800 rounded-xl p-4 border-l-4 ${statusColors[voter.status]} relative shadow-sm`}>
            {isLinkerOpen && <VoterLinker voter={voter} isOpen={isLinkerOpen} onClose={() => setLinkerOpen(false)} />}
            
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <h3 className="font-bold text-white text-base leading-none">{voter.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 mb-2">
                        <span className="text-[11px] bg-slate-900 text-sky-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider">{voter.epicNo}</span>
                        {voter.status !== 'Active' && <span className="text-[9px] bg-danger/10 text-danger px-1.5 py-0.5 rounded uppercase font-extrabold">{voter.status}</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-400">
                        <p>House: <span className="text-slate-200 font-bold">{voter.houseNo}</span></p>
                        <p>Age: <span className="text-slate-200 font-bold">{voter.age}</span></p>
                        <p>Gender: <span className="text-slate-200 font-bold">{voter.gender}</span></p>
                        {voter.partSerialNo && <p>Sl No: <span className="text-slate-200 font-bold">{voter.partSerialNo}</span></p>}
                    </div>
                    
                    {linkedMemberInfo ? (
                        <div className="mt-3 flex items-center space-x-1.5 bg-emerald-500/5 p-1.5 rounded-lg border border-emerald-500/10">
                            <CheckIcon className="w-3.5 h-3.5 text-success" />
                            <span className="text-[10px] text-success font-medium">Linked: {linkedMemberInfo.memberName} (H.No {linkedMemberInfo.houseNo})</span>
                        </div>
                    ) : (
                        <button onClick={() => setLinkerOpen(true)} className="mt-3 flex items-center space-x-1.5 text-[10px] text-primary hover:text-sky-300 font-bold uppercase tracking-tight">
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Link to Census</span>
                        </button>
                    )}
                </div>
                
                <div className="flex flex-col gap-2">
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-1 text-slate-500 hover:text-white"><MoreVerticalIcon className="w-5 h-5"/></button>
                    {isMenuOpen && (
                        <div className="absolute right-4 top-12 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-30 py-2 w-32 overflow-hidden animate-fade-in">
                            <button onClick={() => { onEdit(voter); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-white hover:bg-slate-700 flex items-center gap-2">
                                <EditIcon className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => handleMark('Expired')} className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-slate-700">Mark Expired</button>
                            <button onClick={() => handleMark('Shifted')} className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-slate-700">Mark Shifted</button>
                            <button onClick={() => handleMark('Active')} className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-slate-700">Mark Active</button>
                            <div className="border-t border-slate-800 my-1"></div>
                            <button onClick={handleDelete} className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-rose-500 hover:text-white flex items-center gap-2">
                                <TrashIcon className="w-3 h-3" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Elections View ---
const Elections: React.FC = () => {
    const { voters, autoLinkVoters, addVoter, updateVoter } = useElections();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<VoterStatus | 'All'>('All');
    const [isVoterModalOpen, setIsVoterModalOpen] = useState(false);
    const [editingVoter, setEditingVoter] = useState<Voter | undefined>(undefined);

    const filteredVoters = useMemo(() => {
        let result = [...voters];
        if (statusFilter !== 'All') result = result.filter(v => v.status === statusFilter);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(v => 
                v.name.toLowerCase().includes(term) || 
                v.epicNo.toLowerCase().includes(term) || 
                v.houseNo.toLowerCase().includes(term)
            );
        }
        return result.sort((a,b) => (a.partSerialNo || 0) - (b.partSerialNo || 0));
    }, [voters, searchTerm, statusFilter]);

    const handleSaveVoter = (voter: Voter) => {
        if (editingVoter) {
            updateVoter(voter);
        } else {
            addVoter(voter);
        }
        setEditingVoter(undefined);
    };

    return (
        <div className="p-4 relative min-h-full flex flex-col">
            <VoterModal 
                isOpen={isVoterModalOpen} 
                onClose={() => { setIsVoterModalOpen(false); setEditingVoter(undefined); }} 
                onSave={handleSaveVoter} 
                existingVoter={editingVoter} 
            />

            <div className="bg-slate-800 p-4 rounded-xl mb-6 flex items-center justify-between shadow-lg border border-slate-700">
                <div className="flex items-center space-x-3">
                    <div className="bg-primary/20 text-primary p-2.5 rounded-lg">
                        <VoterListIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Electoral Roll</h2>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Total: {voters.length} Electors</p>
                    </div>
                </div>
                <button 
                    onClick={autoLinkVoters}
                    className="flex items-center space-x-1.5 py-1.5 px-3 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[11px] font-bold hover:bg-primary/20 transition-all uppercase"
                >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Auto Link</span>
                </button>
            </div>

            <div className="space-y-3 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search name, epic, or house..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border border-slate-700 rounded-xl bg-slate-800 text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {['All', 'Active', 'Expired', 'Shifted', 'Duplicate'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap border transition-all ${statusFilter === status ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow space-y-3 pb-24">
                {filteredVoters.length > 0 ? (
                    filteredVoters.map(voter => (
                        <VoterCard key={voter.id} voter={voter} onEdit={(v) => { setEditingVoter(v); setIsVoterModalOpen(true); }} />
                    ))
                ) : (
                    <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                        <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                             <SearchIcon className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-slate-500 text-sm">No electors found matching criteria.</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-4 md:right-[calc(50%-180px)] z-20 pointer-events-none">
                <button 
                    onClick={() => { setEditingVoter(undefined); setIsVoterModalOpen(true); }}
                    className="pointer-events-auto bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    title="Add Voter Manually"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Elections;
