'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';

export default function NewChatPage() {
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
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">{t('chat.welcome.title')}</h1>
        <p className="text-muted-foreground mb-4">{t('chat.welcome.description')}</p>
        <Button onClick={createNewChat}>
          {t('chat.newChat')}
        </Button>
      </div>
    </div>
  );
}
