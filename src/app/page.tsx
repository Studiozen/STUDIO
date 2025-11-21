'use client';

import { useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/dashboard/header';
import { Skeleton } from '@/components/ui/skeleton';

const Summarizer = lazy(() => import('@/components/dashboard/summarizer'));
const FlashcardGenerator = lazy(() => import('@/components/dashboard/flashcard-generator'));
const FocusTimer = lazy(() => import('@/components/dashboard/focus-timer'));


function DashboardFallback() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
      <div className="space-y-8">
        <Skeleton className="h-[250px] w-full" />
      </div>
    </div>
  )
}

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Caricamento in corso...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
          <Suspense fallback={<DashboardFallback />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Summarizer />
                    <FlashcardGenerator />
                </div>
                <div className="space-y-8">
                    <FocusTimer />
                </div>
            </div>
          </Suspense>
      </main>
    </div>
  );
}
