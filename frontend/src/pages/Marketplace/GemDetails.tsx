import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { BidModal } from '../../components/marketplace/BidModal';
import { getGemById } from '../../services/gem.service';
import { Gem as GemType } from '../../types/gem.types';
import { MapPin, Weight, User, Shield, ChefHat } from 'lucide-react';

export const GemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [gem, setGem] = useState<GemType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchGem = async () => {
      try {
        const data = await getGemById(id);
        setGem(data);
      } catch (error) {
        console.error(error);
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchGem();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!gem) {
    return (
      <div className="text-center py-12">
        <p>Gem not found</p>
        <Button onClick={() => navigate('/marketplace')} className="mt-4">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/marketplace')}
        className="mb-4 text-slate-700 hover:text-emerald-600"
      >
        ← Back to Marketplace
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <img
              src={gem.images[selectedImage] || '/placeholder-gem.jpg'}
              alt={gem.title}
              className="w-full h-full object-cover"
            />
          </div>
          {gem.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {gem.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-emerald-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{gem.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={gem.type === 'ROUGH' ? 'warning' : 'success'}>
                  {gem.type}
                </Badge>
                <span className="text-sm text-slate-500">
                  Listed {new Date(gem.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-600">
                ${gem.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Weight className="h-4 w-4" />
              <span>{gem.weightCarats} carats</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{gem.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="h-4 w-4" />
              <span>Seller: {gem.sellerId?.firstName} {gem.sellerId?.lastName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="h-4 w-4" />
              <span>Escrow protected</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{gem.description}</p>
          </div>

          {gem.certificate && (
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-semibold text-slate-900 mb-2">Certificate</h3>
              <a href={gem.certificate} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                View Certificate
              </a>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-3">
            {isAuthenticated ? (
              <Button size="lg" className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800" onClick={() => setShowBidModal(true)}>
                Place Bid / Buy Now
              </Button>
            ) : (
              <Button size="lg" className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800" onClick={() => navigate('/login')}>
                Login to Purchase
              </Button>
            )}
            {gem.type === 'ROUGH' && (
              <Button variant="outline" size="lg" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <ChefHat className="h-4 w-4 mr-2" />
                Hire a Cutter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        gem={gem}
      />
    </div>
  );
};