import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GemLoader } from '../components/common/GemLoader';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Lock, 
  BarChart3, 
  Wallet,
  ArrowRight,
  Check,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import './Landing.css';

export const Landing: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buyers');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <GemLoader message="Unlocking premium gems..." fullScreen />;
  }

  return (
    <div className="landing-page-light">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/95 border-b border-emerald-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">💎</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              GemTrade
            </span>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 overflow-hidden bg-cover bg-center bg-no-repeat min-h-[90vh] flex items-center"
        style={{
          backgroundImage: 'url(/images/1.jpg)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/90"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 border border-emerald-300 rounded-full backdrop-blur-sm">
              <p className="text-sm font-semibold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
                ✨ The Future of Gem Trading Starts Here
              </p>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trade Precious Gems
              </span>
              <br />
              <span className="text-slate-800">With Total Confidence</span>
            </h1>

            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with verified gem traders worldwide. Real-time market prices, secure escrow protection, 
              and instant certification verification. Your trusted marketplace for authentic precious stones.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-lg font-semibold group"
                >
                  Start Trading Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-lg font-semibold"
                >
                  Browse Marketplace
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-emerald-200">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-2">
                  50K+
                </div>
                <p className="text-sm text-slate-600">Premium Gems Listed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
                  25K+
                </div>
                <p className="text-sm text-slate-600">Verified Traders</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mb-2">
                  $2.5B+
                </div>
                <p className="text-sm text-slate-600">Annual Volume</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Why Traders Choose GemTrade
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for professionals who demand transparency, security, and real-time insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Escrow Protection',
                desc: 'Every transaction protected with multi-signature escrow technology',
                color: 'from-emerald-500 to-teal-500'
              },
              {
                icon: Zap,
                title: 'Live Market Prices',
                desc: 'Real-time pricing data updated every minute from global markets',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Lock,
                title: 'Verified Sellers',
                desc: 'All traders verified with certification documentation',
                color: 'from-purple-500 to-indigo-500'
              },
              {
                icon: BarChart3,
                title: 'Market Analytics',
                desc: 'Advanced charts and historical pricing data for informed decisions',
                color: 'from-pink-500 to-rose-500'
              },
              {
                icon: Wallet,
                title: 'Instant Payments',
                desc: 'Fast settlement with multiple payment method options',
                color: 'from-amber-500 to-orange-500'
              },
              {
                icon: TrendingUp,
                title: 'Price Tracking',
                desc: 'Track gem values and receive alerts on price movements',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: Lightbulb,
                title: 'Expert Insights',
                desc: 'Weekly market reports and trading analysis from industry experts',
                color: 'from-yellow-500 to-amber-500'
              },
              {
                icon: MessageSquare,
                title: '24/7 Support',
                desc: 'Dedicated support team available round the clock',
                color: 'from-red-500 to-pink-500'
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Built For Every Role
            </h2>
            <p className="text-lg text-slate-600">
              Whether you buy, sell, or cut gems, we have tailored solutions for your success
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-4 justify-center mb-16">
            {['buyers', 'sellers', 'cutters'].map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`relative px-8 py-4 font-semibold text-base transition-all duration-300 group ${
                  activeTab === role
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <span className="relative z-10">
                  {role === 'buyers' && '🛍️ Buyers'}
                  {role === 'sellers' && '💼 Sellers'}
                  {role === 'cutters' && '✨ Cutters'}
                </span>
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transition-all duration-500 rounded-full ${
                    activeTab === role
                      ? 'from-emerald-600 to-blue-600 w-full'
                      : 'w-0 group-hover:w-full from-emerald-400 to-blue-400'
                  }`}
                ></div>
              </button>
            ))}
          </div>

          {/* Role Content - Split Layout */}
          <div className="max-w-6xl mx-auto">
            {activeTab === 'buyers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
                <div 
                  className="relative h-96 md:h-full min-h-96 rounded-2xl overflow-hidden shadow-xl transform transition-transform duration-500 hover:scale-105 border-4 border-emerald-200"
                  style={{
                    backgroundImage: 'url(/images/2.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <h3 className="text-3xl font-bold text-white mb-2">For Gem Buyers</h3>
                    <p className="text-emerald-100 text-sm font-semibold">Access the finest gems worldwide</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      'Access 50K+ certified gems from trusted sellers worldwide',
                      'Compare prices in real-time across multiple listings',
                      'Get expert grading reports and certification verification',
                      'Secure payment with full buyer protection guarantee',
                      'Receive gems with insurance and tracking'
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-slate-700 pt-0.5 group-hover:text-slate-900 transition-colors font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sellers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
                <div className="space-y-6 md:order-2">
                  <div className="space-y-4">
                    {[
                      'Reach 25K+ verified buyers actively looking for gems',
                      'List unlimited inventory with detailed analytics',
                      'Get paid instantly with low commission rates',
                      'Build your seller reputation with verified reviews',
                      'Access premium marketing tools to boost sales'
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-slate-700 pt-0.5 group-hover:text-slate-900 transition-colors font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div 
                  className="relative h-96 md:h-full min-h-96 rounded-2xl overflow-hidden shadow-xl transform transition-transform duration-500 hover:scale-105 border-4 border-blue-200 md:order-1"
                  style={{
                    backgroundImage: 'url(/images/3.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <h3 className="text-3xl font-bold text-white mb-2">For Gem Sellers</h3>
                    <p className="text-blue-100 text-sm font-semibold">Maximize your gem sales globally</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cutters' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
                <div 
                  className="relative h-96 md:h-full min-h-96 rounded-2xl overflow-hidden shadow-xl transform transition-transform duration-500 hover:scale-105 border-4 border-purple-200"
                  style={{
                    backgroundImage: 'url(/images/4.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <h3 className="text-3xl font-bold text-white mb-2">For Gem Cutters</h3>
                    <p className="text-purple-100 text-sm font-semibold">Showcase your cutting expertise</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      'Get cutting jobs from customers with detailed specifications',
                      'Showcase your cutting work with portfolio features',
                      'Receive payments directly for completed jobs',
                      'Build trusted reputation in the cutting community',
                      'Access advanced scheduling and project management tools'
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-slate-700 pt-0.5 group-hover:text-slate-900 transition-colors font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-y border-emerald-200">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Ready to Trade Smarter?
          </h2>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Join the community of gem traders who trust GemTrade for secure, 
            transparent, and profitable trading.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
              >
                Create Free Account
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="border-emerald-400 text-emerald-700 hover:bg-emerald-50">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">💎</span>
                </div>
                <span className="font-bold text-lg text-white">GemTrade</span>
              </div>
              <p className="text-sm text-slate-400">
                The premier marketplace for authentic precious gem trading with blockchain-verified security.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Browse Gems</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">List Your Gems</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Cutting Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Market Reports</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Pricing Guide</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Learning Hub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 GemTrade. All rights reserved. | Empowering global gem trading</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
