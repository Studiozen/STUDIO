'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { GeneratedSummary } from '@/types/history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, TextQuote, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/dashboard/header';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SummaryPage() {
  const { summaryId } = useParams() as { summaryId: string };
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const summaryDocRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}/summaries/${summaryId}`) : null),
    [firestore, user, summaryId]
  );

  const { data: summaryData, isLoading } = useDoc<GeneratedSummary>(summaryDocRef);
  
  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!summaryData) {
     return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
           <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('errors.generic.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t('summaries.errors.notFound')}</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/history">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('summaries.backToProfile')}
                </Link>
              </Button>
            </CardContent>
           </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
       <Header />
       <main className="flex-1 p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-2xl space-y-6">
            <Button asChild variant="outline" className="self-start">
                <Link href="/history">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('summaries.backToProfile')}
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {summaryData.sourceType === 'image' ? <ImageIcon /> : <TextQuote />}
                        {t('summaries.title')}
                    </CardTitle>
                    {summaryData.sourceText && (
                        <CardDescription className='pt-2'>
                           {t('summaries.sourceText')}: "{summaryData.sourceText}"
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                   <div className='prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-4'>
                        <p>{summaryData.summary}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
       </main>
    </div>
  );
}
