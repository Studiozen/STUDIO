'use client';

import { useMemo } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { FocusSession } from '@/types/focus-session';
import type { Chat } from '@/types/chat';
import type { GeneratedQuiz, GeneratedSummary } from '@/types/history';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Inbox, Timer, MessageSquare, BookOpen, TextQuote, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { format, formatDistanceToNow } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import Link from 'next/link';

type ActivityItem = 
  | ({ type: 'focus'; data: FocusSession })
  | ({ type: 'chat'; data: Chat })
  | ({ type: 'quiz'; data: GeneratedQuiz })
  | ({ type: 'summary'; data: GeneratedSummary });

export function ActivityHistory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();
  const dateFnsLocale = language === 'it' ? it : enUS;

  const focusSessionsQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/focusSessions`), orderBy('startTime', 'desc'), limit(20)) : null, [user, firestore]);
  const chatsQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/chats`), orderBy('createdAt', 'desc'), limit(20)) : null, [user, firestore]);
  const quizzesQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/quizzes`), orderBy('createdAt', 'desc'), limit(20)) : null, [user, firestore]);
  const summariesQuery = useMemoFirebase(() => user ? query(collection(firestore, `users/${user.uid}/summaries`), orderBy('createdAt', 'desc'), limit(20)) : null, [user, firestore]);

  const { data: focusSessions, isLoading: focusLoading } = useCollection<FocusSession>(focusSessionsQuery);
  const { data: chats, isLoading: chatsLoading } = useCollection<Chat>(chatsQuery);
  const { data: quizzes, isLoading: quizzesLoading } = useCollection<GeneratedQuiz>(quizzesQuery);
  const { data: summaries, isLoading: summariesLoading } = useCollection<GeneratedSummary>(summariesQuery);

  const combinedActivity = useMemo((): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    focusSessions?.forEach(s => activities.push({ type: 'focus', data: s }));
    chats?.forEach(c => activities.push({ type: 'chat', data: c }));
    quizzes?.forEach(q => activities.push({ type: 'quiz', data: q }));
    summaries?.forEach(s => activities.push({ type: 'summary', data: s }));
    
    return activities.sort((a, b) => {
      const dateA = a.data.startTime?.toDate?.() || a.data.createdAt?.toDate?.() || new Date(0);
      const dateB = b.data.startTime?.toDate?.() || b.data.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 50); // Limit total items for performance

  }, [focusSessions, chats, quizzes, summaries]);
  
  const isLoading = focusLoading || chatsLoading || quizzesLoading || summariesLoading;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true, locale: dateFnsLocale });
  };
  
  const renderActivityItem = (item: ActivityItem) => {
    let icon, title, description, href;

    switch (item.type) {
      case 'focus':
        icon = <Timer className="h-5 w-5 text-primary" />;
        title = t('profile.history.item.focus.title', { duration: item.data.duration });
        description = formatDate(item.data.startTime);
        break;
      case 'chat':
        icon = <MessageSquare className="h-5 w-5 text-blue-500" />;
        title = t('profile.history.item.chat.title');
        description = `"${item.data.title}"`;
        href = `/chat/${item.data.id}`;
        break;
      case 'quiz':
        icon = <BookOpen className="h-5 w-5 text-green-500" />;
        title = t('profile.history.item.quiz.title');
        description = t('profile.history.item.quiz.description', { text: item.data.sourceText });
        break;
      case 'summary':
        icon = item.data.sourceType === 'image' 
          ? <ImageIcon className="h-5 w-5 text-orange-500" />
          : <TextQuote className="h-5 w-5 text-orange-500" />;
        title = item.data.sourceType === 'image' 
          ? t('profile.history.item.summary.titleImage') 
          : t('profile.history.item.summary.titleText');
        description = item.data.sourceText 
          ? t('profile.history.item.summary.description', { text: item.data.sourceText })
          : '';
        break;
    }
    
    const content = (
        <div className="flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="mt-1">{icon}</div>
            <div className="flex-1">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground truncate">{description}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{formatDate(item.data.createdAt || item.data.startTime)}</p>
            </div>
        </div>
    );
    
    if (href) {
        return <Link href={href} key={`${item.type}-${item.data.id}`}>{content}</Link>;
    }
    return <div key={`${item.type}-${item.data.id}`}>{content}</div>;
  };


  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (combinedActivity.length === 0) {
    return (
        <div className="flex flex-col justify-center items-center h-60 text-center text-muted-foreground">
            <Inbox className="h-10 w-10 mb-2" />
            <p className="font-semibold">{t('profile.history.empty.title')}</p>
            <p className="text-sm">{t('profile.history.empty.description')}</p>
        </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className='space-y-2'>
        {combinedActivity.map(renderActivityItem)}
      </div>
    </ScrollArea>
  );
}
