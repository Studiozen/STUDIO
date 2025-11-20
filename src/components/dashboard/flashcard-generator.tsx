'use client';

import { useState, useTransition, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, HelpCircle, ArrowLeft, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { generateFlashcards, type GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import React from 'react';

const formSchema = z.object({
  text: z.string(),
});

type Flashcard = GenerateFlashcardsOutput['flashcards'][0];
type FlashcardWithAudio = Flashcard & {
    audioSrc?: string;
};


const FlashcardGenerator: FC = () => {
  const [isPending, startTransition] = useTransition();
  const [flashcards, setFlashcards] = useState<FlashcardWithAudio[] | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [generationStatus, setGenerationStatus] = useState('');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);


  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.text.trim().length === 0) {
        toast({
            variant: 'destructive',
            title: 'Testo mancante',
            description: 'Per favore, inserisci il testo per creare le flashcard.'
        });
        return;
    }
    setFlashcards(null);
    setIsFlipped(false);
    startTransition(async () => {
      setGenerationStatus("Sto generando le flashcard...");
      const result = await generateFlashcards(values);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Errore nella generazione delle flashcard',
          description: result.error,
        });
        setGenerationStatus('');
        return;
      }
      if (result.flashcards.length === 0) {
        setFlashcards([]);
        setGenerationStatus('');
        return;
      }

      setGenerationStatus("Sto generando l'audio per le domande...");
      const flashcardsWithAudio = await Promise.all(
          result.flashcards.map(async (card) => {
              try {
                  const audioResult = await textToSpeech({ text: card.question });
                  return { ...card, audioSrc: audioResult.audio };
              } catch (e) {
                  console.error("Errore nella generazione dell'audio:", e);
                  return { ...card, audioSrc: undefined }; // Procedi senza audio in caso di errore
              }
          })
      );
      
      setFlashcards(flashcardsWithAudio);
      setGenerationStatus('');
    });
  }

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
      setIsFlipped(false);
      // Stoppa l'audio quando si cambia slide
      if(audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
    })
  }, [api])

  const handleReset = () => {
    form.reset();
    setFlashcards(null);
    setIsFlipped(false);
    setCurrent(0);
    setCount(0);
    setGenerationStatus('');
  }

  const playAudio = (audioSrc?: string) => {
    if (audioSrc) {
        if(audioRef.current) {
            audioRef.current.pause();
        }
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        audio.play();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Generatore di Flashcard AI
        </CardTitle>
        <CardDescription>
          Trasforma il tuo materiale di studio in flashcard per un ripasso efficace. L'IA leggerà le domande per te.
        </CardDescription>
      </CardHeader>
      {!flashcards && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materiale di Studio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Incolla qui il testo per creare le flashcard..."
                        className="min-h-40 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Genera Flashcard
              </Button>
            </CardFooter>
          </form>
        </Form>
      )}

      {isPending && !flashcards && (
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{generationStatus || "L'IA sta creando le tue flashcard..."}</p>
          </div>
        </CardContent>
      )}

      {flashcards && flashcards.length > 0 && (
        <CardContent>
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {flashcards.map((card, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                            <Card 
                                className="h-64 cursor-pointer [perspective:1000px]"
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <div className={cn("relative h-full w-full rounded-lg [transform-style:preserve-3d] transition-transform duration-500", isFlipped && "[transform:rotateY(180deg)]")}>
                                    {/* Fronte */}
                                    <div className="absolute flex flex-col justify-center items-center text-center p-6 [backface-visibility:hidden] h-full w-full bg-card rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Domanda</p>
                                        <p className="text-lg font-semibold">{card.question}</p>
                                        {card.audioSrc && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="mt-4"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Evita di girare la card
                                                    playAudio(card.audioSrc);
                                                }}
                                            >
                                                <Volume2 />
                                                <span className="sr-only">Ascolta la domanda</span>
                                            </Button>
                                        )}
                                    </div>
                                    {/* Retro */}
                                    <div className="absolute flex flex-col justify-center items-center text-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] h-full w-full bg-secondary rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-2">Risposta</p>
                                        <p className="text-md">{card.answer}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2" />
            </Carousel>
            <div className="py-2 text-center text-sm text-muted-foreground">
                Flashcard {current} di {count}
            </div>
            <div className='flex justify-center'>
                 <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Crea nuove flashcard
                </Button>
            </div>
        </CardContent>
      )}
       {flashcards && flashcards.length === 0 && !isPending && (
         <CardContent>
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
                <p className="text-muted-foreground">L'IA non è riuscita a generare flashcard dal testo fornito.</p>
                 <Button onClick={handleReset} variant="link">Riprova</Button>
            </div>
         </CardContent>
       )}
    </Card>
  );
};

export default FlashcardGenerator;
