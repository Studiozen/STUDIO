'use client';

import { useState, useTransition, type FC, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, HelpCircle, BookOpen, Check, X } from 'lucide-react';
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
import { generateFlashcards, type GenerateFlashcardsInput } from '@/ai/flows/generate-flashcards';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const generationFormSchema = z.object({
  text: z.string(),
});

const answerFormSchema = z.object({
    answers: z.array(z.object({
        userAnswer: z.string(),
    }))
});

type Flashcard = {
    question: string;
    answer: string;
    explanation: string;
}

const FlashcardGenerator: FC = () => {
  const [isPending, startTransition] = useTransition();
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [checkedAnswers, setCheckedAnswers] = useState<boolean[]>([]);
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [generationStatus, setGenerationStatus] = useState('');
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  const { toast } = useToast();

  const generationForm = useForm<z.infer<typeof generationFormSchema>>({
    resolver: zodResolver(generationFormSchema),
    defaultValues: {
      text: '',
    },
  });

  const answerForm = useForm<z.infer<typeof answerFormSchema>>({
      resolver: zodResolver(answerFormSchema),
      defaultValues: {
          answers: [],
      }
  });

  const { fields, replace } = useFieldArray({
      control: answerForm.control,
      name: "answers"
  });

  function onGenerate(values: z.infer<typeof generationFormSchema>) {
    if (values.text.trim().length === 0) {
        toast({
            variant: 'destructive',
            title: 'Testo mancante',
            description: 'Per favore, inserisci il testo per creare le flashcard.'
        });
        return;
    }
    setFlashcards(null);
    setCheckedAnswers([]);

    startTransition(async () => {
      setGenerationStatus("Sto generando le flashcard...");
      const input: GenerateFlashcardsInput = {
          ...values,
          learningStyle: userProfile?.learningStyle,
      }
      const result = await generateFlashcards(input);
      if ('error' in result || !result.flashcards) {
        toast({
          variant: 'destructive',
          title: 'Errore nella generazione delle flashcard',
          description: ('error' in result && result.error) || "L'IA non è riuscita a generare le flashcard.",
        });
        setGenerationStatus('');
        return;
      }
      
      setFlashcards(result.flashcards);
      setCheckedAnswers(new Array(result.flashcards.length).fill(false));
      replace(result.flashcards.map(() => ({ userAnswer: '' })));
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
    })
  }, [api])

  const handleReset = () => {
    generationForm.reset();
    setFlashcards(null);
    setCheckedAnswers([]);
    setCurrent(0);
    setCount(0);
    setGenerationStatus('');
  }

  const checkAnswer = (index: number) => {
    const newCheckedAnswers = [...checkedAnswers];
    newCheckedAnswers[index] = true;
    setCheckedAnswers(newCheckedAnswers);
  };


  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Generatore di Flashcard AI
        </CardTitle>
        <CardDescription>
          Trasforma il tuo materiale di studio in flashcard. L'IA adatterà la complessità al tuo stile di apprendimento.
        </CardDescription>
      </CardHeader>
      {!flashcards && (
        <Form {...generationForm}>
          <form onSubmit={generationForm.handleSubmit(onGenerate)}>
            <CardContent>
              <FormField
                control={generationForm.control}
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
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm">{generationStatus || "L'IA sta creando le tue flashcard..."}</p>
          </div>
        </CardContent>
      )}

      {flashcards && flashcards.length > 0 && (
        <CardContent>
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {flashcards.map((card, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1 space-y-4">
                            <Card className="min-h-32">
                                <CardHeader>
                                    <CardTitle className='text-lg'>Domanda</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{card.question}</p>
                                </CardContent>
                            </Card>

                            {checkedAnswers[index] ? (
                                <div className='space-y-4'>
                                    <Card className="bg-destructive/80 text-destructive-foreground">
                                        <CardHeader>
                                            <CardTitle className='text-lg flex items-center gap-2'><X />La tua risposta</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className='opacity-90'>{answerForm.getValues(`answers.${index}.userAnswer`) || "Non hai fornito una risposta."}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className='text-lg flex items-center gap-2'><Check className='text-green-500'/>Risposta corretta</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{card.answer}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-accent/20 border-accent">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <BookOpen className="h-5 w-5 text-accent" />
                                                Spiegazione
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{card.explanation}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <Form {...answerForm}>
                                    <form>
                                        <FormField
                                            control={answerForm.control}
                                            name={`answers.${index}.userAnswer`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>La tua Risposta</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Scrivi qui la tua risposta..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button onClick={() => checkAnswer(index)} className='mt-4'>Verifica Risposta</Button>
                                    </form>
                                </Form>
                            )}
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
                    Crea nuove flashcard
                </Button>
            </div>
        </CardContent>
      )}
       {flashcards && flashcards.length === 0 && !isPending && (
         <CardContent>
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
                <p>L'IA non è riuscita a generare flashcard dal testo fornito.</p>
                 <Button onClick={handleReset} variant="link">Riprova</Button>
            </div>
         </CardContent>
       )}
    </Card>
  );
};

export default FlashcardGenerator;
