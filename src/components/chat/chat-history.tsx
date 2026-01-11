'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Chat } from '@/types/chat';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';

export function ChatHistory() {
  const { chatId } = useParams() as { chatId: string };
  const { user } = useUser();
  const firestore = useFirestore();

  const chatsQuery = useMemoFirebase(
    () => 
      user 
        ? query(
            collection(firestore, `users/${user.uid}/chats`), 
            orderBy('createdAt', 'desc')
          )
        : null,
    [user]
  );
  
  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No recent chats.
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={`/chat/${chat.id}`}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'w-full justify-start',
            chatId === chat.id && 'bg-muted hover:bg-muted'
          )}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          <span className="truncate">{chat.title}</span>
        </Link>
      ))}
    </div>
  );
}
