import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Gem className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">GemTrader</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/marketplace" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Marketplace
          </Link>
          {isAuthenticated && user?.roles.includes('CUTTER') && (
            <Link to="/service-hub" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Service Hub
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
          )}
          <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            About
          </Link>
        </nav>

        {/* Right side: User actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Notifications bell */}
              <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {/* User menu (desktop) */}
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName?.[0]}.
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};