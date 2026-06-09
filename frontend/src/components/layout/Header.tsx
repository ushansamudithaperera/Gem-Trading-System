import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';
import { MobileNav } from './MobileNav';
import { Bell, LogOut, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to={isAuthenticated ? '/marketplace' : '/'} className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">💎</span>
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            GemTrade
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {isAuthenticated && (
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
                }`
              }
            >
              Marketplace
            </NavLink>
          )}
          {!isAuthenticated && (
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
                }`
              }
            >
              Marketplace
            </NavLink>
          )}
          {isAuthenticated && (user?.roles.includes('CUTTER') || user?.roles.includes('BUYER')) && (
            <NavLink
              to="/service-hub"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
                }`
              }
            >
              Service Hub
            </NavLink>
          )}
          {isAuthenticated && (
            <>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
                  }`
                }
              >
                Orders
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
                  }`
                }
              >
                Dashboard
              </NavLink>
            </>
          )}
        </nav>

        {/* Right side: User actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Notifications bell */}
              <button className="relative rounded-full p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors cursor-pointer">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>

              {/* User menu (desktop) */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-slate-700">
                    {user?.firstName} {user?.lastName?.[0]}.
                  </span>
                  {user?.roles && user.roles.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {user.roles[0].charAt(0) + user.roles[0].slice(1).toLowerCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5 text-rose-500 transition-colors" />
                  Logout
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden rounded-md p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <button className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-800 hover:bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all duration-300 cursor-pointer">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-md shadow-blue-700/10 rounded-lg">Get Started Free</Button>
              </Link>
              {/* Mobile menu button for unauthenticated */}
              <button
                className="md:hidden rounded-md p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-50 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};