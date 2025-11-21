'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Loader2, Wand2, Lightbulb, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateFlashcards, type GenerateFlashcardsOutput, type GenerateFlashcardsInput } from '@/ai/flows/generate-flashcards';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '../ui/carousel';
import React from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { cn } from '@/lib/utils';

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

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    })
  }, [api]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

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

  function Flashcard({ question, answer, explanation }: { question: string, answer: string, explanation: string }) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="w-full h-80 perspective-1000">
            <div
                className={cn("relative w-full h-full transform-style-3d transition-transform duration-700", isFlipped ? 'rotate-y-180' : '')}
                onClick={handleFlip}
            >
                {/* Front of card */}
                <div className="absolute w-full h-full backface-hidden bg-card border rounded-lg p-6 flex flex-col justify-center items-center text-center cursor-pointer">
                    <p className="text-lg font-semibold">{question}</p>
                </div>
                {/* Back of card */}
                <div className="absolute w-full h-full backface-hidden bg-card border rounded-lg p-6 flex flex-col justify-center items-center text-center rotate-y-180 cursor-pointer">
                    <p className="text-lg font-bold text-primary">{answer}</p>
                    <p className="mt-4 text-sm text-muted-foreground italic">{explanation}</p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Generatore di Flashcard AI
        </CardTitle>
        <CardDescription>
          Trasforma i tuoi appunti in flashcard interattive per ripassare in modo efficace.
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
                Genera Flashcard
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
                <p className='font-semibold'>L'IA sta creando le tue flashcard...</p>
                <p className='text-sm text-muted-foreground'>Potrebbe volerci qualche istante.</p>
            </div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Le tue Flashcard</h3>
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {result.flashcards.map((card, index) => (
                  <CarouselItem key={index}>
                     <Flashcard question={card.question} answer={card.answer} explanation={card.explanation} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='-left-4 sm:-left-12' />
              <CarouselNext className='-right-4 sm:-right-12' />
            </Carousel>
             <div className="py-2 text-center text-sm text-muted-foreground">
                Flashcard {current} di {count}
            </div>

            <Alert className="mt-4">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Consiglio per lo studio</AlertTitle>
              <AlertDescription>
                Clicca su una flashcard per girarla e vedere la risposta con la spiegazione. Usa le frecce per navigare.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
