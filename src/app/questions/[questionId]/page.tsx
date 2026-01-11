'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { GeneratedQuestion } from '@/types/history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Header from '@/components/dashboard/header';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function QuestionPage() {
  const { questionId } = useParams() as { questionId: string };
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const questionDocRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}/questions/${questionId}`) : null),
    [firestore, user, questionId]
  );

  const { data: questionData, isLoading } = useDoc<GeneratedQuestion>(questionDocRef);
  
  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!questionData) {
     return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
           <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('errors.generic.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t('questions.errors.notFound')}</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/profile">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('questions.backToProfile')}
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
                <Link href="/profile">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('questions.backToProfile')}
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>{t('questions.question.title')}</CardTitle>
                    <CardDescription className='pt-2'>{questionData.question}</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className='prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-4'>
                        <p>{questionData.answer}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
       </main>
    </div>
  );
}
