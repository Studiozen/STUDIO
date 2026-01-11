'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Flower2, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChatHistory } from './chat-history';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ChatSidebar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createNewChat = async () => {
    if (!user || !firestore) return;

    setIsCreating(true);
    try {
      const chatRef = await addDoc(collection(firestore, `users/${user.uid}/chats`), {
        userId: user.uid,
        title: 'New Conversation',
        createdAt: serverTimestamp(),
      });
      router.push(`/chat/${chatRef.id}`);
    } catch (error) {
      console.error('Error creating new chat:', error);
      // Optionally, show a toast notification for the error
    } finally {
      setIsCreating(false);
    }
  };


  return (
    <>
      <SidebarHeader className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base text-sidebar-foreground"
        >
          <Flower2 className="h-6 w-6 text-primary" />
          <span className="font-headline">StudioZen</span>
        </Link>
        <SidebarTrigger className="md:hidden"/>
      </SidebarHeader>
      <div className='p-2'>
        <Button onClick={createNewChat} disabled={isCreating} className='w-full'>
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <SidebarContent>
        <ChatHistory />
      </SidebarContent>
    </>
  );
}
