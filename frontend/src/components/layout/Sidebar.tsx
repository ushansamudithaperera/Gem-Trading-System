import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  LayoutDashboard,
  ShoppingBag,
  Gavel,
  Scissors,
  FileText,
  HelpCircle,
  Settings,
  Gem,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[]; // Restrict to specific roles
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'My Orders', href: '/orders', icon: FileText },
  { name: 'Bids', href: '/bids', icon: Gavel },
  { name: 'Disputes', href: '/disputes', icon: HelpCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const roleBasedItems: NavItem[] = [
  { name: 'Service Hub', href: '/service-hub', icon: Scissors, roles: ['CUTTER', 'BUYER'] },
  { name: 'My Gems', href: '/my-gems', icon: Gem, roles: ['SELLER'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRoles = user?.roles || [];

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => userRoles.includes(role));
  });

  const filteredRoleItems = roleBasedItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => userRoles.includes(role));
  });

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-16 md:left-0 bg-white/60 backdrop-blur-xl border-r border-slate-200/60 text-slate-900 shadow-lg">
      <div className="flex flex-col flex-1 pt-6 pb-6 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-700 font-semibold shadow-md'
                    : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}

          {filteredRoleItems.length > 0 && (
            <>
              <div className="pt-6 mt-6 border-t border-slate-200/60">
                {filteredRoleItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-xl transition-all ${
                        isActive
                          ? 'bg-teal-600/20 text-teal-700 font-semibold shadow-md'
                          : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};