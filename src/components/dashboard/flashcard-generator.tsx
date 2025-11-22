'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Loader2, Wand2, Lightbulb, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateFlashcards, type GenerateFlashcardsOutput, type GenerateFlashcardsInput } from '@/ai/flows/generate-flashcards';
import React from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { cn } from '@/lib/utils';

interface FlashcardData {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function FlashcardGenerator() {
  const { user } = useUser();
  const firestore = useFirestore();

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
      setError('Per favore, inserisci del testo da cui generare le flashcard.');
      return;
    }

    startTransition(async () => {
      const input: GenerateFlashcardsInput = { text, learningStyle: userProfile?.learningStyle };
      const res = await generateFlashcards(input);
      if (res.flashcards && res.flashcards.length > 0) {
        setResult(res);
      } else {
        setError("L'IA non è riuscita a generare flashcard dal testo fornito. Prova con un testo diverso o più dettagliato.");
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
                message: <p className="font-semibold text-green-600">Corretto!</p>
            });
        } else {
            setFeedback({
                isCorrect: false,
                message: (
                    <div className="text-left space-y-2">
                        <p className="font-semibold text-red-600">Sbagliato.</p>
                        <p><strong>Risposta corretta:</strong> {answer}</p>
                        <p><strong>Spiegazione:</strong> <em className="text-muted-foreground">{explanation}</em></p>
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
                {feedback ? 'Puoi chiudere questa domanda o sceglierne un\'altra.' : 'Seleziona una risposta.'}
            </div>
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Generatore di Quiz
        </CardTitle>
        <CardDescription>
          Trasforma i tuoi appunti in un quiz interattivo per testare la tua conoscenza.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Incolla qui il tuo materiale di studio (appunti, paragrafi di un libro, ecc.)..."
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
                Generazione...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Genera Domande
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPending && (
            <div className='flex flex-col items-center justify-center gap-4 mt-8 text-center'>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className='font-semibold'>L'IA sta creando le tue domande...</p>
                <p className='text-sm text-muted-foreground'>Potrebbe volerci qualche istante.</p>
            </div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Scegli una domanda per metterti alla prova</h3>
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
              <AlertTitle>Consiglio per lo studio</AlertTitle>
              <AlertDescription>
                Clicca su una domanda per iniziare. Scegli la risposta che ritieni corretta per ricevere un feedback immediato.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
