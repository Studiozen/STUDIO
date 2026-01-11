'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Loader2, Wand2, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateFlashcards, type GenerateFlashcardsOutput, type GenerateFlashcardsInput } from '@/ai/flows/generate-flashcards';
import React from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface FlashcardData {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function FlashcardGenerator() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc(userDocRef);

  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');
  const [result, setResult] = useState<GenerateFlashcardsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<FlashcardData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSelectedQuestion(null);

    if (!text) {
      setError(t('flashcards.errors.noText'));
      return;
    }

    startTransition(async () => {
      const input: GenerateFlashcardsInput = { 
        text, 
        learningStyle: userProfile?.learningStyle,
        language: language,
      };
      const res = await generateFlashcards(input);
      if (res.flashcards && res.flashcards.length > 0) {
        setResult(res);
      } else {
        setError(t('flashcards.errors.generationFailed'));
      }
    });
  };
  
  const handleQuestionSelect = (flashcard: FlashcardData) => {
      if (selectedQuestion?.question === flashcard.question) {
          setSelectedQuestion(null); // Deselect if the same question is clicked
      } else {
          setSelectedQuestion(flashcard); // Select the new question
      }
  }

  function Flashcard({ question, options, answer, explanation }: FlashcardData) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: React.ReactNode } | null>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);

    const handleOptionSelect = (option: string) => {
        if (feedback) return; // Don't allow changing answer after submission

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

            <div className="text-xs text-muted-foreground self-end mt-4">
                {feedback ? t('flashcards.card.footer.answered') : t('flashcards.card.footer.selectAnswer')}
            </div>
        </div>
    );
  }

  return (
    <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={t('flashcards.textareaPlaceholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !text} className="w-full sm:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('flashcards.generateButton.loading')}
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                {t('flashcards.generateButton.default')}
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>{t('errors.generic.title')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPending && (
            <div className='flex flex-col items-center justify-center gap-4 mt-8 text-center'>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className='font-semibold'>{t('flashcards.loading.title')}</p>
                <p className='text-sm text-muted-foreground'>{t('flashcards.loading.description')}</p>
            </div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{t('flashcards.results.title')}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {result.flashcards.map((card, index) => (
                    <div key={index}>
                        <div
                            className={cn(
                                'p-3 border rounded-lg cursor-pointer transition-colors',
                                selectedQuestion?.question === card.question ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                            )}
                            onClick={() => handleQuestionSelect(card)}
                        >
                           <p className='font-medium text-sm'>{index + 1}. {card.question}</p>
                        </div>
                        {selectedQuestion?.question === card.question && (
                             <div className="md:col-span-2">
                                <Flashcard {...selectedQuestion} />
                             </div>
                        )}
                    </div>
                ))}
            </div>

            <Alert className="mt-4">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>{t('flashcards.studyTip.title')}</AlertTitle>
              <AlertDescription>
                {t('flashcards.studyTip.description')}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
  );
}
