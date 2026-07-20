'use client';
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadlineLedger: number;
}

export function CountdownTimer({ deadlineLedger }: CountdownTimerProps) {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function initDeadline() {
      try {
        // Fetch current ledger from Stellar Horizon public node
        const res = await fetch('https://horizon.stellar.org/');
        if (!res.ok) throw new Error('Horizon API returned error');
        const data = await res.json();
        const currentLedger = data.core_latest_ledger as number;

        // Stellar ledger closes ~every 5 seconds
        const secondsRemaining = (deadlineLedger - currentLedger) * 5;
        const targetDate = new Date(Date.now() + secondsRemaining * 1000);
        setDeadline(targetDate);
        setNow(new Date());

        // Update the 'now' state every minute to avoid thrashing re-renders
        interval = setInterval(() => {
          setNow(new Date());
        }, 60000);
      } catch (err) {
        console.error('Failed to initialize countdown timer', err);
        setError(true);
      }
    }

    initDeadline();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [deadlineLedger]);

  if (error) {
    return <div className="timer-normal">Deadline unavailable</div>;
  }

  if (!deadline) {
    // Loading state
    return <div className="timer-normal skeleton-text" style={{ width: '120px' }} />;
  }

  const msRemaining = deadline.getTime() - now.getTime();

  if (msRemaining <= 0) {
    return (
      <div className="timer-expired">
        Deadline passed <button className="cancel-link">Cancel</button>
      </div>
    );
  }

  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const minsRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

  let timeString = '';
  if (daysRemaining > 0) {
    timeString = `${daysRemaining} day${daysRemaining > 1 ? 's' : ''}, ${hoursRemaining % 24} hr remaining`;
  } else if (hoursRemaining > 0) {
    timeString = `⚠️ Expiring soon (${hoursRemaining} hr, ${minsRemaining} min)`;
  } else {
    timeString = `⚠️ Expiring very soon (${minsRemaining} min)`;
  }

  const isUrgent = hoursRemaining < 24;

  return (
    <div className={isUrgent ? 'timer-urgent' : 'timer-normal'}>
      {timeString}
    </div>
  );
}
