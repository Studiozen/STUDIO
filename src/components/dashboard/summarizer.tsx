'use client';

import { useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextQuote, Loader2, Wand2, Clipboard, ClipboardCheck, Send, Sparkles, Image as ImageIcon, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateSummarizationStyles, GenerateSummarizationStylesInput } from '@/ai/flows/generate-summarization-styles';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { askQuestion, AskQuestionInput } from '@/ai/flows/ask-question';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { generateImageSummary, type GenerateImageSummaryInput } from '@/ai/flows/summarize-image-flow';
import Image from 'next/image';
import { useTranslation } from '@/hooks/use-translation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type SummaryStyle = 'concise paragraph' | 'bullet points' | 'key concepts';
type InputMode = 'text' | 'image';
type ActivityToSave = 
  | { type: 'summary'; data: { sourceType: InputMode, sourceText?: string } }
  | { type: 'qa'; data: { question: string, answer: string } };


export default function Summarizer() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();
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

  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [activityToSave, setActivityToSave] = useState<ActivityToSave | null>(null);


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

  const saveSummaryToHistory = async (sourceType: InputMode, sourceText?: string) => {
    if (!user || !firestore) return;
    try {
        const historyData: any = {
            userId: user.uid,
            createdAt: serverTimestamp(),
            sourceType: sourceType,
        };
        if (sourceType === 'text' && sourceText) {
            historyData.sourceText = sourceText.substring(0, 100) + (sourceText.length > 100 ? '...' : '');
        }
        await addDoc(collection(firestore, `users/${user.uid}/summaries`), historyData);
    } catch (error) {
        console.error("Error saving summary to history:", error);
    }
  }

  const saveQuestionToHistory = async (question: string, answer: string) => {
    if (!user || !firestore) return;
    try {
        await addDoc(collection(firestore, `users/${user.uid}/questions`), {
            userId: user.uid,
            createdAt: serverTimestamp(),
            question: question,
            answer: answer.substring(0, 200) + (answer.length > 200 ? '...' : '')
        });
    } catch (error) {
        console.error("Error saving question to history:", error);
    }
  }

  const handleSaveConfirmation = (save: boolean) => {
    if (save && activityToSave) {
        if (activityToSave.type === 'summary') {
            saveSummaryToHistory(activityToSave.data.sourceType, activityToSave.data.sourceText);
        } else if (activityToSave.type === 'qa') {
            saveQuestionToHistory(activityToSave.data.question, activityToSave.data.answer);
        }
    }
    setShowSaveConfirmation(false);
    setActivityToSave(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError(t('summarizer.errors.fileTooLarge'));
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
      setError(t('summarizer.errors.noText'));
      return;
    }
    if (inputMode === 'image' && !imageData) {
        setError(t('summarizer.errors.noImage'));
        return;
    }
    
    setIsCopied(false);

    startTransition(async () => {
        try {
            if (inputMode === 'text') {
                const input: GenerateSummarizationStylesInput = {
                    text,
                    learningStyle: userProfile?.learningStyle,
                    language: language,
                };
                const result = await generateSummarizationStyles(input);
                setSummaries({
                    'concise paragraph': result.conciseParagraph,
                    'bullet points': result.bulletPoints,
                    'key concepts': result.keyConcepts,
                });
                setActivityToSave({ type: 'summary', data: { sourceType: 'text', sourceText: text }});
                setShowSaveConfirmation(true);
            } else if (inputMode === 'image' && imageData) {
                const input: GenerateImageSummaryInput = {
                    imageDataUri: imageData,
                    learningStyle: userProfile?.learningStyle,
                    language: language,
                };
                const result = await generateImageSummary(input);
                setSummaries({
                    'concise paragraph': result.summary,
                    'bullet points': '', // Image summary provides one block of text
                    'key concepts': '',
                });
                setActiveStyle('concise paragraph'); // Default to the only available style
                setActivityToSave({ type: 'summary', data: { sourceType: 'image' }});
                setShowSaveConfirmation(true);
            }
        } catch (e) {
            console.error(e);
            let errorMessage = t('errors.generic.default');
            if (e instanceof Error) {
                if (e.message === 'IMAGE_NO_TEXT') {
                    errorMessage = t('summarizer.errors.imageNoText');
                } else {
                    errorMessage = e.message;
                }
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
      setQAError(t('summarizer.errors.noQuestion'));
      return;
    }

    startQATransition(async () => {
      try {
        const context = text || t('summarizer.qa.noContext');
        const input: AskQuestionInput = { 
          context, 
          question, 
          learningStyle: userProfile?.learningStyle,
          language: language,
        };
        const result = await askQuestion(input);
        setAnswer(result.answer);
        setActivityToSave({ type: 'qa', data: { question, answer: result.answer }});
        setShowSaveConfirmation(true);
      } catch (e) {
        console.error(e);
        let errorMessage = t('errors.generic.default');
        if (e instanceof Error) {
            errorMessage = e.message;
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
    <div className="w-full">
      <div className="space-y-4">
        <Tabs value={inputMode} onValueChange={handleTabChange}>
            <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value="text"><TextQuote className='mr-2'/>{t('summarizer.tabs.text')}</TabsTrigger>
                <TabsTrigger value="image"><ImageIcon className='mr-2'/>{t('summarizer.tabs.image')}</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className='mt-4'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Textarea
                        placeholder={t('summarizer.text.placeholder')}
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
                                <p className='font-semibold'>{t('summarizer.loading')}</p>
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
                            <p>{t('summarizer.outputPlaceholder')}</p>
                        </div>
                        )}
                        {currentSummary && !isPending && (
                            <div className="flex justify-end pt-4">
                                <Button variant="ghost" size="sm" onClick={handleCopy}>
                                {isCopied ? <ClipboardCheck className="mr-2" /> : <Clipboard className="mr-2" />}
                                {isCopied ? t('summarizer.buttons.copied') : t('summarizer.buttons.copy')}
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
                                <Image src={imagePreview} alt={t('summarizer.image.alt')} layout='fill' objectFit='contain' className='rounded-md'/>
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
                                    {t('summarizer.buttons.remove')}
                                </Button>
                            </div>
                        ) : (
                            <div className='text-center'>
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">{t('summarizer.image.uploadTitle')}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{t('summarizer.image.uploadDescription')}</p>
                                <Button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4" disabled={isPending}>
                                    {t('summarizer.buttons.chooseFile')}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="relative flex flex-col rounded-lg border bg-muted/30 p-4 min-h-[300px]">
                        {isPending && (
                            <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2 z-10'>
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className='font-semibold'>{t('summarizer.image.loading')}</p>
                            </div>
                        )}
                        {hasGenerated && currentSummary ? (
                            <div className='prose prose-sm dark:prose-invert max-w-none flex-1'>
                                <p>{currentSummary}</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                                <p>{t('summarizer.image.outputPlaceholder')}</p>
                            </div>
                        )}
                        {currentSummary && !isPending && (
                            <div className="flex justify-end pt-4">
                                <Button variant="ghost" size="sm" onClick={handleCopy}>
                                    {isCopied ? <ClipboardCheck className="mr-2" /> : <Clipboard className="mr-2" />}
                                    {isCopied ? t('summarizer.buttons.copied') : t('summarizer.buttons.copy')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </TabsContent>
        </Tabs>


        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t('errors.generic.title')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {inputMode === 'text' && (
            <Tabs value={activeStyle} onValueChange={handleStyleChange} className="w-full sm:w-auto">
                <TabsList>
                <TabsTrigger value="concise paragraph">{t('summarizer.styles.paragraph')}</TabsTrigger>
                <TabsTrigger value="bullet points">{t('summarizer.styles.bulletPoints')}</TabsTrigger>
                <TabsTrigger value="key concepts">{t('summarizer.styles.keyConcepts')}</TabsTrigger>
                </TabsList>
            </Tabs>
          )}
          <Button onClick={handleSummarize} disabled={isSummarizeDisabled} className="w-full sm:w-auto flex-shrink-0">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('summarizer.buttons.loading')}
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                {hasGenerated ? t('summarizer.buttons.regenerate') : t('summarizer.buttons.summarize')}
              </>
            )}
          </Button>
        </div>
        
        <Separator className='my-6' />
        
        <div className='space-y-4'>
            <div className='space-y-1'>
                <h3 className='font-semibold flex items-center gap-2'><Sparkles className='text-primary'/>{t('summarizer.qa.title')}</h3>
                <p className='text-sm text-muted-foreground'>
                    {t('summarizer.qa.description')}
                </p>
            </div>
            <form onSubmit={handleAskQuestion} className="flex items-start gap-4">
              <Input
                placeholder={t('summarizer.qa.placeholder')}
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
                 <span className="sr-only">{t('summarizer.buttons.send')}</span>
              </Button>
            </form>

            {qaError && (
              <Alert variant="destructive">
                <AlertTitle>{t('errors.qaErrorTitle')}</AlertTitle>
                <AlertDescription>{qaError}</AlertDescription>
              </Alert>
            )}

            {answer && !isQAPending && (
                <div className='prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-4'>
                    <p>{answer}</p>
                </div>
            )}

        </div>

        <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('history.saveDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('history.saveDialog.description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => handleSaveConfirmation(false)}>{t('history.saveDialog.no')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSaveConfirmation(true)}>{t('history.saveDialog.yes')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}
