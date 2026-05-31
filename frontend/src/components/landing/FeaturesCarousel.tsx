import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Lock,
  BarChart3,
  Wallet,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: string;
  iconBg: string;
}

const features: Feature[] = [
  {
    icon: Shield,
    title: 'Escrow Protection',
    description: 'Every transaction protected with multi-signature escrow technology ensuring completely safe trading.',
    accentColor: 'text-blue-700',
    iconBg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Live Market Prices',
    description: 'Real-time pricing data updated every minute from global markets directly to your dashboard.',
    accentColor: 'text-sky-700',
    iconBg: 'bg-sky-50',
  },
  {
    icon: Lock,
    title: 'Verified Sellers',
    description: 'All platform traders are rigorously verified with strict KYC and certification documentation.',
    accentColor: 'text-indigo-700',
    iconBg: 'bg-indigo-50',
  },
  {
    icon: BarChart3,
    title: 'Market Analytics',
    description: 'Advanced charting and historical pricing data for informed, data-driven buying and selling decisions.',
    accentColor: 'text-violet-700',
    iconBg: 'bg-violet-50',
  },
  {
    icon: Wallet,
    title: 'Instant Payments',
    description: 'Lightning-fast settlement with multiple integrated payment method options for global traders.',
    accentColor: 'text-blue-700',
    iconBg: 'bg-blue-50',
  },
  {
    icon: TrendingUp,
    title: 'Price Tracking',
    description: 'Track global gem values and receive customized SMS and email alerts on price movements.',
    accentColor: 'text-cyan-700',
    iconBg: 'bg-cyan-50',
  },
  {
    icon: Lightbulb,
    title: 'Expert Insights',
    description: 'Exclusive weekly market reports and deep trading analysis from seasoned gem industry experts.',
    accentColor: 'text-amber-700',
    iconBg: 'bg-amber-50',
  },
  {
    icon: MessageSquare,
    title: '24/7 Premium Support',
    description: 'Our dedicated support team is available round the clock for dispute resolution and assistance.',
    accentColor: 'text-rose-700',
    iconBg: 'bg-rose-50',
  },
];

export const FeaturesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const getOffset = (index: number) => {
    let offset = (index - currentIndex) % features.length;
    if (offset < -Math.floor(features.length / 2)) offset += features.length;
    if (offset > Math.floor(features.length / 2)) offset -= features.length;
    return offset;
  };

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 5000);
  };

  return (
    <section className="py-24 px-4 bg-slate-50 overflow-hidden relative">
      {/* Subtle decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">Platform Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-slate-900 tracking-tight">
            Why Traders Choose GemTrade
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Built for professionals who demand transparency, security, and real-time insights
          </p>
        </div>

        {/* 3D Carousel */}
        <div
          className="relative w-full h-[480px] flex items-center justify-center"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {features.map((feature, idx) => {
            const offset = getOffset(idx);
            const isCenter = offset === 0;

            let x = 0;
            let scale = 0.7;
            let zIndex = 10;
            let opacity = 0;

            if (isCenter) {
              x = 0;
              scale = 1;
              zIndex = 50;
              opacity = 1;
            } else if (offset === 1) {
              x = 320;
              scale = 0.85;
              zIndex = 30;
              opacity = 0.5;
            } else if (offset === -1) {
              x = -320;
              scale = 0.85;
              zIndex = 30;
              opacity = 0.5;
            } else if (Math.abs(offset) >= 2) {
              x = offset > 0 ? 520 : -520;
              scale = 0.7;
              zIndex = 10;
              opacity = 0;
            }

            const Icon = feature.icon;

            return (
              <motion.div
                key={idx}
                animate={{ x, scale, zIndex, opacity }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute w-full max-w-sm cursor-pointer"
                onClick={() => goToSlide(idx)}
              >
                {/* Clean White Card */}
                <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center min-h-[380px] hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
                  {/* Icon */}
                  <div className={`${feature.iconBg} p-5 rounded-2xl mb-6 border border-slate-100 transition-all duration-300`}>
                    <Icon className={`w-8 h-8 ${feature.accentColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-slate-900 text-xl md:text-2xl font-bold mb-4 tracking-tight">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed text-center">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white border border-slate-200 shadow-lg hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-all"
            aria-label="Previous feature"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white border border-slate-200 shadow-lg hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-all"
            aria-label="Next feature"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-500 rounded-full ${
                idx === currentIndex
                  ? 'w-10 h-2.5 bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to feature ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
