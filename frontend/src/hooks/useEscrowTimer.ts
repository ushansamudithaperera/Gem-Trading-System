import { useState, useEffect, useCallback } from 'react';

interface EscrowTimerProps {
  releaseDate: Date | string | null;
  onExpire?: () => void;
}

export const useEscrowTimer = ({ releaseDate, onExpire }: EscrowTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    if (!releaseDate) return null;
    const target = new Date(releaseDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { expired: true, formatted: 'Expired' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (3600000));
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    let formatted = '';
    if (days > 0) formatted += `${days}d `;
    if (hours > 0 || days > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m `;
    formatted += `${seconds}s`;

    return { expired: false, formatted };
  }, [releaseDate]);

  useEffect(() => {
    if (!releaseDate) {
      setTimeLeft('');
      setIsExpired(false);
      return;
    }

    const update = () => {
      const result = calculateTimeLeft();
      if (result) {
        setTimeLeft(result.formatted);
        if (result.expired && !isExpired) {
          setIsExpired(true);
          onExpire?.();
        }
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [releaseDate, calculateTimeLeft, isExpired, onExpire]);

  return { timeLeft, isExpired };
};