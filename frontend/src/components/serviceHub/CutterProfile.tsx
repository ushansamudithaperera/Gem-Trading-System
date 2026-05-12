import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Star, MapPin, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { getCutterDetails } from '../../services/cutting.service';

export interface Cutter {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rating: number;
  totalTransactions: number;
  businessName?: string;
  location: string;
  bio?: string;
  specialties: string[];
  completedJobs: number;
  averageTurnaroundDays: number;
  hourlyRate?: number;
  available: boolean;
}

interface CutterProfileProps {
  cutterId: string;
  onHire?: (cutterId: string) => void;
}

export const CutterProfile: React.FC<CutterProfileProps> = ({ cutterId, onHire }) => {
  const [cutter, setCutter] = useState<Cutter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCutter = async () => {
      try {
        const data = await getCutterDetails(cutterId);
        setCutter(data);
      } catch (error) {
        console.error('Failed to fetch cutter:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCutter();
  }, [cutterId]);

  if (loading) {
    return (
      <Card className="animate-pulse border-slate-200">
        <CardContent className="p-6">
          <div className="h-24 bg-slate-200 rounded mb-4"></div>
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  if (!cutter) {
    return <div className="text-center text-slate-500">Cutter not found</div>;
  }

  return (
    <Card className="overflow-hidden border-emerald-200">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
              {cutter.avatar ? (
                <img src={cutter.avatar} alt={cutter.firstName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-emerald-600">
                  {cutter.firstName[0]}{cutter.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">
                {cutter.firstName} {cutter.lastName}
                {cutter.businessName && (
                  <span className="text-sm text-slate-500 ml-2">({cutter.businessName})</span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="ml-1 font-medium text-slate-900">{cutter.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-600">{cutter.completedJobs} jobs completed</span>
              </div>
            </div>
          </div>
          <Badge variant={cutter.available ? 'success' : 'secondary'}>
            {cutter.available ? 'Available' : 'Busy'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Bio */}
        {cutter.bio && (
          <p className="text-slate-700 text-sm">{cutter.bio}</p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4" />
            <span>{cutter.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Briefcase className="h-4 w-4" />
            <span>{cutter.specialties.join(', ') || 'Gem Cutting'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>Avg. {cutter.averageTurnaroundDays} days</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="h-4 w-4" />
            <span>{cutter.totalTransactions} transactions</span>
          </div>
        </div>

        {/* Rate and Hire button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div>
            <span className="text-sm text-slate-500">Cutting Fee</span>
            <p className="text-xl font-bold text-emerald-600">
              ${cutter.hourlyRate?.toLocaleString() || 'Contact for quote'}
            </p>
          </div>
          <Button onClick={() => onHire?.(cutter._id)} disabled={!cutter.available} className="bg-emerald-600 hover:bg-emerald-700">
            Hire Cutter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};