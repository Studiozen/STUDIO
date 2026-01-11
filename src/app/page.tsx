'use client';

import { Suspense, lazy, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/dashboard/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookOpen, TextQuote, Timer } from 'lucide-react';

const Summarizer = lazy(() => import('@/components/dashboard/summarizer'));
const FlashcardGenerator = lazy(
  () => import('@/components/dashboard/flashcard-generator')
);
const FocusTimer = lazy(() => import('@/components/dashboard/focus-timer'));

function DashboardFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
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
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-4"
              defaultValue="item-1"
            >
              <AccordionItem value="item-1" className="rounded-lg border bg-card p-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <TextQuote className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-left font-semibold">
                        {t('home.accordion.summarizer.title')}
                      </h2>
                      <p className="text-left text-sm text-muted-foreground">
                        {t('home.accordion.summarizer.description')}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t p-6">
                  <Summarizer />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="rounded-lg border bg-card p-0">
                 <AccordionTrigger className="p-6 hover:no-underline">
                   <div className="flex items-center gap-4">
                     <div className="rounded-lg bg-primary/10 p-3 text-primary">
                       <BookOpen className="h-6 w-6" />
                     </div>
                     <div>
                       <h2 className="text-left font-semibold">
                         {t('home.accordion.quiz.title')}
                       </h2>
                       <p className="text-left text-sm text-muted-foreground">
                         {t('home.accordion.quiz.description')}
                       </p>
                     </div>
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="border-t p-6">
                  <FlashcardGenerator />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="rounded-lg border bg-card p-0">
                 <AccordionTrigger className="p-6 hover:no-underline">
                   <div className="flex items-center gap-4">
                     <div className="rounded-lg bg-primary/10 p-3 text-primary">
                       <Timer className="h-6 w-6" />
                     </div>
                     <div>
                       <h2 className="text-left font-semibold">
                         {t('home.accordion.timer.title')}
                       </h2>
                       <p className="text-left text-sm text-muted-foreground">
                         {t('home.accordion.timer.description')}
                       </p>
                     </div>
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="border-t p-6 flex justify-center">
                  <div className='w-full max-w-sm'>
                    <FocusTimer />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
