'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/dashboard/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { BookOpen, TextQuote, Timer } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Summarizer = lazy(() => import('@/components/dashboard/summarizer'));
const FlashcardGenerator = lazy(
  () => import('@/components/dashboard/flashcard-generator')
);
const FocusTimer = lazy(() => import('@/components/dashboard/focus-timer'));

type Tool = 'summarizer' | 'quiz' | 'timer';

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
  const [selectedTool, setSelectedTool] = useState<Tool>('summarizer');

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

  const renderTool = () => {
    switch (selectedTool) {
      case 'summarizer':
        return (
          <div className="mt-4 rounded-lg border bg-card p-6">
            <Summarizer />
          </div>
        );
      case 'quiz':
        return (
          <div className="mt-4 rounded-lg border bg-card p-6">
            <FlashcardGenerator />
          </div>
        );
      case 'timer':
        return (
          <div className="mt-4 rounded-lg border bg-card p-6 flex justify-center">
            <div className="w-full max-w-sm">
              <FocusTimer />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl">
          <Suspense fallback={<DashboardFallback />}>
            <div className="w-full">
              <Select
                value={selectedTool}
                onValueChange={(value: Tool) => setSelectedTool(value)}
              >
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder={t('home.toolSelector.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summarizer">
                    <div className="flex items-center">
                      <TextQuote className="mr-2 h-4 w-4" />
                      {t('home.toolSelector.options.summarizer')}
                    </div>
                  </SelectItem>
                  <SelectItem value="quiz">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      {t('home.toolSelector.options.quiz')}
                    </div>
                  </SelectItem>
                  <SelectItem value="timer">
                    <div className="flex items-center">
                      <Timer className="mr-2 h-4 w-4" />
                      {t('home.toolSelector.options.timer')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {renderTool()}
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
