'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consent !== 'true') {
        setIsVisible(true);
      }
    } catch (e) {
        console.error("Could not access local storage", e);
    }
  }, []);

  const handleAccept = () => {
    try {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
        setIsVisible(false);
    } catch(e) {
        console.error("Could not access local storage", e);
        setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-secondary text-secondary-foreground p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left">
          {t('cookieBanner.text.part1')}{' '}
          <Link href="/privacy" className="underline hover:text-primary">
            {t('cookieBanner.text.link')}
          </Link>
          .
        </p>
        <Button onClick={handleAccept} size="sm">{t('cookieBanner.acceptButton')}</Button>
      </div>
    </div>
  );
}
