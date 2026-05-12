import React, { useState, useEffect } from 'react';
import { GemCard, Gem } from '../../components/marketplace/GemCard';
import { GemFilters, FilterState } from '../../components/marketplace/GemFilters';
import { BidModal } from '../../components/marketplace/BidModal';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getMarketplace } from '../../services/gem.service';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SlidersHorizontal, Grid3x3, LayoutList } from 'lucide-react';

export const MarketplaceList: React.FC = () => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    minPrice: '',
    maxPrice: '',
    minWeight: '',
    maxWeight: '',
    location: '',
  });
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const limit = 12;

  useEffect(() => {
    fetchGems();
  }, [page, filters]);

  const fetchGems = async () => {
    setLoading(true);
    try {
      const response = await getMarketplace({
        ...filters,
        page,
        limit,
      });
      setGems(response.gems);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch gems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      minWeight: '',
      maxWeight: '',
      location: '',
    });
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Gem Marketplace</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Filters Sidebar + Content */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="hidden md:block md:w-64 flex-shrink-0">
          <GemFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : gems.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-emerald-200">
              <p className="text-slate-500">No gem listings found.</p>
              <Button onClick={handleResetFilters} variant="link" className="mt-2">
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}>
                {gems.map((gem) => (
                  <GemCard
                    key={gem._id}
                    gem={gem}
                    isAuthenticated={isAuthenticated}
                    onBid={() => setSelectedGem(gem)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <GemFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isMobile
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bid Modal */}
      {selectedGem && (
        <BidModal
          isOpen={!!selectedGem}
          onClose={() => setSelectedGem(null)}
          gem={selectedGem}
        />
      )}
    </div>
  );
};