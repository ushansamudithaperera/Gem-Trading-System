import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  roles?: string[];
}

// Nav items for authenticated users
const authNavItems: NavItem[] = [
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Orders', href: '/orders' },
  { name: 'Disputes', href: '/disputes' },
  { name: 'Service Hub', href: '/service-hub', roles: ['CUTTER', 'BUYER'] },
];

// Nav items for unauthenticated users
const publicNavItems: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Marketplace', href: '/marketplace' },
];

export const MobileNav: React.FC<MobileNavProps> = ({ open, onClose }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRoles = user?.roles || [];

  const navItems = isAuthenticated ? authNavItems : publicNavItems;

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => userRoles.includes(role));
  });

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.clear();
    localStorage.clear();
    onClose();
    navigate('/login');
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative w-full max-w-xs bg-white shadow-xl flex flex-col border-r border-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
                <button
                  onClick={onClose}
                  className="rounded-md p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {filteredItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-700 rounded-l-none'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>

              {/* Footer: logout or login/register */}
              <div className="border-t p-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <p className="text-sm text-gray-500">
                      Signed in as <span className="font-medium">{user?.email}</span>
                    </p>
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" onClick={onClose} className="block w-full">
                      <Button variant="outline" className="w-full">Login</Button>
                    </NavLink>
                    <NavLink to="/register" onClick={onClose} className="block w-full">
                      <Button className="w-full">Sign Up</Button>
                    </NavLink>
                  </>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};