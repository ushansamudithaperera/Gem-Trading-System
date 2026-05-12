import React from 'react';
import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white shadow-md border-t border-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Gem className="h-6 w-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg p-0.5" />
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                GemTrader
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
                <Link to="/about" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  About Us
                </Link>
              </li>
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
