import React from 'react';
import './GemLoader.css';

interface GemLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const GemLoader: React.FC<GemLoaderProps> = ({ 
  message = 'Loading gems...', 
  fullScreen = false 
}) => {
  return (
    <div className={`gem-loader-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="gem-loader">
        {/* Realistic Emerald Cut Gem SVG */}
        <svg 
          viewBox="0 0 200 200" 
          className="gem-svg-realistic"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="realisticGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="20%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="80%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="tableShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6"/>
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2"/>
            </linearGradient>
          </defs>

          {/* Group with glow */}
          <g filter="url(#realisticGlow)">
            {/* Outer Step Facets */}
            <polygon points="60,20 140,20 130,35 70,35" fill="#34d399" />
            <polygon points="140,20 160,40 145,50 130,35" fill="#10b981" />
            <polygon points="160,40 160,160 145,150 145,50" fill="#059669" />
            <polygon points="160,160 140,180 130,165 145,150" fill="#065f46" />
            <polygon points="140,180 60,180 70,165 130,165" fill="#022c22" />
            <polygon points="60,180 40,160 55,150 70,165" fill="#065f46" />
            <polygon points="40,160 40,40 55,50 55,150" fill="#10b981" />
            <polygon points="40,40 60,20 70,35 55,50" fill="#6ee7b7" />

            {/* Middle Step Facets */}
            <polygon points="70,35 130,35 120,50 80,50" fill="#6ee7b7" />
            <polygon points="130,35 145,50 130,60 120,50" fill="#34d399" />
            <polygon points="145,50 145,150 130,140 130,60" fill="#10b981" />
            <polygon points="145,150 130,165 120,150 130,140" fill="#059669" />
            <polygon points="130,165 70,165 80,150 120,150" fill="#022c22" />
            <polygon points="70,165 55,150 70,140 80,150" fill="#065f46" />
            <polygon points="55,150 55,50 70,60 70,140" fill="#059669" />
            <polygon points="55,50 70,35 80,50 70,60" fill="#a7f3d0" />

            {/* Culet Facets (visible through table) */}
            <polygon points="80,50 120,50 110,80 90,80" fill="#059669" />
            <polygon points="120,50 130,60 110,80" fill="#10b981" />
            <polygon points="130,60 130,140 110,120 110,80" fill="#065f46" />
            <polygon points="130,140 120,150 110,120" fill="#022c22" />
            <polygon points="120,150 80,150 90,120 110,120" fill="#065f46" />
            <polygon points="80,150 70,140 90,120" fill="#10b981" />
            <polygon points="70,140 70,60 90,80 90,120" fill="#34d399" />
            <polygon points="70,60 80,50 90,80" fill="#6ee7b7" />
            <rect x="90" y="80" width="20" height="40" fill="#065f46" />

            {/* Table (Top Flat Surface) with Shine Gradient Overlay */}
            <polygon 
              points="80,50 120,50 130,60 130,140 120,150 80,150 70,140 70,60" 
              fill="url(#tableShine)" 
            />

            {/* Overall Gem Overlays for Realism */}
            <polygon 
              points="60,20 140,20 160,40 160,160 140,180 60,180 40,160 40,40" 
              fill="url(#shine)" 
              style={{ mixBlendMode: 'overlay' }}
            />
            
            {/* Outline reflections (crisp edges) */}
            <polygon 
              points="80,50 120,50 130,60 130,140 120,150 80,150 70,140 70,60" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="0.5" 
              opacity="0.6"
            />
            <polygon 
              points="70,35 130,35 145,50 145,150 130,165 70,165 55,150 55,50" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="0.5" 
              opacity="0.4"
            />
            <polygon 
              points="60,20 140,20 160,40 160,160 140,180 60,180 40,160 40,40" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="1" 
              opacity="0.3"
            />
            
            {/* Corner connection lines for reflection */}
            <line x1="60" y1="20" x2="80" y2="50" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
            <line x1="140" y1="20" x2="120" y2="50" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
            <line x1="160" y1="40" x2="130" y2="60" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
            <line x1="40" y1="40" x2="70" y2="60" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
          </g>
          
          {/* Animated specular highlight (a bright flash) */}
          <polygon 
            points="60,20 75,20 85,50 80,50" 
            fill="#ffffff" 
            className="specular-flash"
          />
        </svg>

        {/* Ambient realistic sparkles */}
        <div className="sparkle realistic-sparkle-1"></div>
        <div className="sparkle realistic-sparkle-2"></div>
        <div className="sparkle realistic-sparkle-3"></div>
      </div>
      {message && <p className="gem-loader-text">{message}</p>}
    </div>
  );
};
