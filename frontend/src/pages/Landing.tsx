import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { GemLoader } from '../components/common/GemLoader';
import { FeaturesCarousel } from '../components/landing/FeaturesCarousel';
import { ArrowRight, Check, ShieldCheck, Globe, Award, ShoppingBag, Briefcase, Scissors } from 'lucide-react';
import './Landing.css';

export const Landing: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buyers');

  // Interactive Mouse Parallax Coordinates
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth);
    mouseY.set(clientY / innerHeight);
  };

  const xTrans = useTransform(mouseX, [0, 1], [-20, 20]);
  const yTrans = useTransform(mouseY, [0, 1], [-20, 20]);

  const xSpring = useSpring(xTrans, { stiffness: 120, damping: 25 });
  const ySpring = useSpring(yTrans, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <GemLoader message="Unlocking premium gems..." fullScreen />;
  }

  return (
    <div className="landing-page-ceylon">
      {/* ─────────────── Navigation ─────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">💎</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              GemTrade
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-blue-800 font-medium"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="sm"
                className="bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/20 font-semibold rounded-lg"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────────── Hero Section — Clean Split Layout ─────────────── */}
      <section 
        onMouseMove={handleMouseMove}
        className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-b from-white via-slate-50/50 to-slate-50 overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Typography & CTA */}
            <div className="max-w-xl animate-fadeInUp">
              <div className="heritage-badge mb-8">
                <span className="heritage-dot" />
                Trusted by 25,000+ verified gem traders worldwide
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
                <span className="ceylon-text-shimmer">Trade Precious</span>
                <br />
                <span className="ceylon-text-shimmer">Gems</span>{' '}
                <span className="text-slate-900">With</span>
                <br />
                <span className="text-slate-900">Total Confidence</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-lg animate-fadeInUp-delay-1">
                Connect with verified gem traders worldwide. Real-time market prices, 
                secure escrow protection, and instant certification verification — all 
                on one trusted platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fadeInUp-delay-2">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold group shadow-lg shadow-blue-700/20 rounded-xl px-8 h-12 transition-all"
                  >
                    Start Trading Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 text-base font-semibold rounded-xl px-8 h-12 transition-all"
                  >
                    Browse Marketplace
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-sm text-slate-500 animate-fadeInUp-delay-3">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Escrow Protected
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Global Trading
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  Certified Sellers
                </span>
              </div>
            </div>

            {/* Right: Floating Gemstone */}
            <div className="flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ x: xSpring, y: ySpring }}
                transition={{
                  duration: 1.2,
                  ease: 'easeOut',
                }}
                className="relative"
              >
                <img
                  src="/images/ceylon-sapphire.png"
                  alt="Premium Ceylon Blue Sapphire"
                  className="hero-gem-float w-[320px] md:w-[420px] lg:w-[480px] object-contain"
                />
                {/* Subtle blue glow underneath */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-blue-400/20 rounded-full blur-2xl" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── Trust Bar — Stats ─────────────── */}
      <section className="trust-bar py-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-1">
                50K+
              </div>
              <p className="text-sm font-medium text-slate-500">Premium Gems Listed</p>
            </div>
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-1">
                25K+
              </div>
              <p className="text-sm font-medium text-slate-500">Verified Traders</p>
            </div>
            <div className="stat-card">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1">
                $2.5B+
              </div>
              <p className="text-sm font-medium text-slate-500">Annual Volume</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── Features Carousel ─────────────── */}
      <FeaturesCarousel />

      {/* ─────────────── Built For Every Role ─────────────── */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">For Every Role</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 text-slate-900 tracking-tight">
              Built For Every Role
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Whether you buy, sell, or cut gems — we have tailored solutions for your success
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex justify-center mb-14">
            <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-xl border border-slate-200">
              {[
                { id: 'buyers', label: 'Buyers', icon: ShoppingBag },
                { id: 'sellers', label: 'Sellers', icon: Briefcase },
                { id: 'cutters', label: 'Cutters', icon: Scissors },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={
                      isActive
                        ? 'flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white shadow-md rounded-lg font-medium transition-all duration-200'
                        : 'flex items-center gap-2 px-6 py-2.5 bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg font-medium transition-all duration-200'
                    }
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Content — Split Layout */}
          <div className="max-w-6xl mx-auto">
            {activeTab === 'buyers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center animate-fadeIn">
                {/* Image Card */}
                <div className="role-card-wrapper relative h-96 md:h-full min-h-[420px] cursor-pointer">
                  <div className="role-card-inner relative h-full w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-200">
                    <div
                      className="role-card-bg absolute inset-0 w-full h-full"
                      style={{
                        backgroundImage: 'url(/images/2.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10" />
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <h3 className="text-2xl font-bold text-white mb-1.5">For Gem Buyers</h3>
                      <p className="text-blue-200 text-sm font-medium">Access the finest gems worldwide</p>
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-5">
                  {[
                    'Access 50K+ certified gems from trusted sellers worldwide',
                    'Compare prices in real-time across multiple listings',
                    'Get expert grading reports and certification verification',
                    'Secure payment with full buyer protection guarantee',
                    'Receive gems with insurance and tracking',
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="check-icon-bounce flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-slate-700 pt-0.5 group-hover:text-slate-900 transition-colors font-medium leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                  {/* Heritage Accent */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-400 italic flex items-center gap-2">
                      <span className="inline-block w-5 h-px bg-blue-300" />
                      Bringing the heritage of Ceylon gems to the global digital stage
                      <span className="inline-block w-5 h-px bg-blue-300" />
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sellers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center animate-fadeIn">
                <div className="space-y-5 md:order-2">
                  {[
                    'Reach 25K+ verified buyers actively looking for gems',
                    'List unlimited inventory with detailed analytics',
                    'Get paid instantly with low commission rates',
                    'Build your seller reputation with verified reviews',
                    'Access premium marketing tools to boost sales',
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="check-icon-bounce flex-shrink-0 w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-slate-700 pt-0.5 group-hover:text-slate-900 transition-colors font-medium leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-400 italic flex items-center gap-2">
                      <span className="inline-block w-5 h-px bg-sky-300" />
                      Bringing the heritage of Ceylon gems to the global digital stage
                      <span className="inline-block w-5 h-px bg-sky-300" />
                    </p>
                  </div>
                </div>
                <div className="role-card-wrapper relative h-96 md:h-full min-h-[420px] md:order-1 cursor-pointer">
                  <div className="role-card-inner relative h-full w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-200">
                    <div
                      className="role-card-bg absolute inset-0 w-full h-full"
                      style={{
                        backgroundImage: 'url(/images/3.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10" />
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <h3 className="text-2xl font-bold text-white mb-1.5">For Gem Sellers</h3>
                      <p className="text-sky-200 text-sm font-medium">Maximize your gem sales globally</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cutters' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center animate-fadeIn">
                <div className="role-card-wrapper relative h-96 md:h-full min-h-[420px] cursor-pointer">
                  <div className="role-card-inner relative h-full w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-200">
                    <div
                      className="role-card-bg absolute inset-0 w-full h-full"
                      style={{
                        backgroundImage: 'url(/images/4.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10" />
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <h3 className="text-2xl font-bold text-white mb-1.5">For Gem Cutters</h3>
                      <p className="text-indigo-200 text-sm font-medium">Showcase your cutting expertise</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  {[
                    'Get cutting jobs from customers with detailed specifications',
                    'Showcase your cutting work with portfolio features',
                    'Receive payments directly for completed jobs',
                    'Build trusted reputation in the cutting community',
                    'Access advanced scheduling and project management tools',
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="check-icon-bounce flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-slate-700 pt-0.5 group-hover:text-slate-900 transition-colors font-medium leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-400 italic flex items-center gap-2">
                      <span className="inline-block w-5 h-px bg-indigo-300" />
                      Bringing the heritage of Ceylon gems to the global digital stage
                      <span className="inline-block w-5 h-px bg-indigo-300" />
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────── CTA Section ─────────────── */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Ready to Trade Smarter?
          </h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the community of gem traders who trust GemTrade for secure, 
            transparent, and profitable trading.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button
                className="inline-flex items-center justify-center bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-400 transition-all cursor-pointer"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
              </button>
            </Link>
            <Link to="/marketplace">
              <button
                className="inline-flex items-center justify-center bg-white text-blue-900 px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                Explore Marketplace
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────── Footer ─────────────── */}
      <footer className="bg-slate-900 border-t border-slate-800 py-14 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">💎</span>
                </div>
                <span className="font-bold text-lg text-white tracking-tight">GemTrade</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                The premier marketplace for authentic precious gem trading with verified security and escrow protection.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">Platform</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition">Browse Gems</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">List Your Gems</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Cutting Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">Resources</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition">Market Reports</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Pricing Guide</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Learning Hub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; 2026 GemTrade. All rights reserved.</p>
            <p className="text-xs text-slate-600 italic">
              Bringing the heritage of Ceylon gems to the global digital stage
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
