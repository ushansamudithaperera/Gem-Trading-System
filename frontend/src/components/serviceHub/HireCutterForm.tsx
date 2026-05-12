import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

import { Textarea } from '../ui/Textarea';
import { Calendar as CalendarIcon, DollarSign } from 'lucide-react';

import { hireCutter } from '../../services/cutting.service';
import { toast } from '../ui/Toast';

interface HireCutterFormProps {
  orderId: string; // Order containing rough gem
  roughGemId: string;
  cutterId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const HireCutterForm: React.FC<HireCutterFormProps> = ({
  orderId,
  roughGemId: _roughGemId,
  cutterId,
  onSuccess,
  onCancel,
}) => {
  const [instructions, setInstructions] = useState('');
  const [expectedFinishDate, setExpectedFinishDate] = useState('');
  const [cutterFee, setCutterFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);


  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) {
      toast.error('Instructions required', 'Please provide cutting instructions.');
      return;
    }
    if (!expectedFinishDate) {
      toast.error('Expected finish date required');
      return;
    }
    if (cutterFee <= 0) {
      toast.error('Valid cutter fee required');
      return;
    }

    setLoading(true);
    try {
      await hireCutter({
        orderId,
        cutterId,
        instructions,
        expectedFinishDate,
        cutterFee,
      });
      toast.success('Cutter hired', 'The cutter has been notified and will start processing.');
      onSuccess?.();
    } catch (error: any) {
      toast.error('Failed', error.message || 'Could not hire cutter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hire Cutter for Your Rough Stone</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cutting Instructions *</label>
            <Textarea
              rows={4}
              placeholder="Describe desired cut, shape, quality requirements, special requests..."
              value={instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expected Finish Date *</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                min={minDateStr}
                value={expectedFinishDate}
                onChange={(e) => setExpectedFinishDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 3 days from today</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cutter Fee (USD) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min={10}
                step={10}
                value={cutterFee}
                onChange={(e) => setCutterFee(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                placeholder="e.g., 150"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Fee will be held in escrow and released upon completion.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Hiring...' : 'Confirm Hire'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};