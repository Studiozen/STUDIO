'use client';

import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { FocusSession } from '@/types/focus-session';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Inbox } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';

export function FocusSessionHistory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();

  const focusSessionsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, `users/${user.uid}/focusSessions`), orderBy('startTime', 'desc')) : null,
    [user, firestore]
  );
  
  const { data: focusSessions, isLoading } = useCollection<FocusSession>(focusSessionsQuery);
  const datePickerLocale = language === 'it' ? it : enUS;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Timestamps from Firestore can be objects or strings during optimistic updates
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP p', { locale: datePickerLocale });
  };
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!focusSessions || focusSessions.length === 0) {
    return (
        <div className="flex flex-col justify-center items-center h-40 text-center text-muted-foreground">
            <Inbox className="h-10 w-10 mb-2" />
            <p className="font-semibold">{t('profile.history.empty.title')}</p>
            <p className="text-sm">{t('profile.history.empty.description')}</p>
        </div>
    );
  }

  return (
    <ScrollArea className="h-72">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t('profile.history.table.date')}</TableHead>
                    <TableHead className="text-right">{t('profile.history.table.duration')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {focusSessions.map((session) => (
                    <TableRow key={session.id}>
                        <TableCell>{formatDate(session.startTime)}</TableCell>
                        <TableCell className="text-right">{session.duration} {t('profile.history.table.minutes')}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </ScrollArea>
  );
}
