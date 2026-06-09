import React, { useState, useEffect } from 'react';
import { CutterProfile, Cutter } from '../../components/serviceHub/CutterProfile';
import { HireCutterForm } from '../../components/serviceHub/HireCutterForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Input } from '../../components/ui/Input';
import { getAvailableCutters } from '../../services/cutting.service';
import { Search } from 'lucide-react';

export const CutterList: React.FC = () => {
  const [cutters, setCutters] = useState<Cutter[]>([]);
  const [filteredCutters, setFilteredCutters] = useState<Cutter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCutter, setSelectedCutter] = useState<Cutter | null>(null);
  const [showHireForm, setShowHireForm] = useState(false);
  const [orderIdForHire, setOrderIdForHire] = useState<string | null>(null);

  useEffect(() => {
    fetchCutters();
  }, []);

  useEffect(() => {
    const filtered = cutters.filter(cutter =>
      cutter.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cutter.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cutter.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cutter.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCutters(filtered);
  }, [searchTerm, cutters]);

  const fetchCutters = async () => {
    try {
      const data = await getAvailableCutters();
      setCutters(data);
      setFilteredCutters(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleHire = (cutter: Cutter) => {
    // In real app, user selects an order (rough gem they own) first.
    // For demo, we'll use a mock order ID or prompt.
    const mockOrderId = prompt('Enter Order ID of your rough gem (or demo: ORD-12345)');
    if (mockOrderId) {
      setSelectedCutter(cutter);
      setOrderIdForHire(mockOrderId);
      setShowHireForm(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Find a Cutter</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search cutters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredCutters.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-emerald-200">
          <p className="text-slate-500">No cutters available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCutters.map((cutter) => (
            <CutterProfile
              key={cutter._id}
              cutterId={cutter._id}
              onHire={() => handleHire(cutter)}
            />
          ))}
        </div>
      )}

      {/* Hire Cutter Modal */}
      {showHireForm && selectedCutter && orderIdForHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full border border-emerald-200 shadow-lg">
            <HireCutterForm
              orderId={orderIdForHire}
              roughGemId="mock_gem_id" // In real, fetch from order
              cutterId={selectedCutter._id}
              onSuccess={() => {
                setShowHireForm(false);
                alert('Cutter hired successfully!');
              }}
              onCancel={() => setShowHireForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};