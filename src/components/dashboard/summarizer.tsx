'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextQuote, Loader2, Wand2, Clipboard, ClipboardCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateSummarizationStyles, GenerateSummarizationStylesInput } from '@/ai/flows/generate-summarization-styles';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

type SummaryStyle = 'bullet points' | 'concise paragraph' | 'key concepts';

export default function Summarizer() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');
  const [activeStyle, setActiveStyle] = useState<SummaryStyle>('concise paragraph');
  const [summaries, setSummaries] = useState<Record<SummaryStyle, string | null>>({
    'concise paragraph': null,
    'bullet points': null,
    'key concepts': null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc(userProfile);


  const handleSummarize = async () => {
    setError(null);
    if (!text) {
      setError('Per favore, inserisci del testo da riassumere.');
      return;
    }
    
    setIsCopied(false);

    startTransition(async () => {
        try {
            const input: GenerateSummarizationStylesInput = {
                text,
                style: activeStyle,
                learningStyle: userProfile?.learningStyle,
            };
            const result = await generateSummarizationStyles(input);
            setSummaries(prev => ({ ...prev, [activeStyle]: result.summary }));
        } catch (e) {
            console.error(e);
            setError("Si è verificato un errore durante la generazione del riassunto. Riprova.");
        }
    });
  };

  const handleCopy = () => {
    const currentSummary = summaries[activeStyle];
    if (currentSummary) {
      navigator.clipboard.writeText(currentSummary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleStyleChange = (style: string) => {
    setActiveStyle(style as SummaryStyle);
    setIsCopied(false);
  }

  const currentSummary = summaries[activeStyle];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TextQuote className="h-6 w-6" />
          Riassunto AI
        </CardTitle>
        <CardDescription>
          Incolla un testo e ottieni un riassunto intelligente in diversi stili.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            placeholder="Incolla qui il tuo materiale di studio..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={15}
            className="w-full"
            disabled={isPending}
          />
          <div className="relative flex flex-col rounded-lg border bg-muted/30 p-4 min-h-[300px]">
            {isPending && (
                <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2 z-10'>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className='font-semibold'>L'IA sta elaborando...</p>
                </div>
            )}
            {currentSummary ? (
              <div className='prose prose-sm dark:prose-invert max-w-none flex-1'>
                {activeStyle === 'bullet points' ? (
                     <ul className="list-disc pl-5 space-y-1">
                        {currentSummary.split(/(\r\n|\n)-/).filter(s => s.trim() && s.trim() !== '-').map((item, index) => (
                           <li key={index}>{item.replace(/^-/, '').trim()}</li>
                        ))}
                     </ul>
                ) : (
                    <p>{currentSummary}</p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                <p>Il tuo riassunto apparirà qui.</p>
              </div>
            )}
             {currentSummary && !isPending && (
                <div className="flex justify-end pt-4">
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {isCopied ? <ClipboardCheck className="mr-2" /> : <Clipboard className="mr-2" />}
                    {isCopied ? 'Copiato!' : 'Copia'}
                    </Button>
                </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Tabs value={activeStyle} onValueChange={handleStyleChange} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="concise paragraph">Paragrafo</TabsTrigger>
              <TabsTrigger value="bullet points">Punti Elenco</TabsTrigger>
              <TabsTrigger value="key concepts">Concetti Chiave</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleSummarize} disabled={isPending || !text} className="w-full sm:w-auto">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                {summaries[activeStyle] ? 'Rigenera' : 'Riassumi'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
