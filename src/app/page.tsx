'use client';

import { Suspense, lazy, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/dashboard/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { BookOpen, TextQuote, Timer } from 'lucide-react';

const Summarizer = lazy(() => import('@/components/dashboard/summarizer'));
const FlashcardGenerator = lazy(
  () => import('@/components/dashboard/flashcard-generator')
);
const FocusTimer = lazy(() => import('@/components/dashboard/focus-timer'));

function DashboardFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>{t('home.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl">
          <Suspense fallback={<DashboardFallback />}>
            <Tabs defaultValue="summarizer" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summarizer">
                  <TextQuote className="mr-2 h-4 w-4" />
                  {t('home.accordion.summarizer.title')}
                </TabsTrigger>
                <TabsTrigger value="quiz">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t('home.accordion.quiz.title')}
                </TabsTrigger>
                <TabsTrigger value="timer">
                  <Timer className="mr-2 h-4 w-4" />
                  {t('home.accordion.timer.title')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="summarizer" className="mt-4 rounded-lg border bg-card p-6">
                <Summarizer />
              </TabsContent>
              
              <TabsContent value="quiz" className="mt-4 rounded-lg border bg-card p-6">
                <FlashcardGenerator />
              </TabsContent>
              
              <TabsContent value="timer" className="mt-4 rounded-lg border bg-card p-6 flex justify-center">
                 <div className='w-full max-w-sm'>
                    <FocusTimer />
                  </div>
              </TabsContent>
            </Tabs>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
