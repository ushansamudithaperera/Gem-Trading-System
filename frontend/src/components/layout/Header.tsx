import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';
import { MobileNav } from './MobileNav';
import { Bell, LogOut, Menu, Gem } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to={isAuthenticated ? '/marketplace' : '/'} className="flex items-center space-x-2">
          <Gem className="h-6 w-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg p-0.5" />
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">GemTrader</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {isAuthenticated && (
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
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
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
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
              <button className="relative rounded-full p-2 text-slate-300 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* User menu (desktop) */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-sm text-white">
                    {user?.firstName} {user?.lastName?.[0]}.
                  </span>
                  {user?.roles && user.roles.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 backdrop-blur-md">
                      {user.roles[0].charAt(0) + user.roles[0].slice(1).toLowerCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-200 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 shadow-sm"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5 text-rose-300 hover:text-white transition-colors" />
                  Logout
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden rounded-md p-2 text-slate-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <button className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all duration-300">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white font-semibold shadow-lg">Get Started Free</Button>
              </Link>
              {/* Mobile menu button for unauthenticated */}
              <button
                className="md:hidden rounded-md p-2 text-slate-300 hover:text-white transition-colors"
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