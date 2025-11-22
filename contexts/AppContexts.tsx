
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Household, Member, Voter, Settings, VoterStatus } from '../types';

// --- useLocalStorage Hook ---
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// --- Household Context ---
interface HouseholdContextType {
  households: Household[];
  addHousehold: (household: Household) => void;
  updateHousehold: (household: Household) => void;
  deleteHousehold: (id: string) => void;
  addMember: (householdId: string, member: Member) => void;
  updateMember: (householdId: string, member: Member) => void;
  deleteMember: (householdId: string, memberId: string) => void;
  setHouseholds: React.Dispatch<React.SetStateAction<Household[]>>;
}
const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [households, setHouseholds] = useLocalStorage<Household[]>('households', []);

  const addHousehold = (household: Household) => setHouseholds(prev => [...prev, household]);
  const updateHousehold = (updated: Household) => setHouseholds(prev => prev.map(h => h.id === updated.id ? updated : h));
  const deleteHousehold = (id: string) => setHouseholds(prev => prev.filter(h => h.id !== id));
  
  const addMember = (householdId: string, member: Member) => {
    setHouseholds(prev => prev.map(h => h.id === householdId ? { ...h, members: [...h.members, member] } : h));
  };
  const updateMember = (householdId: string, updatedMember: Member) => {
    setHouseholds(prev => prev.map(h => h.id === householdId ? { ...h, members: h.members.map(m => m.id === updatedMember.id ? updatedMember : m) } : h));
  };
  const deleteMember = (householdId: string, memberId: string) => {
    setHouseholds(prev => prev.map(h => h.id === householdId ? { ...h, members: h.members.filter(m => m.id !== memberId) } : h));
  };
  
  return (
    <HouseholdContext.Provider value={{ households, setHouseholds, addHousehold, updateHousehold, deleteHousehold, addMember, updateMember, deleteMember }}>
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHouseholds = () => {
  const context = useContext(HouseholdContext);
  if (!context) throw new Error('useHouseholds must be used within a HouseholdProvider');
  return context;
};

// --- Election Context ---
interface ElectionContextType {
  voters: Voter[];
  setVoters: React.Dispatch<React.SetStateAction<Voter[]>>;
  updateVoter: (voter: Voter) => void;
  updateVoterStatus: (voterId: string, status: VoterStatus) => void;
  linkVoterToMember: (voterId: string, memberId: string) => void;
}
const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const ElectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [voters, setVoters] = useLocalStorage<Voter[]>('voters', []);
  
  const updateVoter = (updated: Voter) => setVoters(prev => prev.map(v => v.id === updated.id ? updated : v));
  const updateVoterStatus = (voterId: string, status: VoterStatus) => {
    setVoters(prev => prev.map(v => v.id === voterId ? { ...v, status } : v));
  };
  const linkVoterToMember = (voterId: string, memberId: string) => {
    setVoters(prev => prev.map(v => v.id === voterId ? { ...v, linkedMemberId: memberId } : v));
  };

  return (
    <ElectionContext.Provider value={{ voters, setVoters, updateVoter, updateVoterStatus, linkVoterToMember }}>
      {children}
    </ElectionContext.Provider>
  );
};

export const useElections = () => {
  const context = useContext(ElectionContext);
  if (!context) throw new Error('useElections must be used within an ElectionProvider');
  return context;
};


// --- Settings Context ---
interface SettingsContextType {
    settings: Settings;
    saveSettings: (settings: Settings) => void;
}
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [settings, setSettings] = useLocalStorage<Settings>('settings', {
        bloName: 'BLO Name',
        bloDesignation: '',
        bloAddress: '',
        bloMobile: '',
        assemblyConstituency: 'Constituency',
        part: '',
        syncId: '',
        syncKey: '',
    });

    const saveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{settings, saveSettings}}>
            {children}
        </SettingsContext.Provider>
    )
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if(!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
}

// --- Toast Context ---
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toasts: Toast[];
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);


export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);
  
  return (
    <ToastContext.Provider value={{ addToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();
  const toastColors = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-info',
  };

  return (
    <div className="absolute bottom-20 right-0 left-0 mx-auto w-11/12 z-50 pointer-events-none flex flex-col items-center gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`${toastColors[toast.type]} text-white p-3 rounded-lg shadow-lg animate-fade-in-out w-full text-center pointer-events-auto`}>
            {toast.message}
          </div>
        ))}
    </div>
  );
};

// --- App Providers Wrapper ---
export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <SettingsProvider>
        <HouseholdProvider>
          <ElectionProvider>
            {children}
          </ElectionProvider>
        </HouseholdProvider>
      </SettingsProvider>
    </ToastProvider>
  );
};
