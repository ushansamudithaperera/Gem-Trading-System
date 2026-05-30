import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import {
  LayoutDashboard,
  ShoppingBag,
  Scissors,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
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
  { name: 'Disputes', href: '/disputes', icon: HelpCircle },
];

const roleBasedItems: NavItem[] = [
  { name: 'Service Hub', href: '/service-hub', icon: Scissors, roles: ['CUTTER', 'BUYER'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
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
    <aside 
      className={`hidden md:flex md:flex-col md:fixed md:inset-y-16 md:left-0 bg-white/60 backdrop-blur-xl border-r border-slate-200/60 text-slate-900 shadow-lg transition-all duration-300 z-40 ${
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

      <div className="flex flex-col flex-1 pt-6 pb-6 overflow-y-auto overflow-x-hidden">
        <nav className="flex-1 px-3 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              title={!sidebarOpen ? item.name : undefined}
              className={({ isActive }) =>
                `group flex items-center ${
                  sidebarOpen ? 'px-4 justify-start' : 'px-2 justify-center'
                } py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-700 font-semibold shadow-md'
                    : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                }`
              }
            >
              <item.icon className={`${sidebarOpen ? 'mr-3' : 'mr-0'} h-5 w-5 flex-shrink-0 transition-all duration-200`} />
              {sidebarOpen && <span className="transition-all duration-200 truncate">{item.name}</span>}
            </NavLink>
          ))}

          {filteredRoleItems.length > 0 && (
            <>
              <div className={`pt-6 mt-6 border-t border-slate-200/60`}>
                {filteredRoleItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    title={!sidebarOpen ? item.name : undefined}
                    className={({ isActive }) =>
                      `group flex items-center ${
                        sidebarOpen ? 'px-4 justify-start' : 'px-2 justify-center'
                      } py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-teal-600/20 text-teal-700 font-semibold shadow-md'
                          : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                      }`
                    }
                  >
                    <item.icon className={`${sidebarOpen ? 'mr-3' : 'mr-0'} h-5 w-5 flex-shrink-0 transition-all duration-200`} />
                    {sidebarOpen && <span className="transition-all duration-200 truncate">{item.name}</span>}
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