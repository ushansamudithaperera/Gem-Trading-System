import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Heart, Eye, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Gem {
  _id: string;
  title: string;
  description: string;
  type: 'ROUGH' | 'POLISHED';
  weightCarats: number;
  images: string[];
  price: number;
  location: string;
  sellerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
  };
  certificate?: string;
  createdAt: string;
}

interface GemCardProps {
  gem: Gem;
  onBid?: (gemId: string) => void;
  isAuthenticated?: boolean;
}

export const GemCard: React.FC<GemCardProps> = ({ gem, onBid, isAuthenticated = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const defaultImage = 'https://placehold.co/400x300?text=Gem+Image';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative h-48 bg-slate-100 border-b border-emerald-200">
        <img
          src={gem.images?.[0] || defaultImage}
          alt={gem.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gem className="h-8 w-8 text-slate-400 animate-pulse" />
          </div>
        )}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-emerald-500 text-emerald-500' : 'text-slate-600'}`} />
        </button>
        <Badge
          variant={gem.type === 'ROUGH' ? 'warning' : 'success'}
          className="absolute bottom-2 left-2"
        >
          {gem.type}
        </Badge>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/gems/${gem._id}`}>
            <h3 className="font-semibold text-lg hover:text-emerald-600 transition-colors line-clamp-1">
              {gem.title}
            </h3>
          </Link>
          <span className="text-sm text-slate-500">{gem.weightCarats} ct</span>
        </div>
        
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{gem.description}</p>
        
        <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
          <span>📍 {gem.location}</span>
          <span>⭐ {gem.sellerId?.rating?.toFixed(1) || 'New'}</span>
        </div>
        
        <div className="text-2xl font-bold text-emerald-600">
          ${gem.price.toLocaleString()}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link to={`/gems/${gem._id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </Link>
        {isAuthenticated ? (
          <Button className="flex-1" onClick={() => onBid?.(gem._id)}>
            Place Bid
          </Button>
        ) : (
          <Link to="/login" className="flex-1">
            <Button className="w-full">Login to Bid</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};