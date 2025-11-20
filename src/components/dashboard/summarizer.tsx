'use client';

import { useState, useTransition, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, TextQuote, Sparkles } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  text: z.string(),
  style: z.enum(['bullet points', 'concise paragraph', 'key concepts']),
});

const Summarizer: FC = () => {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<GenerateSummarizationStylesOutput | null>(null);
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
    startTransition(async () => {
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

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01] bg-primary text-primary-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TextQuote className="h-5 w-5" />
          Riassunto AI
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
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
                      className="min-h-40 resize-y bg-background/20 placeholder:text-primary-foreground/60"
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
                      <SelectTrigger className="bg-background/20">
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
            <Button type="submit" disabled={isPending} variant="secondary">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Riassumi
            </Button>
          </CardFooter>
        </form>
      </Form>
      {isPending && !summary && (
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-primary-foreground/50 p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm">L'IA sta elaborando il tuo riassunto...</p>
          </div>
        </CardContent>
      )}
      {summary && (
        <CardContent>
          <h3 className="mb-2 text-lg font-semibold font-headline">Riassunto</h3>
          <div className="prose prose-sm max-w-none rounded-md border border-primary-foreground/30 bg-background/20 p-4 whitespace-pre-wrap text-primary-foreground">
            {summary.summary}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default Summarizer;
