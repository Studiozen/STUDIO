'use client';

import { useState, useTransition, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextQuote, Loader2, Wand2, Clipboard, ClipboardCheck, Send, Sparkles, Image as ImageIcon, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateSummarizationStyles, GenerateSummarizationStylesInput } from '@/ai/flows/generate-summarization-styles';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { askQuestion, AskQuestionInput } from '@/ai/flows/ask-question';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { generateImageSummary, type GenerateImageSummaryInput } from '@/ai/flows/summarize-image-flow';
import Image from 'next/image';

type SummaryStyle = 'concise paragraph' | 'bullet points' | 'key concepts';
type InputMode = 'text' | 'image';

export default function Summarizer() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();
  const [isQAPending, startQATransition] = useTransition();
  
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeStyle, setActiveStyle] = useState<SummaryStyle>('concise paragraph');
  const [summaries, setSummaries] = useState({
    'concise paragraph': '',
    'bullet points': '',
    'key concepts': '',
  });
  const [error, setError] = useState<string | null>(null);
  const [qaError, setQAError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc(userDocRef);

  const resetSummaries = () => {
    setSummaries({
        'concise paragraph': '',
        'bullet points': '',
        'key concepts': '',
    });
    setAnswer('');
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("Il file è troppo grande. La dimensione massima è 4MB.");
        return;
      }
      setError(null);
      resetSummaries();
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSummarize = async () => {
    setError(null);
    resetSummaries();

    if (inputMode === 'text' && !text) {
      setError('Per favore, inserisci del testo da riassumere.');
      return;
    }
    if (inputMode === 'image' && !imageData) {
        setError("Per favore, carica un'immagine da riassumere.");
        return;
    }
    
    setIsCopied(false);

    startTransition(async () => {
        try {
            if (inputMode === 'text') {
                const input: GenerateSummarizationStylesInput = {
                    text,
                    learningStyle: userProfile?.learningStyle,
                };
                const result = await generateSummarizationStyles(input);
                setSummaries({
                    'concise paragraph': result.conciseParagraph,
                    'bullet points': result.bulletPoints,
                    'key concepts': result.keyConcepts,
                });
            } else if (inputMode === 'image' && imageData) {
                const input: GenerateImageSummaryInput = {
                    imageDataUri: imageData,
                    learningStyle: userProfile?.learningStyle,
                };
                const result = await generateImageSummary(input);
                setSummaries({
                    'concise paragraph': result.summary,
                    'bullet points': '', // Image summary provides one block of text
                    'key concepts': '',
                });
                setActiveStyle('concise paragraph'); // Default to the only available style
            }
        } catch (e) {
            console.error(e);
            let errorMessage = "Si è verificato un errore durante la generazione del riassunto. Riprova.";
            if (e instanceof Error && e.message.includes('429')) {
                errorMessage = "Hai effettuato troppe richieste in un breve periodo. Attendi qualche istante e riprova.";
            } else if (e instanceof Error) {
                errorMessage = e.message;
            }
            setError(errorMessage);
        }
    });
  };
  
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setQAError(null);
    setAnswer('');
    
    if (!question) {
      setQAError('Per favore, inserisci una domanda.');
      return;
    }

    startQATransition(async () => {
      try {
        // If there's no main text, use the question itself as the context.
        const context = text || "Nessun contesto testuale fornito.";
        const input: AskQuestionInput = { context, question, learningStyle: userProfile?.learningStyle };
        const result = await askQuestion(input);
        setAnswer(result.answer);
      } catch (e) {
        console.error(e);
        let errorMessage = "Si è verificato un errore during la richiesta. Riprova.";
        if (e instanceof Error && e.message.includes('429')) {
            errorMessage = "Hai effettuato troppe richieste in un breve periodo. Attendi qualche istante e riprova.";
        }
        setQAError(errorMessage);
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

  const handleTabChange = (value: string) => {
    const mode = value as InputMode;
    setInputMode(mode);
    setError(null);
    resetSummaries();
    if (mode === 'text') {
        setImageData(null);
        setImagePreview(null);
    }
  }

  const currentSummary = summaries[activeStyle];
  const hasGenerated = Object.values(summaries).some(s => s);
  const isSummarizeDisabled = isPending || (inputMode === 'text' && !text) || (inputMode === 'image' && !imageData);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TextQuote className="h-6 w-6" />
          Riassunto AI
        </CardTitle>
        <CardDescription>
          Incolla un testo, carica un'immagine o fai domande specifiche all'IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={inputMode} onValueChange={handleTabChange}>
            <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value="text"><TextQuote className='mr-2'/>Testo</TabsTrigger>
                <TabsTrigger value="image"><ImageIcon className='mr-2'/>Immagine</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className='mt-4'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea
                        placeholder="Incolla qui il tuo materiale di studio..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={15}
                        className="w-full"
                        disabled={isPending || isQAPending}
                    />
                    <div className="relative flex flex-col rounded-lg border bg-muted/30 p-4 min-h-[300px]">
                        {isPending && (
                            <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2 z-10'>
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className='font-semibold'>L'IA sta elaborando...</p>
                            </div>
                        )}
                        {hasGenerated && currentSummary ? (
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
            </TabsContent>
            <TabsContent value="image" className='mt-4'>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className='relative flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed border-border min-h-[340px] bg-muted/30 p-4'>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            disabled={isPending}
                        />
                        {imagePreview ? (
                            <div className='relative w-full h-full'>
                                <Image src={imagePreview} alt="Anteprima immagine caricata" layout='fill' objectFit='contain' className='rounded-md'/>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImageData(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute top-2 right-2"
                                    disabled={isPending}
                                >
                                    Rimuovi
                                </Button>
                            </div>
                        ) : (
                            <div className='text-center'>
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Carica un'immagine</h3>
                                <p className="mt-2 text-sm text-muted-foreground">Trascina e rilascia un file o clicca per caricare.</p>
                                <Button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4" disabled={isPending}>
                                    Scegli File
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="relative flex flex-col rounded-lg border bg-muted/30 p-4 min-h-[300px]">
                        {isPending && (
                            <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2 z-10'>
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className='font-semibold'>L'IA sta analizzando l'immagine...</p>
                            </div>
                        )}
                        {hasGenerated && currentSummary ? (
                            <div className='prose prose-sm dark:prose-invert max-w-none flex-1'>
                                <p>{currentSummary}</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                                <p>Il riassunto della tua immagine apparirà qui.</p>
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
            </TabsContent>
        </Tabs>


        {error && (
          <Alert variant="destructive">
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {inputMode === 'text' && (
            <Tabs value={activeStyle} onValueChange={handleStyleChange} className="w-full sm:w-auto">
                <TabsList>
                <TabsTrigger value="concise paragraph">Paragrafo</TabsTrigger>
                <TabsTrigger value="bullet points">Punti Elenco</TabsTrigger>
                <TabsTrigger value="key concepts">Concetti Chiave</TabsTrigger>
                </TabsList>
            </Tabs>
          )}
          <Button onClick={handleSummarize} disabled={isSummarizeDisabled} className="w-full sm:w-auto flex-shrink-0">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                {hasGenerated ? 'Rigenera Riassunto' : 'Riassumi'}
              </>
            )}
          </Button>
        </div>
        
        <Separator className='my-6' />
        
        <div className='space-y-4'>
            <div className='space-y-1'>
                <h3 className='font-semibold flex items-center gap-2'><Sparkles className='text-primary'/>Chiedi all'IA</h3>
                <p className='text-sm text-muted-foreground'>
                    Fai una domanda specifica sul testo che hai incollato sopra. Funziona solo con l'input di testo.
                </p>
            </div>
            <form onSubmit={handleAskQuestion} className="flex items-start gap-4">
              <Input
                placeholder="Scrivi qui la tua domanda..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full"
                disabled={isQAPending || isPending || inputMode === 'image'}
              />
              <Button type="submit" disabled={isQAPending || !question || isPending || inputMode === 'image'}>
                {isQAPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                 <span className="sr-only">Invia</span>
              </Button>
            </form>

            {qaError && (
              <Alert variant="destructive">
                <AlertTitle>Errore Domanda</AlertTitle>
                <AlertDescription>{qaError}</AlertDescription>
              </Alert>
            )}

            {answer && !isQAPending && (
                <div className='prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-4'>
                    <p>{answer}</p>
                </div>
            )}

        </div>

      </CardContent>
    </Card>
  );
}
