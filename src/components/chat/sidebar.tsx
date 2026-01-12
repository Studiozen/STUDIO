'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ChatHistory } from './chat-history';
import { useTranslation } from '@/hooks/use-translation';

export function ChatSidebar() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const createNewChat = async () => {
    if (!user) return;
    try {
      const newChatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
        userId: user.uid,
        createdAt: serverTimestamp(),
        title: t('chat.newChat'),
      });
      router.push(`/chat/${newChatRef.id}`);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  return (
    <div className="w-64 border-r bg-muted/20 p-4 flex flex-col h-full">
      <Button onClick={createNewChat} className="w-full mb-4">
        <Plus className="mr-2 h-4 w-4" />
        {t('chat.newChat')}
      </Button>
      <h2 className="text-lg font-semibold mb-2 px-2">{t('chat.sidebar.recent')}</h2>
      <div className="flex-1 overflow-y-auto">
        <ChatHistory />
      </div>
    </div>
  );
}
