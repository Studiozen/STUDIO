'use client';

import { useState, useTransition, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, TextQuote, Sparkles, Volume2 } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { generateSummarizationStyles, type GenerateSummarizationStylesOutput } from '@/ai/flows/generate-summarization-styles';
import { textToSpeech, type TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  text: z.string(),
  style: z.enum(['bullet points', 'concise paragraph', 'key concepts']),
});

const Summarizer: FC = () => {
  const [isSummarizing, startSummarizeTransition] = useTransition();
  const [isFetchingAudio, startAudioTransition] = useTransition();
  const [summary, setSummary] = useState<GenerateSummarizationStylesOutput | null>(null);
  const [audio, setAudio] = useState<TextToSpeechOutput | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      style: 'concise paragraph',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.text.trim().length === 0) {
        toast({
            variant: 'destructive',
            title: 'Testo mancante',
            description: 'Per favore, inserisci il testo da riassumere.'
        });
        return;
    }
    setSummary(null);
    setAudio(null);
    startSummarizeTransition(async () => {
      const result = await generateSummarizationStyles(values);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Errore',
          description: result.error,
        });
        return;
      }
      setSummary(result);
    });
  }

  function onListen() {
    if (!summary?.summary) return;
    setAudio(null);
    startAudioTransition(async () => {
        const result = await textToSpeech({ text: summary.summary });
        if('error' in result) {
            toast({
                variant: 'destructive',
                title: 'Errore Audio',
                description: "Impossibile generare l'audio."
            })
            return;
        }
        setAudio(result);
    });
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TextQuote className="h-5 w-5" />
          Riassunto AI
        </CardTitle>
        <CardDescription>
          Incolla il tuo materiale di studio e scegli uno stile di riassunto.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materiale di Studio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Incolla il tuo testo qui..."
                      className="min-h-40 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stile di Riassunto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona uno stile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="concise paragraph">Paragrafo Conciso</SelectItem>
                      <SelectItem value="bullet points">Punti Elenco</SelectItem>
                      <SelectItem value="key concepts">Concetti Chiave</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSummarizing}>
              {isSummarizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Riassumi
            </Button>
          </CardFooter>
        </form>
      </Form>
      {isSummarizing && !summary && (
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm">L'IA sta elaborando il tuo riassunto...</p>
          </div>
        </CardContent>
      )}
      {summary && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-headline">Riassunto</h3>
            <Button onClick={onListen} variant="outline" size="sm" disabled={isFetchingAudio}>
                {isFetchingAudio ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Volume2 className="mr-2 h-4 w-4" />
                )}
                Ascolta
            </Button>
          </div>
          <div className="prose prose-sm max-w-none rounded-md border bg-muted p-4 whitespace-pre-wrap">
            {summary.summary}
          </div>
          {isFetchingAudio && !audio && (
             <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Creazione audio in corso...</p>
            </div>
          )}
          {audio?.audio && (
            <div>
                <audio controls src={audio.audio} className="w-full">
                    Il tuo browser non supporta l'elemento audio.
                </audio>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default Summarizer;
