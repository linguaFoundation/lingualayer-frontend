'use client';
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

function format(msRemaining: number): { text: string; urgent: boolean; expired: boolean } {
  if (msRemaining <= 0) {
    return { text: 'Deadline passed', urgent: true, expired: true };
  }

  const totalHours = msRemaining / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);

  const urgent = totalHours < 24;
  const prefix = urgent ? '⚠️ Expiring soon — ' : '';

  if (days > 0) {
    return { text: `${prefix}${days} day${days === 1 ? '' : 's'}, ${hours} hour${hours === 1 ? '' : 's'} remaining`, urgent, expired: false };
  }
  const minutes = Math.floor((msRemaining / (1000 * 60)) % 60);
  return { text: `${prefix}Expires in ${hours}h ${minutes}m`, urgent, expired: false };
}

/** Live countdown, refreshed once a minute (not once a second — avoids thrashing). */
export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { text, urgent, expired } = format(targetDate.getTime() - now);

  return (
    <span className={urgent ? 'countdown-timer countdown-timer--urgent' : 'countdown-timer'}>
      {expired ? '⏰ ' : '⏳ '}
      {text}
    </span>
  );
}
