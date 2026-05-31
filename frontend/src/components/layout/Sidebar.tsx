import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import {
  LayoutDashboard,
  ShoppingBag,
  Scissors,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  ClipboardList,
  ShieldAlert,
  Gavel,
  AlertTriangle,
  Wallet,
  Settings,
  User,
  ShieldCheck,
  Lock,
  ChevronDown,
  LogOut,
  Shield,
  TrendingUp,
  LucideIcon
} from 'lucide-react';

interface SubMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavItemConfig {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
  badgeKey?: string;
  subItems?: SubMenuItem[];
}

const navConfig: NavItemConfig[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    name: 'All System Orders',
    href: '/admin/orders',
    icon: ClipboardList,
    roles: ['ADMIN'],
  },
  {
    name: 'Dispute Center',
    href: '/disputes',
    icon: ShieldAlert,
    roles: ['ADMIN'],
    badgeKey: 'disputesCount',
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    roles: ['BUYER', 'SELLER', 'CUTTER'],
  },
  {
    name: 'My Orders',
    href: '/orders',
    icon: FileText,
    roles: ['BUYER', 'SELLER', 'CUTTER'],
    badgeKey: 'ordersCount',
  },
  {
    name: 'Bids',
    href: '/bids',
    icon: Gavel,
    roles: ['BUYER', 'SELLER', 'CUTTER'],
  },
  {
    name: 'Service Hub',
    href: '/service-hub',
    icon: Scissors,
    roles: ['BUYER', 'SELLER', 'CUTTER'],
  },
  {
    name: 'Disputes',
    href: '/disputes',
    icon: AlertTriangle,
    roles: ['BUYER', 'SELLER', 'CUTTER'],
    badgeKey: 'disputesCount',
  },
  {
    name: 'Wallet / Earnings',
    href: '/wallet',
    icon: Wallet,
    roles: ['SELLER', 'CUTTER'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    subItems: [
      { name: 'Profile', href: '/settings/profile', icon: User },
      { name: 'KYC Verification', href: '/settings/kyc', icon: ShieldCheck },
      { name: 'Security', href: '/settings/security', icon: Lock },
    ],
  },
];

