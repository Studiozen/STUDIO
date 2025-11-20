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
import { summarizeStudyMaterial, type SummarizeStudyMaterialOutput } from '@/ai/flows/summarize-study-material';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  text: z.string(),
  style: z.enum(['concise', 'detailed', 'keywords', 'bullet-points']),
});

const Summarizer: FC = () => {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<SummarizeStudyMaterialOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      style: 'concise',
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
      const result = await summarizeStudyMaterial(values);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TextQuote className="h-5 w-5" />
          Riassunto AI
        </CardTitle>
        <CardDescription>
          Incolla il tuo materiale di studio qui sotto per ottenere un riassunto veloce.
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
                      <SelectItem value="concise">Conciso</SelectItem>
                      <SelectItem value="detailed">Dettagliato</SelectItem>
                      <SelectItem value="keywords">Parole Chiave</SelectItem>
                      <SelectItem value="bullet-points">Schema a punti</SelectItem>
                    </SelectContent>
                  </Select>
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
              Riassumi
            </Button>
          </CardFooter>
        </form>
      </Form>
      {isPending && !summary && (
        <CardContent>
          <div className="flex items-center justify-center rounded-md border border-dashed p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      )}
      {summary && (
        <CardContent>
          <h3 className="mb-2 text-lg font-semibold font-headline">Riassunto</h3>
          <div className="prose prose-sm max-w-none rounded-md border bg-muted/50 p-4 whitespace-pre-wrap">
            {summary.summary}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default Summarizer;
