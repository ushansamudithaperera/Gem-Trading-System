import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { roleThemeMap, UserRole } from '../../utils/theme';
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
  LucideIcon
} from 'lucide-react';

interface SubMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
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
    name: 'KYC Verifications',
    href: '/admin/kyc',
    icon: ShieldCheck,
    roles: ['ADMIN'],
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    roles: ['BUYER'],
  },
  {
    name: 'My Orders',
    href: '/orders',
    icon: FileText,
    roles: ['BUYER', 'SELLER'],
    badgeKey: 'ordersCount',
  },
  {
    name: 'Bids',
    href: '/bids',
    icon: Gavel,
    roles: ['BUYER', 'SELLER'],
  },
  {
    name: 'Service Hub',
    href: '/service-hub',
    icon: Scissors,
    roles: ['BUYER', 'SELLER'],
  },
  {
    name: 'My Cutting Jobs',
    href: '/service-hub/jobs',
    icon: Scissors,
    roles: ['CUTTER'],
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
      { name: 'KYC Verification', href: '/settings/kyc', icon: ShieldCheck, roles: ['BUYER', 'SELLER', 'CUTTER'] },
      { name: 'Security', href: '/settings/security', icon: Lock },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Primary active role is the first defined role in the user's roles array (defaults to 'BUYER' as fallback)
  const activeRole = user?.roles[0] || 'BUYER';
  const activeTheme = roleThemeMap[activeRole as UserRole] || roleThemeMap.BUYER;

  const [settingsExpanded, setSettingsExpanded] = useState(() => {
    return location.pathname.startsWith('/settings');
  });

  // Sync settings expansion if active route changes to a sub-page
  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setSettingsExpanded(true);
    }
  }, [location.pathname]);

  // Keep other dynamic layout components in sync with changes in the active user's role
  useEffect(() => {
    window.dispatchEvent(new Event('activeRoleChanged'));
  }, [activeRole]);

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
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
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
                        ? `${activeTheme.lightBg} ${activeTheme.lightText} font-semibold border-l-4 ${activeTheme.borderL} rounded-l-none`
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
                      {item.subItems
                        .filter(subItem => !subItem.roles || subItem.roles.includes(activeRole))
                        .map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <NavLink
                              key={subItem.name}
                              to={subItem.href}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 ${
                                  isActive
                                    ? `${activeTheme.lightBg} ${activeTheme.lightText} font-semibold`
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

            const displayName = item.href === '/orders'
              ? (activeRole === 'SELLER' ? 'Sales Orders' : 'My Orders')
              : item.name;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                title={!sidebarOpen ? displayName : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center ${
                    sidebarOpen ? 'px-4 justify-start' : 'px-2 justify-center'
                  } py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? `${activeTheme.lightBg} ${activeTheme.lightText} font-semibold border-l-4 ${activeTheme.borderL} rounded-l-none`
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                  }`
                }
              >
                <LinkIcon className={`${sidebarOpen ? 'mr-3' : 'mr-0'} h-5 w-5 flex-shrink-0 transition-all duration-200`} />
                {sidebarOpen && <span className="transition-all duration-200 truncate">{displayName}</span>}
                {renderBadge(item)}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area: Logout */}
        <div className="mt-auto px-3 py-4 border-t border-slate-200/60">
          {sidebarOpen ? (
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 cursor-pointer"
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