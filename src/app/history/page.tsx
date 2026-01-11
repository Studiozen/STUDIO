'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import type { FocusSession } from '@/types/focus-session';
import type { Chat } from '@/types/chat';
import type { GeneratedQuiz, GeneratedSummary, GeneratedQuestion } from '@/types/history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, Inbox, Timer, MessageSquare, BookOpen, TextQuote, Image as ImageIcon, HelpCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/dashboard/header';
import { useTranslation } from '@/hooks/use-translation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ActivityItem = 
  | ({ type: 'focus'; data: FocusSession })
  | ({ type: 'chat'; data: Chat })
  | ({ type: 'quiz'; data: GeneratedQuiz })
  | ({ type: 'summary'; data: GeneratedSummary })
  | ({ type: 'question'; data: GeneratedQuestion });
  
type ActivityType = ActivityItem['type'];

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();
  const dateFnsLocale = language === 'it' ? it : enUS;

  const focusSessionsQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/focusSessions`), orderBy('startTime', 'desc'), limit(50)) : null, [user, firestore]);
  const chatsQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/chats`), orderBy('createdAt', 'desc'), limit(50)) : null, [user, firestore]);
  const quizzesQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/quizzes`), orderBy('createdAt', 'desc'), limit(50)) : null, [user, firestore]);
  const summariesQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/summaries`), orderBy('createdAt', 'desc'), limit(50)) : null, [user, firestore]);
  const questionsQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/questions`), orderBy('createdAt', 'desc'), limit(50)) : null, [user, firestore]);

  const { data: focusSessions, isLoading: focusLoading } = useCollection<FocusSession>(focusSessionsQuery);
  const { data: chats, isLoading: chatsLoading } = useCollection<Chat>(chatsQuery);
  const { data: quizzes, isLoading: quizzesLoading } = useCollection<GeneratedQuiz>(quizzesQuery);
  const { data: summaries, isLoading: summariesLoading } = useCollection<GeneratedSummary>(summariesQuery);
  const { data: questions, isLoading: questionsLoading } = useCollection<GeneratedQuestion>(questionsQuery);
  
  const getDate = (item: ActivityItem): Date => {
    let timestamp: any;
    if (item.type === 'focus') {
      timestamp = item.data.startTime;
    } else {
      timestamp = item.data.createdAt;
    }
  
    if (!timestamp) return new Date(0);
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) return date;
    }
    if (typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp) {
       try { return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate(); } catch (e) { return new Date(0); }
    }
    return new Date(0);
  };

  const combinedActivity = useMemo((): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    (focusSessions || []).forEach(s => activities.push({ type: 'focus', data: s }));
    (chats || []).forEach(c => c.title !== t('chat.newChat') && activities.push({ type: 'chat', data: c }));
    (quizzes || []).forEach(q => activities.push({ type: 'quiz', data: q }));
    (summaries || []).forEach(s => activities.push({ type: 'summary', data: s }));
    (questions || []).forEach(q => activities.push({ type: 'question', data: q }));
    
    return activities.sort((a, b) => {
        const dateA = getDate(a);
        const dateB = getDate(b);
        if (dateA.getTime() === 0) return 1;
        if (dateB.getTime() === 0) return -1;
        return dateB.getTime() - dateA.getTime();
    }).slice(0, 100);

  }, [focusSessions, chats, quizzes, summaries, questions, t]);
  
  const isLoading = isUserLoading || focusLoading || chatsLoading || quizzesLoading || summariesLoading || questionsLoading;

  const formatDate = (item: ActivityItem) => {
    const date = getDate(item);
     if (date.getTime() === 0) return t('history.item.justNow');
    try { return formatDistanceToNow(date, { addSuffix: true, locale: dateFnsLocale }); } catch(e) { return t('history.item.justNow'); }
  };
  
  const renderActivityItem = (item: ActivityItem) => {
    let icon, title, description, href;
    const id = item.data.id;

    switch (item.type) {
      case 'focus':
        icon = <Timer className="h-5 w-5 text-primary" />;
        title = t('history.item.focus.title', { duration: item.data.duration });
        description = formatDate(item);
        break;
      case 'chat':
        icon = <MessageSquare className="h-5 w-5 text-blue-500" />;
        title = t('history.item.chat.title');
        description = `"${item.data.title}"`;
        break;
      case 'quiz':
        icon = <BookOpen className="h-5 w-5 text-green-500" />;
        title = t('history.item.quiz.title');
        description = t('history.item.quiz.description', { text: item.data.sourceText });
        if (id) href = `/quizzes/${id}`;
        break;
      case 'summary':
        icon = item.data.sourceType === 'image' 
          ? <ImageIcon className="h-5 w-5 text-orange-500" />
          : <TextQuote className="h-5 w-5 text-orange-500" />;
        title = item.data.sourceType === 'image' 
          ? t('history.item.summary.titleImage') 
          : t('history.item.summary.titleText');
        description = item.data.sourceText 
          ? t('history.item.summary.description', { text: item.data.sourceText })
          : item.data.summary;
        if (id) href = `/summaries/${id}`;
        break;
      case 'question':
        icon = <HelpCircle className="h-5 w-5 text-purple-500" />;
        title = t('history.item.question.title');
        description = t('history.item.question.description', { question: item.data.question });
        if (id) href = `/questions/${id}`;
        break;
    }
    
    const itemKey = `${item.type}-${id || (item.data as any).startTime?.toString() || Math.random()}`;

    const content = (
        <div className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
            <div className="mt-1">{icon}</div>
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground truncate">{description}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{formatDate(item)}</p>
            </div>
            {href && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
    );
    
    if (href) {
        return <Link href={href} key={itemKey} className='block'>{content}</Link>
    }
    return <div key={itemKey}>{content}</div>;
  };
  
  const ActivityList = ({ items }: { items: ActivityItem[] }) => {
    if (items.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-60 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 mb-2" />
                <p className="font-semibold">{t('history.empty.title')}</p>
                <p className="text-sm">{t('history.empty.description')}</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[60vh]">
            <div className='space-y-2'>
                {items.map(renderActivityItem)}
            </div>
        </ScrollArea>
    )
  }

  const filteredActivities = (type: ActivityType) => combinedActivity.filter(item => item.type === type);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-2xl">
          <Button asChild variant="outline" className="mb-4">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('history.backToProfile')}
              </Link>
          </Button>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">{t('history.pageTitle')}</CardTitle>
                <CardDescription>{t('history.pageDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="flex justify-center items-center h-60">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                   <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">{t('history.tabs.all')}</TabsTrigger>
                        <TabsTrigger value="summary">{t('history.tabs.summaries')}</TabsTrigger>
                        <TabsTrigger value="quiz">{t('history.tabs.quizzes')}</TabsTrigger>
                        <TabsTrigger value="question">{t('history.tabs.questions')}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-4">
                        <ActivityList items={combinedActivity} />
                      </TabsContent>
                       <TabsContent value="summary" className="mt-4">
                        <ActivityList items={filteredActivities('summary')} />
                      </TabsContent>
                      <TabsContent value="quiz" className="mt-4">
                        <ActivityList items={filteredActivities('quiz')} />
                      </TabsContent>
                      <TabsContent value="question" className="mt-4">
                        <ActivityList items={filteredActivities('question')} />
                      </TabsContent>
                   </Tabs>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    