const roleMeta: Record<string, { label: string; badgeBg: string; color: string; icon: LucideIcon }> = {
  ADMIN: { label: 'Admin View', badgeBg: 'bg-amber-500/10 text-amber-700 border-amber-500/25', color: 'text-amber-600', icon: Shield },
  BUYER: { label: 'Buyer View', badgeBg: 'bg-sky-500/10 text-sky-700 border-sky-500/25', color: 'text-sky-600', icon: ShoppingBag },
  SELLER: { label: 'Seller View', badgeBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25', color: 'text-emerald-600', icon: TrendingUp },
  CUTTER: { label: 'Cutter View', badgeBg: 'bg-purple-500/10 text-purple-700 border-purple-500/25', color: 'text-purple-600', icon: Scissors },
};

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();

  const userRoles = user?.roles || [];
  // For demonstration & testing, list all standard roles if profile doesn't have multiple roles
  const availableRoles = userRoles.length > 0 ? userRoles : ['BUYER', 'SELLER', 'CUTTER', 'ADMIN'];

  const [activeRole, setActiveRole] = useState<string>(() => {
    return localStorage.getItem('activeSidebarRole') || availableRoles[0] || 'BUYER';
  });

  const [settingsExpanded, setSettingsExpanded] = useState(() => {
    return location.pathname.startsWith('/settings');
  });

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync settings expansion if active route changes to a sub-page
  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setSettingsExpanded(true);
    }
  }, [location.pathname]);

  // Sync active role with user updates
  useEffect(() => {
    if (userRoles.length > 0 && !userRoles.includes(activeRole)) {
      setActiveRole(userRoles[0]);
      localStorage.setItem('activeSidebarRole', userRoles[0]);
      window.dispatchEvent(new Event('activeRoleChanged'));
    }
  }, [userRoles, activeRole]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = (e: React.MouseEvent) => {
    if (!sidebarOpen) {
      e.preventDefault();
      dispatch(toggleSidebar());
      setSettingsExpanded(true);
    } else {
      e.preventDefault();
      setSettingsExpanded(!settingsExpanded);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const filteredNavItems = navConfig.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(activeRole);
  });

  const renderBadge = (item: NavItemConfig) => {
    if (!item.badgeKey) return null;

    let count = 0;
    let colorStyles = '';

    if (item.badgeKey === 'disputesCount') {
      count = 2; // subtle red badge for Disputes
      colorStyles = 'bg-rose-500/15 text-rose-600 border border-rose-500/25 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/35';
    } else if (item.badgeKey === 'ordersCount') {
      count = 1; // subtle blue badge for My Orders
      colorStyles = 'bg-indigo-500/15 text-indigo-600 border border-indigo-500/25 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/35';
    }

    if (count <= 0) return null;

    if (!sidebarOpen) {
      // Collapsed: Pulsing glow indicator dot over the icon
      return (
        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.badgeKey === 'disputesCount' ? 'bg-rose-400' : 'bg-indigo-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${item.badgeKey === 'disputesCount' ? 'bg-rose-500' : 'bg-indigo-500'}`}></span>
        </span>
      );
    }

    return (
      <span className={`ml-auto flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-full scale-95 origin-right ${colorStyles}`}>
        {count}
      </span>
    );
  };

  // Get active role metadata
  const currentRoleMeta = roleMeta[activeRole] || roleMeta.BUYER;
  const ActiveRoleIcon = currentRoleMeta.icon;

  return (
    <aside 
      className={`hidden md:flex md:flex-col md:fixed md:inset-y-16 md:left-0 bg-white border-r border-slate-200 text-slate-800 shadow-sm transition-all duration-300 z-40 ${
        sidebarOpen ? 'md:w-64' : 'md:w-20'
      }`}
    >
      {/* Collapsible Border Toggle Button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3.5 top-8 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/60 bg-white text-slate-600 shadow-md hover:bg-slate-50 transition-all duration-300 hover:scale-110 cursor-pointer"
        title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Main Navigation Links */}
      <div className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto overflow-x-hidden">
        <nav className="flex-1 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isSettings = item.name === 'Settings';
            const LinkIcon = item.icon;

            if (isSettings) {
              return (
                <div key={item.name} className="relative">
                  <button
                    onClick={handleSettingsClick}
                    title={!sidebarOpen ? item.name : undefined}
                    className={`group flex items-center w-full ${
                      sidebarOpen ? 'px-4 justify-start' : 'px-2 justify-center'
                    } py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-200 ${
                      location.pathname.startsWith(item.href)
                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-700 rounded-l-none'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                    }`}
                  >
                    <LinkIcon className={`${sidebarOpen ? 'mr-3' : 'mr-0'} h-5 w-5 flex-shrink-0 transition-all duration-200`} />
                    {sidebarOpen && (
                      <>
                        <span className="transition-all duration-200 truncate">{item.name}</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${settingsExpanded ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>

                  {/* Settings sub-links Accordion */}
                  {settingsExpanded && sidebarOpen && item.subItems && (
                    <div className="pl-9 pr-2 space-y-1 mt-1 border-l border-slate-200/60 ml-6 animate-in slide-in-from-top-2 duration-200">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <NavLink
                            key={subItem.name}
                            to={subItem.href}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 font-semibold'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-855'
                              }`
                            }
                          >
                            <SubIcon className="h-4 w-4 mr-2.5 text-slate-400 flex-shrink-0" />
                            <span>{subItem.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                title={!sidebarOpen ? item.name : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center ${
                    sidebarOpen ? 'px-4 justify-start' : 'px-2 justify-center'
                  } py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-700 rounded-l-none'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                  }`
                }
              >
                <LinkIcon className={`${sidebarOpen ? 'mr-3' : 'mr-0'} h-5 w-5 flex-shrink-0 transition-all duration-200`} />
                {sidebarOpen && <span className="transition-all duration-200 truncate">{item.name}</span>}
                {renderBadge(item)}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area: Switch View & Logout */}
        <div className="mt-auto px-3 pt-4 border-t border-white/40 space-y-2">
          {/* Active View Selector */}
          <div ref={dropdownRef} className="relative">
            {sidebarOpen ? (
              // Expanded Role Switcher
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                  Active View
                </p>
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm transition-all duration-200 cursor-pointer ${
                    roleDropdownOpen ? 'ring-2 ring-blue-600/20 border-blue-600/40' : ''
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    <ActiveRoleIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${currentRoleMeta.color}`} />
                    <span className="truncate">{currentRoleMeta.label}</span>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            ) : (
              // Collapsed Role Switcher (Compact Circle Badge with Popover)
              <div className="flex justify-center">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  title={`Switch Perspective (${currentRoleMeta.label})`}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-200 cursor-pointer ${
                    roleDropdownOpen ? 'ring-2 ring-blue-600/20 border-blue-600/40' : ''
                  }`}
                >
                  <ActiveRoleIcon className={`h-4 w-4 ${currentRoleMeta.color}`} />
                </button>
              </div>
            )}

            {/* Dropdown Floating Options list */}
            {roleDropdownOpen && (
              <div 
                className={`absolute z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-200 ${
                  sidebarOpen 
                    ? 'bottom-full left-0 right-0 mb-2 slide-in-from-bottom-2' 
                    : 'left-16 bottom-0 w-48 slide-in-from-left-2'
                }`}
              >
                {!sidebarOpen && (
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    Switch Perspective
                  </div>
                )}
                <div className="py-1">
                  {availableRoles.map((role) => {
                    const meta = roleMeta[role] || roleMeta.BUYER;
                    const RoleIcon = meta.icon;
                    const isActive = role === activeRole;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setActiveRole(role);
                          localStorage.setItem('activeSidebarRole', role);
                          setRoleDropdownOpen(false);
                          window.dispatchEvent(new Event('activeRoleChanged'));
                        }}
                        className={`w-full flex items-center px-3 py-2.5 text-xs text-left transition-all duration-150 cursor-pointer ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-700' 
                            : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 border-l-2 border-transparent'
                        }`}
                      >
                        <RoleIcon className={`h-4 w-4 mr-2.5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                        <span className="truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          {sidebarOpen ? (
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-200 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
              <span className="truncate">Logout</span>
            </button>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                title="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 cursor-pointer"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};