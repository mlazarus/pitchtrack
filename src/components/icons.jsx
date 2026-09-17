import React from 'react';

const base = {
  width: '1em',
  height: '1em',
  display: 'inline-block',
  verticalAlign: 'middle'
};

export const MenuIcon = ({ size = 19 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export const CloseIcon = ({ size = 19 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

export const ChevronDownIcon = ({ size = 14 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronUpIcon = ({ size = 14 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export const StarFilledIcon = ({ size = 12 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.9 6.26 6.9.6-5.2 4.6 1.6 6.78L12 16.9l-6.2 3.34 1.6-6.78-5.2-4.6 6.9-.6z" />
  </svg>
);

export const UsersIcon = ({ size = 15 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15.5 14.2c2.2.4 4 2.4 4.5 5.8" />
  </svg>
);

export const FlagIcon = ({ size = 16 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 21V4" />
    <path d="M5 4h13l-3 4.5L18 13H5" />
  </svg>
);

export const SquareCheckIcon = ({ size = 16 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <polyline points="8.5 12.5 11 15 16 9.5" />
  </svg>
);

export const LogoutIcon = ({ size = 16 }) => (
  <svg style={{ ...base, fontSize: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <polyline points="15 16 20 11 15 6" />
    <line x1="20" y1="11" x2="9" y2="11" />
  </svg>
);
