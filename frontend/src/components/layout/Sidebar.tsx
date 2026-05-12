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
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 mt-16 bg-slate-50 border-r border-emerald-200">
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}

          {filteredRoleItems.length > 0 && (
            <>
              <div className="pt-4 mt-4 border-t border-emerald-200">
                {filteredRoleItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700'
                          : 'text-slate-600 hover:bg-emerald-50 hover:text-slate-900'
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