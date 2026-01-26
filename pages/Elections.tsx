
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

    const inputClasses = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-colors";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-40 p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{existingVoter ? 'Edit' : 'Add'} Voter</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><XIcon /></button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Full Name *</label>
                            <input type="text" placeholder="Voter Name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">EPIC Number *</label>
                            <input type="text" placeholder="EPIC NO" value={epicNo} onChange={e => setEpicNo(e.target.value)} className={`${inputClasses} font-mono`} />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">House No *</label>
                            <input type="text" placeholder="H.No" value={houseNo} onChange={e => setHouseNo(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Gender</label>
                            <select value={gender} onChange={e => setGender(e.target.value as any)} className={inputClasses}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Age *</label>
                            <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Relation Type</label>
                            <select value={relationType} onChange={e => setRelationType(e.target.value)} className={inputClasses}>
                                <option>Father</option>
                                <option>Mother</option>
                                <option>Husband</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Relation Name</label>
                            <input type="text" placeholder="Name" value={relationName} onChange={e => setRelationName(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Section No</label>
                            <input type="number" placeholder="Section" value={sectionNo} onChange={e => setSectionNo(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Part Sl No</label>
                            <input type="number" placeholder="Serial No" value={partSerialNo} onChange={e => setPartSerialNo(e.target.value)} className={inputClasses} />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1 block">Voter Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as VoterStatus)} className={`${inputClasses} ${status === 'Active' ? 'text-success' : 'text-danger'}`}>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Shifted">Shifted</option>
                            <option value="Duplicate">Duplicate</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-white text-sm font-bold transition-all">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 flex items-center space-x-2 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
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

    const normalize = (val: string) => (val || '').toLowerCase().replace(/(sh\.|smt\.|mr\.|mrs\.|miss|ms\.)/g, '').replace(/\s+/g, '').trim();

    const suggestions = useMemo(() => {
        if (!isOpen) return [];
        
        const allMembers = households.flatMap(h => h.members.map(m => {
            const hof = h.members.find(fam => fam.isHof);
            return { ...m, houseNo: h.houseNo, hofName: hof?.name || '' };
        }));

        const vNameNorm = normalize(voter.name);
        const vHouseNorm = normalize(voter.houseNo);
        const vRelationNorm = normalize(voter.relationName || '');

        return allMembers
            .map(member => {
                let score = 0;
                const mNameNorm = normalize(member.name);
                const mHouseNorm = normalize(member.houseNo);
                const mHofNorm = normalize(member.hofName);

                const getAge = (dob: string) => dob ? new Date().getFullYear() - new Date(dob).getFullYear() : -100;
                const mAge = getAge(member.dob);
                const ageDiff = Math.abs(mAge - voter.age);

                // HOUSE MATCHING (Priority 1)
                if (mHouseNorm === vHouseNorm) score += 40;
                
                // NAME MATCHING (Priority 2)
                if (mNameNorm === vNameNorm) score += 30;
                else if (mNameNorm.includes(vNameNorm) || vNameNorm.includes(mNameNorm)) score += 15;

                // AGE PROXIMITY (Priority 3)
                if (ageDiff === 0) score += 15;
                else if (ageDiff <= 2) score += 10;
                else if (ageDiff <= 5) score += 5;

                // RELATIONSHIP HINT
                if (vRelationNorm && (mHofNorm.includes(vRelationNorm) || vRelationNorm.includes(mHofNorm))) score += 10;

                // GENDER FILTER (Must match)
                if (member.gender.toLowerCase() !== voter.gender.toLowerCase()) score = 0;

                return { member, score };
            })
            .filter(item => item.score > 20)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }, [voter, households, isOpen]);

    const handleLink = (member: any) => {
        linkVoterToMember(voter.id, member.id);
        if (window.confirm("Details Match Found! Do you want to auto-update Voter info from Census records (Name, Gender, Age, House)?")) {
            const getAge = (dob: string) => new Date().getFullYear() - new Date(dob).getFullYear();
            updateVoter({ ...voter, name: member.name, gender: member.gender, age: getAge(member.dob), houseNo: member.houseNo, linkedMemberId: member.id });
            addToast("Voter successfully linked & updated.", "success");
        } else {
            addToast("Voter linked successfully.", "success");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl transition-colors max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Smart Voter Linking</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><XIcon /></button>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Matching Target</p>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{voter.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded">EPIC: {voter.epicNo}</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">H.No: {voter.houseNo}</span>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                    {suggestions.length > 0 ? (
                        suggestions.map(({ member, score }) => (
                            <div key={member.id} className="p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary transition-all group flex items-center justify-between">
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${score > 70 ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                                            {Math.min(score, 100)}% Match
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">H.No {member.houseNo} | Age {new Date().getFullYear() - new Date(member.dob).getFullYear()}</p>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter mt-1">HOF: {member.hofName}</p>
                                </div>
                                <button onClick={() => handleLink(member)} className="ml-3 p-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all active:scale-90">
                                    <LinkIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <AlertTriangleIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No confident matches found in Census data.</p>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white rounded-lg text-xs font-bold transition-all">Close</button>
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
        <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 border-l-4 ${statusColors[voter.status]} relative shadow-sm border border-slate-100 dark:border-slate-800 transition-colors`}>
            {isLinkerOpen && <VoterLinker voter={voter} isOpen={isLinkerOpen} onClose={() => setLinkerOpen(false)} />}
            
            <div className="flex justify-between items-start">
                <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-none truncate">{voter.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 mb-2">
                        <span className="text-[11px] bg-slate-50 dark:bg-slate-900 text-sky-500 px-2 py-0.5 rounded font-mono font-bold tracking-wider border border-slate-100 dark:border-slate-700">{voter.epicNo}</span>
                        {voter.status !== 'Active' && <span className="text-[9px] bg-danger/10 text-danger px-1.5 py-0.5 rounded uppercase font-extrabold">{voter.status}</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <p>House: <span className="text-slate-800 dark:text-slate-200 font-bold">{voter.houseNo}</span></p>
                        <p>Age: <span className="text-slate-800 dark:text-slate-200 font-bold">{voter.age}</span></p>
                        <p>Gender: <span className="text-slate-800 dark:text-slate-200 font-bold">{voter.gender}</span></p>
                        {voter.partSerialNo && <p>Sl No: <span className="text-slate-800 dark:text-slate-200 font-bold">{voter.partSerialNo}</span></p>}
                    </div>
                    
                    {linkedMemberInfo ? (
                        <div className="mt-3 flex items-center space-x-1.5 bg-success/5 dark:bg-success/10 p-1.5 rounded-lg border border-success/10">
                            <CheckIcon className="w-3.5 h-3.5 text-success" />
                            <span className="text-[10px] text-success font-medium truncate">Linked: {linkedMemberInfo.memberName} (H.No {linkedMemberInfo.houseNo})</span>
                        </div>
                    ) : (
                        <button onClick={() => setLinkerOpen(true)} className="mt-3 flex items-center space-x-1.5 text-[10px] text-primary hover:text-sky-600 font-bold uppercase tracking-tight transition-colors">
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Link to Census</span>
                        </button>
                    )}
                </div>
                
                <div className="flex flex-col gap-2 shrink-0 ml-2">
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreVerticalIcon className="w-5 h-5"/></button>
                    {isMenuOpen && (
                        <div className="absolute right-4 top-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-30 py-2 w-32 overflow-hidden animate-fade-in transition-colors">
                            <button onClick={() => { onEdit(voter); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                <EditIcon className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => handleMark('Expired')} className="w-full text-left px-3 py-2 text-xs text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800">Mark Expired</button>
                            <button onClick={() => handleMark('Shifted')} className="w-full text-left px-3 py-2 text-xs text-amber-600 dark:hover:bg-slate-800">Mark Shifted</button>
                            <button onClick={() => handleMark('Active')} className="w-full text-left px-3 py-2 text-xs text-emerald-600 dark:hover:bg-slate-800">Mark Active</button>
                            <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                            <button onClick={handleDelete} className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-rose-500 hover:text-white flex items-center gap-2">
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
        <div className="p-4 relative min-h-full flex flex-col transition-colors">
            <VoterModal 
                isOpen={isVoterModalOpen} 
                onClose={() => { setIsVoterModalOpen(false); setEditingVoter(undefined); }} 
                onSave={handleSaveVoter} 
                existingVoter={editingVoter} 
            />

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-6 flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 text-primary p-2.5 rounded-lg transition-colors">
                        <VoterListIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Electoral Roll</h2>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Total: {voters.length} Electors</p>
                    </div>
                </div>
                <button 
                    onClick={autoLinkVoters}
                    className="flex items-center space-x-1.5 py-1.5 px-3 bg-primary text-white rounded-lg text-[10px] font-black hover:bg-sky-600 transition-all uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95"
                >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Auto Link</span>
                </button>
            </div>

            <div className="space-y-4 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search name, epic, or house..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-11 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors" />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {['All', 'Active', 'Expired', 'Shifted', 'Duplicate'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap border transition-all ${statusFilter === status ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'}`}
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
                    <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                             <SearchIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-500 font-bold text-sm tracking-tight">No electors found matching criteria.</p>
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
