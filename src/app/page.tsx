'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/dashboard/header';
import FocusTimer from '@/components/dashboard/focus-timer';
import Summarizer from '@/components/dashboard/summarizer';
import FlashcardGenerator from '@/components/dashboard/flashcard-generator';

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
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-4">
            <Summarizer />
            <FlashcardGenerator />
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <FocusTimer />
          </div>
        </div>
      </main>
    </div>
  );
}
