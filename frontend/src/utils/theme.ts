import { useState, useEffect } from 'react';

export type UserRole = 'BUYER' | 'SELLER' | 'CUTTER' | 'ADMIN';

export interface ThemeConfig {
  primary: string;
  bg: string;
  hoverBg: string;
  text: string;
  hoverText: string;
  lightBg: string;
  lightText: string;
  border: string;
  ring: string;
  borderL: string;
}

export const roleThemeMap: Record<UserRole, ThemeConfig> = {
  BUYER: {
    primary: 'blue-600',
    bg: 'bg-blue-600',
    hoverBg: 'hover:bg-blue-700',
    text: 'text-blue-600',
    hoverText: 'hover:text-blue-700',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    border: 'border-blue-200',
    ring: 'ring-blue-600/20 focus:border-blue-600',
    borderL: 'border-l-blue-600',
  },
  SELLER: {
    primary: 'emerald-600',
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    text: 'text-emerald-600',
    hoverText: 'hover:text-emerald-700',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'ring-emerald-600/20 focus:border-emerald-600',
    borderL: 'border-l-emerald-600',
  },
  CUTTER: {
    primary: 'amber-500',
    bg: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-600',
    text: 'text-amber-600',
    hoverText: 'hover:text-amber-700',
    lightBg: 'bg-amber-50',
    lightText: 'text-amber-700',
    border: 'border-amber-200',
    ring: 'ring-amber-500/20 focus:border-amber-500',
    borderL: 'border-l-amber-500',
  },
  ADMIN: {
    primary: 'purple-600',
    bg: 'bg-purple-600',
    hoverBg: 'hover:bg-purple-700',
    text: 'text-purple-600',
    hoverText: 'hover:text-purple-700',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-700',
    border: 'border-purple-200',
    ring: 'ring-purple-600/20 focus:border-purple-600',
    borderL: 'border-l-purple-600',
  },
};

export const useRoleTheme = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('activeSidebarRole') as UserRole) || 'BUYER';
  });

  useEffect(() => {
    const handleRoleChange = () => {
      const newRole = (localStorage.getItem('activeSidebarRole') as UserRole) || 'BUYER';
      setActiveRole(newRole);
    };

    window.addEventListener('activeRoleChanged', handleRoleChange);
    window.addEventListener('storage', handleRoleChange);
    
    return () => {
      window.removeEventListener('activeRoleChanged', handleRoleChange);
      window.removeEventListener('storage', handleRoleChange);
    };
  }, []);

  return {
    role: activeRole,
    theme: roleThemeMap[activeRole] || roleThemeMap.BUYER,
  };
};
