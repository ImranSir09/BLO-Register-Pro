
export interface Member {
  id: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  isHof: boolean;
  aadhar?: string;
  phone?: string;
}

export interface Household {
  id: string;
  houseNo: string;
  address: string;
  members: Member[];
}

export type VoterStatus = 'Active' | 'Expired' | 'Shifted' | 'Duplicate';

export interface Voter {
  id:string;
  epicNo: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  houseNo: string;
  section?: string;
  sectionNumber?: number;
  status: VoterStatus;
  linkedMemberId?: string;
  dob?: string;
  relationType?: string;
  relationName?: string;
  partNo?: number;
  partSerialNo?: number;
}

export type Page = 'Dashboard' | 'Census' | 'Elections' | 'Reports' | 'Settings' | 'AIAssistant';

export interface Settings {
    bloName: string;
    bloDesignation: string;
    bloAddress: string;
    bloMobile: string;
    // FIX: Add missing properties to Settings type
    assemblyConstituency: string;
    part: string;
    syncId: string;
    syncKey: string;
}