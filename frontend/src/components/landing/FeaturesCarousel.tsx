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
  iconBg: string;
  iconColor: string;
  glowColor: string;
}

const features: Feature[] = [
  {
    icon: Shield,
    title: 'Escrow Protection',
    description: 'Every transaction protected with multi-signature escrow technology ensuring completely safe trading.',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]',
  },
  {
    icon: Zap,
    title: 'Live Market Prices',
    description: 'Real-time pricing data updated every minute from global markets directly to your dashboard.',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  },
  {
    icon: Lock,
    title: 'Verified Sellers',
    description: 'All platform traders are rigorously verified with strict KYC and certification documentation.',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
  },
  {
    icon: BarChart3,
    title: 'Market Analytics',
    description: 'Advanced charting and historical pricing data for informed, data-driven buying and selling decisions.',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
    glowColor: 'shadow-[0_0_15px_rgba(244,114,182,0.5)]',
  },
  {
    icon: Wallet,
    title: 'Instant Payments',
    description: 'Lightning-fast settlement with multiple integrated crypto and fiat payment method options.',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-[0_0_15px_rgba(251,146,60,0.5)]',
  },
  {
    icon: TrendingUp,
    title: 'Price Tracking',
    description: 'Track global gem values and receive customized SMS and email alerts on price movements.',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
    glowColor: 'shadow-[0_0_15px_rgba(45,212,191,0.5)]',
  },
  {
    icon: Lightbulb,
    title: 'Expert Insights',
    description: 'Exclusive weekly market reports and deep trading analysis from seasoned gem industry experts.',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-400',
    glowColor: 'shadow-[0_0_15px_rgba(250,204,21,0.5)]',
  },
  {
    icon: MessageSquare,
    title: '24/7 Premium Support',
    description: 'Our dedicated support team is available round the clock for dispute resolution and assistance.',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    glowColor: 'shadow-[0_0_15px_rgba(251,113,133,0.5)]',
  },
];

export const FeaturesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Calculate offset for infinite carousel
  const getOffset = (index: number) => {
    let offset = (index - currentIndex) % features.length;
    if (offset < -Math.floor(features.length / 2)) offset += features.length;
    if (offset > Math.floor(features.length / 2)) offset -= features.length;
    return offset;
  };

  // Auto-play interval (1.5 seconds)
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  // Navigation functions
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
    <section className="py-24 px-4 bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-blue-900/20 to-slate-950 overflow-hidden border-y border-white/5 relative">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-md">
            Why Traders Choose GemTrade
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
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

            // Calculate card positions
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
              x = 300;
              scale = 0.85;
              zIndex = 30;
              opacity = 0.5;
            } else if (offset === -1) {
              x = -300;
              scale = 0.85;
              zIndex = 30;
              opacity = 0.5;
            } else if (Math.abs(offset) >= 2) {
              x = offset > 0 ? 500 : -500;
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
                {/* Dark Frosted Glass Card */}
                <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-700 shadow-2xl rounded-2xl p-8 flex flex-col items-center justify-center min-h-[380px]">
                  {/* Icon Circle with Glow */}
                  <div className={`${feature.iconBg} p-5 rounded-full mb-6 border border-slate-600 ${feature.glowColor} transition-all duration-300`}>
                    <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>

                  {/* Heading */}
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed text-center">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Navigation Buttons */}
          <button 
            onClick={goToPrev} 
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-slate-700/60 backdrop-blur-md border border-slate-600 hover:bg-slate-700 text-white transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button 
            onClick={goToNext} 
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-slate-700/60 backdrop-blur-md border border-slate-600 hover:bg-slate-700 text-white transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
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
                  ? 'w-10 h-2.5 bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]'
                  : 'w-2.5 h-2.5 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

