import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <footer className="bg-slate-900 text-white shadow-md border-t border-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col">
            <Link to={isAuthenticated ? '/marketplace' : '/'} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">💎</span>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                GemTrade
              </span>
            </Link>
            <p className="text-sm text-slate-400">
              Premium gem trading platform with secure escrow and cutting services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Marketplace
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link to="/service-hub" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                      Service Hub
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                      My Orders
                    </Link>
                  </li>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <li>
                    <Link to="/login" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                      Create Account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#help" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#security" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#privacy" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800"></div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-400 text-center md:text-left">
            © {currentYear} GemTrader. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#twitter" className="text-slate-400 hover:text-slate-300 transition-colors">
              Twitter
            </a>
            <a href="#linkedin" className="text-slate-400 hover:text-slate-300 transition-colors">
              LinkedIn
            </a>
            <a href="#instagram" className="text-slate-400 hover:text-slate-300 transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
