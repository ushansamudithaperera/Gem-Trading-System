import React from 'react';
import { Shield, Lock, Unlock, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

export type EscrowState = 'HELD' | 'RELEASED' | 'REFUNDED';

interface EscrowStatusProps {
  orderId: string;
  amount: number;
  state: EscrowState;
  releaseDate?: Date; // For auto-release countdown
  canRelease?: boolean; // Buyer can confirm receipt
  onRelease?: () => void; // Release funds
  isDisputed?: boolean;
}

export const EscrowStatus: React.FC<EscrowStatusProps> = ({
  orderId: _orderId,
  amount,
  state,
  releaseDate,
  canRelease = false,
  onRelease,
  isDisputed = false,
}) => {
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    if (state !== 'HELD' || !releaseDate) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = releaseDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft('Ready to release');
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (86400000)) / (3600000));
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state, releaseDate]);

  const getStateIcon = () => {
    switch (state) {
      case 'HELD':
        return <Lock className="h-6 w-6 text-amber-600" />;
      case 'RELEASED':
        return <Unlock className="h-6 w-6 text-emerald-600" />;
      case 'REFUNDED':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'HELD': return 'bg-amber-50 border-amber-200';
      case 'RELEASED': return 'bg-emerald-50 border-emerald-200';
      case 'REFUNDED': return 'bg-red-50 border-red-200';
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'HELD': return 'Held in Escrow';
      case 'RELEASED': return 'Released to Seller';
      case 'REFUNDED': return 'Refunded to Buyer';
    }
  };

  const progressValue = state === 'HELD' ? 50 : state === 'RELEASED' ? 100 : 0;

  return (
    <Card className={getStateColor()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Escrow Protection
        </CardTitle>
        {getStateIcon()}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold">${amount.toLocaleString()}</span>
          <span className="text-sm font-medium">{getStateText()}</span>
        </div>

        <Progress value={progressValue} className="h-2" />

        {state === 'HELD' && !isDisputed && (
          <div className="text-sm text-slate-600">
            {releaseDate ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Auto-release in: <strong>{timeLeft}</strong></span>
              </div>
            ) : (
              <p>Funds secured. Will release after delivery confirmation.</p>
            )}
            {canRelease && (
              <Button onClick={onRelease} className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700" size="sm">
                Confirm Receipt & Release Funds
              </Button>
            )}
          </div>
        )}

        {state === 'HELD' && isDisputed && (
          <div className="text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Escrow frozen due to dispute. Awaiting admin resolution.
          </div>
        )}

        {state === 'RELEASED' && (
          <p className="text-sm text-emerald-700">Funds have been transferred to the seller.</p>
        )}

        {state === 'REFUNDED' && (
          <p className="text-sm text-red-700">Funds refunded to your original payment method.</p>
        )}
      </CardContent>
    </Card>
  );
};