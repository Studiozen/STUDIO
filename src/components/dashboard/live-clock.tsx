'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/use-translation';

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    // Set the initial time only on the client
    setTime(new Date());

    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!time) {
    return null; // Don't render on the server to avoid hydration mismatch
  }

  return (
    <div className="hidden sm:flex items-center gap-2 text-sm font-mono text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>{formatTime(time)}</span>
    </div>
  );
}
