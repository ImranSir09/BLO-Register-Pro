
import React, { useState, useMemo, useEffect } from 'react';
import { useHouseholds, useToast, useElections } from '../contexts/AppContexts';
import type { Household, Member, MemberStatus, Voter } from '../types';
import { PlusIcon, ChevronDownIcon, SearchIcon, TrashIcon, EditIcon, UserPlusIcon, ArrowLeftIcon, HomeIcon, UsersIcon, SaveIcon, CheckIcon, XIcon, ChevronRightIcon, AlertTriangleIcon, VoterListIcon } from '../components/Icons';

// --- Add/Edit Member Modal ---
interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: Member, createVoter?: boolean, voterDetails?: { epicNo: string, sectionNo: string }) => void;
    existingMember?: Member;
    isHof: boolean;
    houseNo: string;
}

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, onSave, existingMember, isHof, houseNo }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [aadhar, setAadhar] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<MemberStatus>('Active');
    
    // Election related state
    const [isVoterEligible, setIsVoterEligible] = useState(false);
    const [addToVoterList, setAddToVoterList] = useState(false);
    const [epicNo, setEpicNo] = useState('');
    const [sectionNo, setSectionNo] = useState('');

    const { addToast } = useToast();

    // Helper to calc age
    const calculateAge = (dateString: string) => {
        if (!dateString) return 0;
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        if (existingMember) {
            setName(existingMember.name);
            setDob(existingMember.dob);
            setGender(existingMember.gender);
            setAadhar(existingMember.aadhar || '');
            setPhone(existingMember.phone || '');
            setStatus(existingMember.status || 'Active');
            setAddToVoterList(false); // Reset for edit mode
        } else {
            setName('');
            setDob('');
            setGender('Male');
            setAadhar('');
            setPhone('');
            setStatus('Active');
            setAddToVoterList(false);
            setEpicNo('');
            setSectionNo('');
        }
    }, [existingMember, isOpen]);

    // Check age eligibility when DOB changes
    useEffect(() => {
        const age = calculateAge(dob);
        setIsVoterEligible(age >= 18);
        if (age < 18) setAddToVoterList(false);
    }, [dob]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name || !dob) {
            addToast("Name and Date of Birth are required.", "error");
            return;
        }
        if (isHof && (aadhar.length > 0 && aadhar.length !== 12) || (phone.length > 0 && phone.length !== 10)) {
            addToast("Aadhar must be 12 digits and Phone must be 10 digits.", "error");
            return;
        }

        const memberData: Member = {
            id: existingMember?.id || `m_${Date.now()}`,
            name, dob, gender, isHof,
            aadhar: isHof ? aadhar : undefined,
            phone: isHof ? phone : undefined,
            status: status
        };

        onSave(memberData, addToVoterList, { epicNo, sectionNo });
        onClose();
    };
    
    const inputClasses = "w-full p-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-slate-400";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-30 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-11/12 max-w-md max-h-[85vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-white">{existingMember ? 'Edit' : 'Add'} Member</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400">Personal Details</label>
                        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                        <input type="date" placeholder="Date of Birth" value={dob} onChange={e => setDob(e.target.value)} className={inputClasses} />
                        <select value={gender} onChange={e => setGender(e.target.value as any)} className={inputClasses}>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>

                    {existingMember && (
                         <select value={status} onChange={e => setStatus(e.target.value as any)} className={inputClasses}>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Shifted">Shifted</option>
                            <option value="Duplicate">Duplicate</option>
                        </select>
                    )}
                    {isHof && (
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">HOF Details</label>
                            <input type="number" placeholder="Aadhar Number" value={aadhar} onChange={e => setAadhar(e.target.value)} className={inputClasses} />
                            <input type="number" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className={inputClasses} />
                        </div>
                    )}

                    {!existingMember && isVoterEligible && (
                        <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 space-y-3">
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="addToVoter" 
                                    checked={addToVoterList} 
                                    onChange={e => setAddToVoterList(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-primary focus:ring-primary"
                                />
                                <label htmlFor="addToVoter" className="text-sm text-white flex items-center gap-1 font-medium">
                                    <VoterListIcon className="w-4 h-4 text-primary" />
                                    Include in Election List?
                                </label>
                            </div>
                            
                            {addToVoterList && (
                                <div className="space-y-2 pl-6 animate-fade-in">
                                    <input 
                                        type="text" 
                                        placeholder="EPIC No (Optional)" 
                                        value={epicNo} 
                                        onChange={e => setEpicNo(e.target.value.toUpperCase())} 
                                        className={`${inputClasses} text-sm`} 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Section No (Optional)" 
                                        value={sectionNo} 
                                        onChange={e => setSectionNo(e.target.value)} 
                                        className={`${inputClasses} text-sm`} 
                                    />
                                    <p className="text-[10px] text-slate-400">EPIC No. can be updated later if unavailable.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-500 flex items-center space-x-2 text-white">
                        <XIcon className="w-4 h-4"/>
                        <span>Cancel</span>
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded hover:bg-sky-600 flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4"/>
                        <span>Save</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Household Card ---
const HouseholdCard: React.FC<{ household: Household }> = ({ household }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { deleteHousehold, deleteMember, updateMember, addMember } = useHouseholds();
    const { addVoter } = useElections();
    const { addToast } = useToast();
    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
    const hof = household.members.find(m => m.isHof);
    const activeMembersCount = household.members.filter(m => m.status === 'Active' || !m.status).length;

    const handleDeleteHousehold = () => {
        if (window.confirm(`Are you sure you want to delete household ${household.houseNo}?`)) {
            deleteHousehold(household.id);
            addToast("Household deleted.", "success");
        }
    };

    const handleDeleteMember = (memberId: string, isHof: boolean) => {
        if (isHof) {
            addToast("Head of Family cannot be deleted.", "error");
            return;
        }
        if (window.confirm("Are you sure you want to delete this member?")) {
            deleteMember(household.id, memberId);
            addToast("Member deleted.", "success");
        }
    };

    const handleSaveMember = (member: Member, createVoter?: boolean, voterDetails?: { epicNo: string, sectionNo: string }) => {
        if (editingMember) {
            updateMember(household.id, member);
            addToast("Member updated.", "success");
        } else {
            addMember(household.id, member);
            
            // Check if we need to add to voter list
            if (createVoter) {
                const age = member.dob ? new Date().getFullYear() - new Date(member.dob).getFullYear() : 0;
                
                const newVoter: Voter = {
                    id: `v_${Date.now()}`,
                    epicNo: voterDetails?.epicNo || 'N/A', // Placeholder if empty
                    name: member.name,
                    gender: member.gender,
                    age: age,
                    houseNo: household.houseNo,
                    status: 'Active',
                    linkedMemberId: member.id,
                    dob: member.dob,
                    sectionNumber: voterDetails?.sectionNo ? parseInt(voterDetails.sectionNo) : undefined,
                };
                addVoter(newVoter);
                addToast("Member added & linked to Voter List!", "success");
            } else {
                addToast("Member added.", "success");
            }
        }
        setEditingMember(undefined);
    };

    const getStatusStyle = (status: MemberStatus) => {
        switch(status) {
            case 'Expired': return 'text-rose-400 line-through decoration-rose-500 decoration-2 opacity-70';
            case 'Shifted': return 'text-amber-400 italic opacity-80';
            case 'Duplicate': return 'text-cyan-400 opacity-80';
            default: return 'text-white';
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-md mb-3">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div>
                    <p className="font-bold text-lg text-white">H.No: {household.houseNo}</p>
                    <p className="text-sm text-slate-300">{hof?.name || 'N/A'}</p>
                </div>
                 <div className="flex items-center space-x-4">
                    <div className="bg-slate-700 text-xs px-3 py-1 rounded-full flex items-center space-x-1.5">
                        <UsersIcon className="w-4 h-4" />
                        <span>{activeMembersCount}</span>
                    </div>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="p-4 border-t border-slate-700">
                    <ul className="space-y-2">
                        {household.members.map(member => (
                            <li key={member.id} className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className={`font-medium ${getStatusStyle(member.status || 'Active')}`}>
                                            {member.name} 
                                        </p>
                                        {member.isHof && <span className="text-xs bg-primary/20 text-sky-300 px-2 py-0.5 rounded-full">HOF</span>}
                                        {member.status && member.status !== 'Active' && <span className="text-xs bg-black/30 text-slate-400 px-2 py-0.5 rounded border border-slate-600">{member.status}</span>}
                                    </div>
                                    <p className="text-sm text-slate-400">{member.gender}, DOB: {member.dob}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => { setEditingMember(member); setMemberModalOpen(true); }} className="text-slate-400 hover:text-white"><EditIcon /></button>
                                    {!member.isHof && <button onClick={() => handleDeleteMember(member.id, member.isHof)} className="text-slate-400 hover:text-danger"><TrashIcon /></button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="flex space-x-2 mt-4">
                        <button onClick={() => { setEditingMember(undefined); setMemberModalOpen(true); }} className="w-full text-sm py-2 px-4 bg-primary/20 text-primary rounded flex items-center justify-center space-x-2 hover:bg-primary/30"><UserPlusIcon /><span>Add Member</span></button>
                    </div>
                </div>
            )}
             <MemberModal 
                isOpen={memberModalOpen} 
                onClose={() => setMemberModalOpen(false)} 
                onSave={handleSaveMember}
                existingMember={editingMember}
                isHof={!!editingMember?.isHof}
                houseNo={household.houseNo}
            />
        </div>
    );
};

// --- Add Household Form ---
const AddHouseholdForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [step, setStep] = useState(1);
    const [householdDetails, setHouseholdDetails] = useState({ houseNo: '', address: '' });
    const [hofDetails, setHofDetails] = useState<Omit<Member, 'id' | 'isHof' | 'status'>>({ name: '', dob: '', gender: 'Male', aadhar: '', phone: '' });
    const [familyMembers, setFamilyMembers] = useState<Omit<Member, 'id' | 'isHof' | 'status'>[]>([]);
    const [currentMember, setCurrentMember] = useState<Omit<Member, 'id' | 'isHof' | 'status'>>({ name: '', dob: '', gender: 'Male' });
    
    const { addHousehold, households } = useHouseholds();
    const { addToast } = useToast();
    
    const inputClasses = "w-full p-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-slate-400";

    const getAge = (dob: string) => {
        if (!dob) return 0;
        return new Date().getFullYear() - new Date(dob).getFullYear();
    };

    const handleNextStep = () => {
        if (!householdDetails.houseNo || !hofDetails.name || !hofDetails.dob) {
            addToast("House No, HOF Name and HOF DOB are required.", "error");
            return;
        }
        if (households.some(h => h.houseNo === householdDetails.houseNo)) {
            addToast("This House Number already exists.", "error");
            return;
        }
        if (getAge(hofDetails.dob) < 18) {
            addToast("Head of Family must be at least 18 years old.", "error");
            return;
        }
        if ((hofDetails.aadhar && hofDetails.aadhar.length !== 12) || (hofDetails.phone && hofDetails.phone.length !== 10)) {
            addToast("Aadhar must be 12 digits and Phone must be 10 digits.", "error");
            return;
        }
        setStep(2);
    };

    const handleAddMember = () => {
        if (!currentMember.name || !currentMember.dob) {
            addToast("Member Name and DOB are required.", "error");
            return;
        }
        setFamilyMembers(prev => [...prev, currentMember]);
        setCurrentMember({ name: '', dob: '', gender: 'Male' });
    };

    const handleFinish = () => {
        const newHousehold: Household = {
            id: `h_${Date.now()}`,
            houseNo: householdDetails.houseNo,
            address: householdDetails.address,
            members: [
                { ...hofDetails, id: `m_${Date.now()}_hof`, isHof: true, status: 'Active' },
                ...familyMembers.map((m, i) => ({ ...m, id: `m_${Date.now()}_${i}`, isHof: false, status: 'Active' as MemberStatus }))
            ]
        };
        addHousehold(newHousehold);
        addToast("Household added successfully!", "success");
        onBack();
    };

    return (
        <div className="p-4">
            <button onClick={onBack} className="flex items-center space-x-2 text-primary mb-4"><ArrowLeftIcon /><span>Back to List</span></button>
            {step === 1 && (
                <div className="space-y-4 bg-slate-800 rounded-xl shadow-lg p-4">
                    <h3 className="text-xl font-bold text-white">Step 1: Household & HOF Details</h3>
                    <input type="text" placeholder="House No *" value={householdDetails.houseNo} onChange={e => setHouseholdDetails({ ...householdDetails, houseNo: e.target.value })} className={inputClasses} />
                    <input type="text" placeholder="Address" value={householdDetails.address} onChange={e => setHouseholdDetails({ ...householdDetails, address: e.target.value })} className={inputClasses} />
                    <h4 className="font-semibold pt-4 text-white">Head of Family Details</h4>
                    <input type="text" placeholder="HOF Name *" value={hofDetails.name} onChange={e => setHofDetails({ ...hofDetails, name: e.target.value })} className={inputClasses} />
                    <input type="date" placeholder="HOF DOB *" value={hofDetails.dob} onChange={e => setHofDetails({ ...hofDetails, dob: e.target.value })} className={inputClasses} />
                    <select value={hofDetails.gender} onChange={e => setHofDetails({ ...hofDetails, gender: e.target.value as any })} className={inputClasses}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                    <input type="number" placeholder="Aadhar (12 digits)" value={hofDetails.aadhar} onChange={e => setHofDetails({ ...hofDetails, aadhar: e.target.value })} className={inputClasses} />
                    <input type="number" placeholder="Phone (10 digits)" value={hofDetails.phone} onChange={e => setHofDetails({ ...hofDetails, phone: e.target.value })} className={inputClasses} />
                    <button onClick={handleNextStep} className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-sky-600 flex items-center justify-center space-x-2">
                        <span>Next: Add Members</span>
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            {step === 2 && (
                 <div className="space-y-4 bg-slate-800 rounded-xl shadow-lg p-4">
                    <h3 className="text-xl font-bold text-white">Step 2: Add Family Members</h3>
                    <div className="p-3 border border-slate-700 rounded-lg space-y-3">
                        <input type="text" placeholder="Member Name *" value={currentMember.name} onChange={e => setCurrentMember({ ...currentMember, name: e.target.value })} className={inputClasses} />
                        <input type="date" placeholder="Member DOB *" value={currentMember.dob} onChange={e => setCurrentMember({ ...currentMember, dob: e.target.value })} className={inputClasses} />
                        <select value={currentMember.gender} onChange={e => setCurrentMember({ ...currentMember, gender: e.target.value as any })} className={inputClasses}>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                        <button onClick={handleAddMember} className="w-full py-2 px-4 bg-slate-600 text-white rounded hover:bg-slate-500 flex items-center justify-center space-x-2"><PlusIcon className="w-4 h-4"/><span>Add This Member</span></button>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Added Members ({familyMembers.length})</h4>
                        <ul className="list-disc list-inside pl-2 mt-2 text-slate-300">
                            {familyMembers.map((m, i) => <li key={i}>{m.name}</li>)}
                        </ul>
                    </div>
                     <button onClick={handleFinish} className="w-full py-2 px-4 bg-success text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center space-x-2"><SaveIcon className="w-5 h-5"/><span>Finish & Save Household</span></button>
                 </div>
            )}
        </div>
    );
};

// --- Main Households View ---
const Households: React.FC = () => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const { households } = useHouseholds();
    
    const filteredHouseholds = useMemo(() => {
        const sorted = [...households].sort((a,b) => a.houseNo.localeCompare(b.houseNo, undefined, { numeric: true }));
        if (!searchTerm) return sorted;
        const lowercasedFilter = searchTerm.toLowerCase();
        return sorted.filter(h =>
            (h.houseNo || '').toLowerCase().includes(lowercasedFilter) ||
            h.members.some(m => (m.name || '').toLowerCase().includes(lowercasedFilter))
        );
    }, [households, searchTerm]);

    if (view === 'add') {
        return <AddHouseholdForm onBack={() => setView('list')} />;
    }

    return (
        <div className="p-4 relative min-h-full flex flex-col">
            <div className="bg-slate-800 p-4 rounded-xl mb-6 flex items-center space-x-4">
                <div className="bg-primary/20 text-primary p-3 rounded-lg">
                    <HomeIcon className="w-8 h-8"/>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Census Management</h2>
                    <p className="text-slate-400 text-sm">Manage all households in your area.</p>
                </div>
            </div>

            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search by H.No or Member Name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-700 rounded-lg bg-slate-700 placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            <div className="flex-grow space-y-4 pb-20">
                {filteredHouseholds.length > 0 ? (
                    filteredHouseholds.map(household => (
                        <HouseholdCard key={household.id} household={household} />
                    ))
                ) : (
                    <div className="text-center py-12">
                         <div className="bg-slate-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <SearchIcon className="w-8 h-8 text-slate-500" />
                         </div>
                        <p className="text-slate-500">No households found.</p>
                    </div>
                )}
            </div>

             <div className="sticky bottom-6 flex justify-end px-2 z-20 pointer-events-none">
                <button 
                    onClick={() => setView('add')}
                    className="pointer-events-auto bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 hover:bg-sky-600 transition-all active:scale-95"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Households;
