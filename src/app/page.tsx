'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/dashboard/header';

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
        <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed bg-card">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Benvenuto in StudioZen
            </h1>
            <p className="text-muted-foreground">
              La tua dashboard è pronta.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
