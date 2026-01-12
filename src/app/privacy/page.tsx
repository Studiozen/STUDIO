'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flower2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
              <Flower2 className="h-6 w-6 text-primary" />
              <span className="font-headline">StudioZen</span>
            </Link>
        </div>
        <div className='flex items-center gap-4'>
          <LanguageSwitcher />
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('privacy.backButton')}
            </Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl py-8 px-4 md:py-12 md:px-6">
        <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
          <h1>{t('privacy.title')}</h1>
          <p>
            <strong>{t('privacy.lastUpdated')}:</strong> {new Date().toLocaleDateString(t('locale'))}
          </p>

          <h2>1. {t('privacy.introduction.title')}</h2>
          <p>{t('privacy.introduction.content')}</p>

          <h2>2. {t('privacy.dataWeCollect.title')}</h2>
          <p>{t('privacy.dataWeCollect.content')}</p>
          <ul>
            <li>
              <strong>{t('privacy.dataWeCollect.accountInfo.title')}:</strong> {t('privacy.dataWeCollect.accountInfo.content')}
            </li>
            <li>
              <strong>{t('privacy.dataWeCollect.usageData.title')}:</strong> {t('privacy.dataWeCollect.usageData.content')}
            </li>
            <li>
              <strong>{t('privacy.dataWeCollect.cookies.title')}:</strong> {t('privacy.dataWeCollect.cookies.content')}
            </li>

          </ul>

          <h2>3. {t('privacy.howWeUseData.title')}</h2>
          <p>{t('privacy.howWeUseData.content')}</p>
          <ul>
            <li>{t('privacy.howWeUseData.points.provide')}</li>
            <li>{t('privacy.howWeUseData.points.authenticate')}</li>
            <li>{t('privacy.howWeUseData.points.personalize')}</li>
            <li>{t('privacy.howWeUseData.points.communicate')}</li>
          </ul>

          <h2>4. {t('privacy.dataSharing.title')}</h2>
          <p>{t('privacy.dataSharing.content')}</p>
          
          <h2>5. {t('privacy.dataSecurity.title')}</h2>
          <p>{t('privacy.dataSecurity.content')}</p>

          <h2>6. {t('privacy.yourRights.title')}</h2>
          <p>{t('privacy.yourRights.content')}</p>

          <h2>7. {t('privacy.changes.title')}</h2>
          <p>{t('privacy.changes.content')}</p>

          <h2>8. {t('privacy.contact.title')}</h2>
          <p>{t('privacy.contact.content')}</p>
        </div>
      </main>
    </div>
  );
}
