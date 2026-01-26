
import React, { useState, useMemo, useEffect } from 'react';
import { useHouseholds, useToast, useElections } from '../contexts/AppContexts';
import type { Household, Member, MemberStatus, Voter } from '../types';
import { PlusIcon, ChevronDownIcon, SearchIcon, TrashIcon, EditIcon, UserPlusIcon, ArrowLeftIcon, HomeIcon, UsersIcon, SaveIcon, CheckIcon, XIcon, ChevronRightIcon, VoterListIcon } from '../components/Icons';

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
    
    const [isVoterEligible, setIsVoterEligible] = useState(false);
    const [addToVoterList, setAddToVoterList] = useState(false);
    const [epicNo, setEpicNo] = useState('');
    const [sectionNo, setSectionNo] = useState('');

    const { addToast } = useToast();

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
            setAddToVoterList(false);
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

        // Validation for HOF
        if (isHof) {
            if (aadhar && aadhar.length !== 12) {
                addToast("Aadhar Number must be exactly 12 digits.", "error");
                return;
            }
            if (phone && phone.length !== 10) {
                addToast("Phone Number must be exactly 10 digits.", "error");
                return;
            }
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
    
    const inputClasses = "w-full p-2 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-colors";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-40 p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-11/12 max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{existingMember ? 'Edit' : 'Add'} Member</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><XIcon /></button>
                </div>
                
                <div className="space-y-5">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Personal Details</label>
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                        <div className="grid grid-cols-2 gap-3">
                             <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputClasses} />
                             <select value={gender} onChange={e => setGender(e.target.value as any)} className={inputClasses}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    {isHof && (
                        <div className="space-y-3 pt-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">HOF Identification</label>
                            <input 
                                type="text" 
                                inputMode="numeric"
                                placeholder="Aadhar Number (12 digits)" 
                                value={aadhar} 
                                onChange={e => setAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))} 
                                className={inputClasses} 
                            />
                            <input 
                                type="text" 
                                inputMode="tel"
                                placeholder="Phone Number (10 digits)" 
                                value={phone} 
                                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                                className={inputClasses} 
                            />
                        </div>
                    )}

                    {existingMember && (
                         <div className="pt-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Member Status</label>
                             <select value={status} onChange={e => setStatus(e.target.value as any)} className={`${inputClasses} font-bold ${status === 'Active' ? 'text-success' : 'text-danger'}`}>
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                                <option value="Shifted">Shifted</option>
                                <option value="Duplicate">Duplicate</option>
                            </select>
                         </div>
                    )}

                    {!existingMember && isVoterEligible && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 space-y-3">
                            <div className="flex items-center space-x-3">
                                <input 
                                    type="checkbox" 
                                    id="addToVoter" 
                                    checked={addToVoterList} 
                                    onChange={e => setAddToVoterList(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-600 text-primary focus:ring-primary transition-all"
                                />
                                <label htmlFor="addToVoter" className="text-sm text-slate-900 dark:text-white flex items-center gap-2 font-bold uppercase tracking-tight">
                                    <VoterListIcon className="w-4 h-4 text-primary" />
                                    Link to Voter List?
                                </label>
                            </div>
                            
                            {addToVoterList && (
                                <div className="space-y-3 pl-8 animate-fade-in">
                                    <input 
                                        type="text" 
                                        placeholder="EPIC Number" 
                                        value={epicNo} 
                                        onChange={e => setEpicNo(e.target.value.toUpperCase())} 
                                        className={`${inputClasses} font-mono`} 
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Section No" 
                                        value={sectionNo} 
                                        onChange={e => setSectionNo(e.target.value)} 
                                        className={inputClasses} 
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button onClick={onClose} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-sm transition-all">Cancel</button>
                    <button onClick={handleSubmit} className="px-8 py-2.5 bg-primary text-white rounded-lg hover:bg-sky-600 shadow-lg shadow-primary/20 font-bold text-sm flex items-center space-x-2 transition-all active:scale-95">
                        <SaveIcon className="w-4 h-4"/>
                        <span>Save Member</span>
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
        if (window.confirm(`Delete household ${household.houseNo}? This cannot be undone.`)) {
            deleteHousehold(household.id);
            addToast("Household deleted.", "success");
        }
    };

    const handleDeleteMember = (memberId: string, isHof: boolean) => {
        if (isHof) {
            addToast("HOF cannot be deleted. Delete the entire household instead.", "error");
            return;
        }
        if (window.confirm("Remove this member from the household?")) {
            deleteMember(household.id, memberId);
            addToast("Member removed.", "success");
        }
    };

    const handleSaveMember = (member: Member, createVoter?: boolean, voterDetails?: { epicNo: string, sectionNo: string }) => {
        if (editingMember) {
            updateMember(household.id, member);
            addToast("Member updated.", "success");
        } else {
            addMember(household.id, member);
            if (createVoter) {
                const age = member.dob ? new Date().getFullYear() - new Date(member.dob).getFullYear() : 0;
                const newVoter: Voter = {
                    id: `v_${Date.now()}`,
                    epicNo: voterDetails?.epicNo || 'PENDING',
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
                addToast("Voter record created.", "success");
            } else {
                addToast("Member added.", "success");
            }
        }
        setEditingMember(undefined);
    };

    const getStatusStyle = (status: MemberStatus) => {
        switch(status) {
            case 'Expired': return 'text-rose-500 dark:text-rose-400 line-through opacity-70';
            case 'Shifted': return 'text-amber-600 dark:text-amber-400 italic opacity-80';
            case 'Duplicate': return 'text-cyan-600 dark:text-cyan-400 opacity-80';
            default: return 'text-slate-900 dark:text-white';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-3 border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="p-4 flex justify-between items-center cursor-pointer active:bg-slate-50 dark:active:bg-slate-700/50" onClick={() => setIsOpen(!isOpen)}>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded">H.No {household.houseNo}</span>
                        <p className="font-bold text-slate-900 dark:text-white">{hof?.name || 'No HOF Set'}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">{household.address || 'Address not set'}</p>
                </div>
                 <div className="flex items-center space-x-3">
                    <div className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 font-bold">
                        <UsersIcon className="w-3 h-3" />
                        <span>{activeMembersCount} Members</span>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                    <div className="border-t border-slate-50 dark:border-slate-700/50 pt-4 space-y-2">
                        {household.members.map(member => (
                            <div key={member.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className={`text-sm font-bold truncate ${getStatusStyle(member.status || 'Active')}`}>
                                            {member.name} 
                                        </p>
                                        {member.isHof && <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase">HOF</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono mt-0.5">{member.gender} | DOB: {member.dob}</p>
                                </div>
                                <div className="flex space-x-1 shrink-0 ml-2">
                                    <button onClick={() => { setEditingMember(member); setMemberModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-primary transition-colors"><EditIcon className="w-4 h-4"/></button>
                                    {!member.isHof && <button onClick={() => handleDeleteMember(member.id, member.isHof)} className="p-1.5 text-slate-300 hover:text-danger transition-colors"><TrashIcon className="w-4 h-4"/></button>}
                                </div>
                            </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => { setEditingMember(undefined); setMemberModalOpen(true); }} className="flex-grow text-[11px] font-black uppercase tracking-wider py-2.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/20 transition-all active:scale-95">
                                <UserPlusIcon className="w-4 h-4"/>
                                <span>Add Member</span>
                            </button>
                            <button onClick={handleDeleteHousehold} className="px-3 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
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
    
    const inputClasses = "w-full p-2 border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-colors";

    const getAge = (dob: string) => {
        if (!dob) return 0;
        return new Date().getFullYear() - new Date(dob).getFullYear();
    };

    const handleNextStep = () => {
        if (!householdDetails.houseNo || !hofDetails.name || !hofDetails.dob) {
            addToast("House No, HOF Name and HOF DOB are required.", "error");
            return;
        }
        if (households.some(h => h.houseNo.toLowerCase() === householdDetails.houseNo.toLowerCase())) {
            addToast("This House Number already exists.", "error");
            return;
        }
        if (getAge(hofDetails.dob) < 18) {
            addToast("Head of Family must be at least 18 years old.", "error");
            return;
        }
        
        // HOF ID Validation
        if (hofDetails.aadhar && hofDetails.aadhar.length !== 12) {
            addToast("Aadhar Number must be exactly 12 digits.", "error");
            return;
        }
        if (hofDetails.phone && hofDetails.phone.length !== 10) {
            addToast("Phone Number must be exactly 10 digits.", "error");
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
        <div className="p-4 space-y-4">
            <button onClick={onBack} className="flex items-center space-x-2 text-primary font-bold text-sm mb-2"><ArrowLeftIcon className="w-4 h-4"/><span>Cancel Entry</span></button>
            
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-primary text-white' : 'bg-success text-white'}`}>
                    {step === 1 ? '1' : <CheckIcon className="w-5 h-5"/>}
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{step === 1 ? 'Household & HOF' : 'Family Members'}</h3>
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="House No *" value={householdDetails.houseNo} onChange={e => setHouseholdDetails({ ...householdDetails, houseNo: e.target.value })} className={inputClasses} />
                            <input type="text" placeholder="Locality / Area" value={householdDetails.address} onChange={e => setHouseholdDetails({ ...householdDetails, address: e.target.value })} className={inputClasses} />
                        </div>
                        
                        <div className="pt-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Head of Family Details</label>
                            <div className="space-y-3">
                                <input type="text" placeholder="HOF Full Name *" value={hofDetails.name} onChange={e => setHofDetails({ ...hofDetails, name: e.target.value })} className={inputClasses} />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="date" value={hofDetails.dob} onChange={e => setHofDetails({ ...hofDetails, dob: e.target.value })} className={inputClasses} />
                                    <select value={hofDetails.gender} onChange={e => setHofDetails({ ...hofDetails, gender: e.target.value as any })} className={inputClasses}>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        placeholder="Aadhar (12 digits)" 
                                        value={hofDetails.aadhar} 
                                        onChange={e => setHofDetails({ ...hofDetails, aadhar: e.target.value.replace(/\D/g, '').slice(0, 12) })} 
                                        className={inputClasses} 
                                    />
                                    <input 
                                        type="text" 
                                        inputMode="tel"
                                        placeholder="Phone (10 digits)" 
                                        value={hofDetails.phone} 
                                        onChange={e => setHofDetails({ ...hofDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} 
                                        className={inputClasses} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={handleNextStep} className="w-full py-3.5 px-4 bg-primary text-white rounded-xl hover:bg-sky-600 flex items-center justify-center space-x-2 font-black shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest text-xs">
                        <span>Continue to Members</span>
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {step === 2 && (
                 <div className="space-y-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">New Member Entry</label>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name *" value={currentMember.name} onChange={e => setCurrentMember({ ...currentMember, name: e.target.value })} className={inputClasses} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="date" value={currentMember.dob} onChange={e => setCurrentMember({ ...currentMember, dob: e.target.value })} className={inputClasses} />
                                <select value={currentMember.gender} onChange={e => setCurrentMember({ ...currentMember, gender: e.target.value as any })} className={inputClasses}>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <button onClick={handleAddMember} className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center space-x-2 font-bold text-sm transition-all active:scale-95 border border-slate-200 dark:border-slate-600">
                                <PlusIcon className="w-4 h-4"/>
                                <span>Add to List</span>
                            </button>
                        </div>
                    </div>

                    {familyMembers.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                Added Members
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{familyMembers.length}</span>
                            </h4>
                            <div className="space-y-2">
                                {familyMembers.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">{i+1}</div>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                                        </div>
                                        <button onClick={() => setFamilyMembers(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-600 transition-colors">
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                     <div className="flex gap-3 pt-2">
                         <button onClick={() => setStep(1)} className="w-1/3 py-3.5 px-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">Back</button>
                         <button onClick={handleFinish} className="w-2/3 py-3.5 px-4 bg-success text-white rounded-xl hover:bg-emerald-600 flex items-center justify-center space-x-2 font-black shadow-lg shadow-success/20 transition-all active:scale-95 uppercase tracking-widest text-[10px]">
                            <SaveIcon className="w-4 h-4"/>
                            <span>Complete & Save</span>
                         </button>
                     </div>
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
        <div className="p-4 relative min-h-full flex flex-col transition-colors">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-6 flex items-center space-x-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="bg-primary/20 text-primary p-3 rounded-lg">
                    <HomeIcon className="w-7 h-7"/>
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Census Management</h2>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Total: {households.length} Households</p>
                </div>
            </div>

            <div className="relative mb-5 group">
                <input
                    type="text"
                    placeholder="Search H.No or Member Name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3.5 pl-11 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
            </div>

            <div className="flex-grow space-y-3 pb-24">
                {filteredHouseholds.length > 0 ? (
                    filteredHouseholds.map(household => (
                        <HouseholdCard key={household.id} household={household} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                         <div className="bg-white dark:bg-slate-800 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <UsersIcon className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                         </div>
                        <p className="text-slate-500 dark:text-slate-500 font-bold text-sm tracking-tight">No matching census records found.</p>
                        <button onClick={() => setView('add')} className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Add New Household</button>
                    </div>
                )}
            </div>

             <div className="fixed bottom-24 right-4 md:right-[calc(50%-180px)] z-30 pointer-events-none">
                <button 
                    onClick={() => setView('add')}
                    className="pointer-events-auto bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    title="Add Household"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Households;
