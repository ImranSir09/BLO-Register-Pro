
import React from 'react';

const defaultClassName = "w-6 h-6 flex-shrink-0";

// Generic Icon component type
type IconComponent = React.FC<{ className?: string }>;

// Helper for consistent stroke style
const IconBase: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className || defaultClassName}
    >
        {children}
    </svg>
);

export const HomeIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
    </IconBase>
);

export const BarChartIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <line x1="12" x2="12" y1="20" y2="10"/>
        <line x1="18" x2="18" y1="20" y2="4"/>
        <line x1="6" x2="6" y1="20" y2="16"/>
    </IconBase>
);

export const MaleIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <circle cx="10" cy="10" r="7" />
        <path d="m21 3-6 6" />
        <path d="M21 3h-6" />
        <path d="M21 3v6" />
    </IconBase>
);

export const FemaleIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <circle cx="12" cy="10" r="7" />
        <path d="M12 17v7" />
        <path d="M9 20h6" />
    </IconBase>
);

export const UserXIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="17" x2="22" y1="8" y2="13"/>
        <line x1="22" x2="17" y1="8" y2="13"/>
    </IconBase>
);

export const TrendingUpIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
    </IconBase>
);

export const PieChartIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </IconBase>
);

export const LogoIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
    </IconBase>
);

export const UsersIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </IconBase>
);

export const VoterListIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
        <line x1="10" x2="8" y1="9" y2="9"/>
    </IconBase>
);

export const FileTextIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </IconBase>
);

export const SettingsIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </IconBase>
);

export const PlusIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <line x1="12" x2="12" y1="5" y2="19"/>
        <line x1="5" x2="19" y1="12" y2="12"/>
    </IconBase>
);

export const ChevronDownIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <polyline points="6 9 12 15 18 9"/>
    </IconBase>
);

export const SearchIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" x2="16.65" y1="21" y2="16.65"/>
    </IconBase>
);

export const TrashIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </IconBase>
);

export const EditIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </IconBase>
);

export const UserPlusIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="20" x2="20" y1="8" y2="14"/>
        <line x1="23" x2="17" y1="11" y2="11"/>
    </IconBase>
);

export const ArrowLeftIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <line x1="19" x2="5" y1="12" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
    </IconBase>
);

export const LinkIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </IconBase>
);

export const MoreVerticalIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <circle cx="12" cy="12" r="1"/>
        <circle cx="12" cy="5" r="1"/>
        <circle cx="12" cy="19" r="1"/>
    </IconBase>
);

export const UploadIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" x2="12" y1="3" y2="15"/>
    </IconBase>
);

export const DownloadIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
    </IconBase>
);

export const UserCircleIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="10" r="3"/>
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
    </IconBase>
);

export const MapPinIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </IconBase>
);

export const AtSymbolIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <circle cx="12" cy="12" r="4"/>
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
    </IconBase>
);

export const SaveIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
    </IconBase>
);

export const PhoneIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </IconBase>
);

export const XIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <line x1="18" x2="6" y1="6" y2="18"/>
        <line x1="6" x2="18" y1="6" y2="18"/>
    </IconBase>
);

export const CheckIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <polyline points="20 6 9 17 4 12"/>
    </IconBase>
);

export const BriefcaseIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </IconBase>
);

export const SunIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" x2="12" y1="1" y2="3"/>
        <line x1="12" x2="12" y1="21" y2="23"/>
        <line x1="4.22" x2="5.64" y1="4.22" y2="5.64"/>
        <line x1="18.36" x2="19.78" y1="18.36" y2="19.78"/>
        <line x1="1" x2="3" y1="12" y2="12"/>
        <line x1="21" x2="23" y1="12" y2="12"/>
        <line x1="4.22" x2="5.64" y1="19.78" y2="18.36"/>
        <line x1="18.36" x2="19.78" y1="5.64" y2="4.22"/>
    </IconBase>
);

export const MoonIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </IconBase>
);

export const ChevronRightIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <polyline points="9 18 15 12 9 6"/>
    </IconBase>
);

export const AlertTriangleIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" x2="12" y1="9" y2="13"/>
        <line x1="12" x2="12.01" y1="17" y2="17"/>
    </IconBase>
);

export const ArrowRightCircleIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 16 16 12 12 8"/>
        <line x1="8" x2="16" y1="12" y2="12"/>
    </IconBase>
);

export const CopyIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </IconBase>
);

export const SparklesIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </IconBase>
);

export const SendIcon: IconComponent = ({ className }) => (
    <IconBase className={className}>
        <line x1="22" x2="11" y1="2" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </IconBase>
);
