'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { GeneratedQuiz, Flashcard as FlashcardType } from '@/types/history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Lightbulb, BookOpen } from 'lucide-react';
import Header from '@/components/dashboard/header';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function Flashcard({ question, options, answer, explanation }: FlashcardType) {
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: React.ReactNode } | null>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);

    const handleOptionSelect = (option: string) => {
        if (feedback) return; 

        setSelectedOption(option);
        const isCorrect = option === answer;

        if (isCorrect) {
            setFeedback({
                isCorrect: true,
                message: <p className="font-semibold text-green-600">{t('flashcards.card.correct')}</p>
            });
        } else {
            setFeedback({
                isCorrect: false,
                message: (
                    <div className="text-left space-y-2">
                        <p className="font-semibold text-red-600">{t('flashcards.card.incorrect')}</p>
                        <p><strong>{t('flashcards.card.correctAnswer')}:</strong> {answer}</p>
                        <p><strong>{t('flashcards.card.explanation')}:</strong> <em className="text-muted-foreground">{explanation}</em></p>
                    </div>
                )
            });
        }
    };
    
    useEffect(() => {
        setFeedback(null);
        setSelectedOption(null);
    }, [question]);

    useEffect(() => {
        if (feedback && feedbackRef.current) {
            feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [feedback]);

    return (
        <div className="w-full min-h-72 bg-card border rounded-lg p-6 flex flex-col justify-between items-center text-center mt-4 space-y-4 animate-in fade-in-50">
            <p className="text-lg font-semibold">{question}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {options.map((option, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        className={cn(
                            "h-auto py-3 whitespace-normal",
                            selectedOption && option === answer && "bg-green-100 border-green-400 text-green-800 hover:bg-green-200",
                            selectedOption === option && selectedOption !== answer && "bg-red-100 border-red-400 text-red-800 hover:bg-red-200"
                        )}
                        onClick={() => handleOptionSelect(option)}
                        disabled={!!feedback}
                    >
                        {option}
                    </Button>
                ))}
            </div>

            {feedback && (
                <div ref={feedbackRef} className="w-full bg-muted/50 p-4 rounded-md text-sm mt-4">
                    {feedback.message}
                </div>
            )}
        </div>
    );
}


export default function QuizPage() {
  const { quizId } = useParams() as { quizId: string };
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();
  const [selectedQuestion, setSelectedQuestion] = useState<FlashcardType | null>(null);

  const quizDocRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}/quizzes/${quizId}`) : null),
    [firestore, user, quizId]
  );

  const { data: quizData, isLoading } = useDoc<GeneratedQuiz>(quizDocRef);
  
  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!quizData) {
     return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
           <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{t('errors.generic.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t('quizzes.errors.notFound')}</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/history">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('quizzes.backToHistory')}
                </Link>
              </Button>
            </CardContent>
           </Card>
        </main>
      </div>
    );
  }
  
  const handleQuestionSelect = (flashcard: FlashcardType) => {
    if (selectedQuestion?.question === flashcard.question) {
        setSelectedQuestion(null);
    } else {
        setSelectedQuestion(flashcard);
    }
  }


  return (
    <div className="flex min-h-screen w-full flex-col">
       <Header />
       <main className="flex-1 p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-3xl space-y-6">
            <Button asChild variant="outline" className="self-start">
                <Link href="/history">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('quizzes.backToHistory')}
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen />
                        {t('quizzes.title')}
                    </CardTitle>
                    <CardDescription className='pt-2'>
                        {t('quizzes.sourceText')} "{quizData.sourceText}"
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <h3 className="text-lg font-semibold mb-4">{t('quizzes.questionsTitle')}</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {quizData?.flashcards?.map((card, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'p-3 border rounded-lg cursor-pointer transition-colors',
                                    selectedQuestion?.question === card.question ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                )}
                                onClick={() => handleQuestionSelect(card)}
                            >
                            <p className='font-medium text-sm'>{index + 1}. {card.question}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        {selectedQuestion ? (
                            <Flashcard {...selectedQuestion} />
                        ) : (
                            <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg mt-4">
                                <Lightbulb className="mx-auto h-8 w-8 mb-2" />
                                <p>{t('quizzes.selectAQuestion')}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
       </main>
    </div>
  );
}
