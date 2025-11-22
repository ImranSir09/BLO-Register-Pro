
import React, { useState, useMemo } from 'react';
import { useHouseholds, useToast } from '../contexts/AppContexts';
import type { Household, Member } from '../types';
import { PlusIcon, ChevronDownIcon, SearchIcon, TrashIcon, EditIcon, UserPlusIcon, ArrowLeftIcon, HomeIcon, UsersIcon, SaveIcon, CheckIcon, XIcon, ChevronRightIcon } from '../components/Icons';

// --- Add/Edit Member Modal ---
interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: Member) => void;
    existingMember?: Member;
    isHof: boolean;
}

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, onSave, existingMember, isHof }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [aadhar, setAadhar] = useState('');
    const [phone, setPhone] = useState('');
    const { addToast } = useToast();

    React.useEffect(() => {
        if (existingMember) {
            setName(existingMember.name);
            setDob(existingMember.dob);
            setGender(existingMember.gender);
            setAadhar(existingMember.aadhar || '');
            setPhone(existingMember.phone || '');
        } else {
            setName('');
            setDob('');
            setGender('Male');
            setAadhar('');
            setPhone('');
        }
    }, [existingMember, isOpen]);

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

        onSave({
            id: existingMember?.id || `m_${Date.now()}`,
            name, dob, gender, isHof,
            aadhar: isHof ? aadhar : undefined,
            phone: isHof ? phone : undefined,
        });
        onClose();
    };
    
    const inputClasses = "w-full p-2 border border-slate-600 rounded bg-slate-700 text-white placeholder-slate-400";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-30 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-11/12 max-w-md">
                <h3 className="text-xl font-bold mb-4 text-white">{existingMember ? 'Edit' : 'Add'} Member</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                    <input type="date" placeholder="Date of Birth" value={dob} onChange={e => setDob(e.target.value)} className={inputClasses} />
                    <select value={gender} onChange={e => setGender(e.target.value as any)} className={inputClasses}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                    {isHof && (
                        <>
                            <input type="number" placeholder="Aadhar Number" value={aadhar} onChange={e => setAadhar(e.target.value)} className={inputClasses} />
                            <input type="number" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className={inputClasses} />
                        </>
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
    const { addToast } = useToast();
    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
    const hof = household.members.find(m => m.isHof);

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

    const handleSaveMember = (member: Member) => {
        if (editingMember) {
            updateMember(household.id, member);
            addToast("Member updated.", "success");
        } else {
            addMember(household.id, member);
            addToast("Member added.", "success");
        }
        setEditingMember(undefined);
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
                        <span>{household.members.length}</span>
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
                                    <p className="font-medium">{member.name} {member.isHof && <span className="text-xs bg-primary/20 text-sky-300 px-2 py-1 rounded-full ml-2">HOF</span>}</p>
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
            />
        </div>
    );
};

// --- Add Household Form ---
const AddHouseholdForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [step, setStep] = useState(1);
    const [householdDetails, setHouseholdDetails] = useState({ houseNo: '', address: '' });
    const [hofDetails, setHofDetails] = useState<Omit<Member, 'id' | 'isHof'>>({ name: '', dob: '', gender: 'Male', aadhar: '', phone: '' });
    const [familyMembers, setFamilyMembers] = useState<Omit<Member, 'id' | 'isHof'>[]>([]);
    const [currentMember, setCurrentMember] = useState<Omit<Member, 'id' | 'isHof'>>({ name: '', dob: '', gender: 'Male' });
    
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
                { ...hofDetails, id: `m_${Date.now()}_hof`, isHof: true },
                ...familyMembers.map((m, i) => ({ ...m, id: `m_${Date.now()}_${i}`, isHof: false }))
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
            h.members.some(m => (m.name || '').toLowerCase().includes(lowercasedFilter) && m.isHof)
        );
    }, [households, searchTerm]);

    if (view === 'add') {
        return <AddHouseholdForm onBack={() => setView('list')} />;
    }

    return (
        <div className="p-4 relative min-h-full">
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
                    placeholder="Search by H.No or Head of Family..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-700 rounded-lg bg-slate-700 placeholder-slate-400 text-white"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            <div>
                {filteredHouseholds.length > 0 ? (
                    filteredHouseholds.map(h => <HouseholdCard key={h.id} household={h} />)
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-400">No households found.</p>
                        <p className="text-slate-500 text-sm mt-2">Click the '+' button to add one.</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => setView('add')}
                className="fixed bottom-24 right-4 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-sky-600 transition-colors"
                aria-label="Add new household"
            >
                <PlusIcon className="w-8 h-8"/>
            </button>
        </div>
    );
};

export default Households;
