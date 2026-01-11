'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Flower2, Plus } from 'lucide-react';
import Link from 'next/link';
import { ChatHistory } from './chat-history';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSidebar } from '../ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';

export function ChatSidebar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const { t } = useTranslation();


  const createNewChat = async () => {
    if (!user || !firestore) return;

    setIsCreating(true);
    try {
      const chatRef = await addDoc(
        collection(firestore, `users/${user.uid}/chats`),
        {
          userId: user.uid,
          title: t('chat.newConversationTitle'),
          createdAt: serverTimestamp(),
        }
      );
      if (isMobile) {
        setOpenMobile(false);
      }
      router.push(`/chat/${chatRef.id}`);
    } catch (error) {
      console.error('Error creating new chat:', error);
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
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>

      <SidebarContent className='p-0 flex flex-col'>
        <div className="p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={createNewChat} disabled={isCreating}>
                        <Plus />
                        <span>{t('chat.newChatButton')}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
        <div className="flex-1 overflow-y-auto">
            <h2 className="px-4 text-sm font-semibold text-sidebar-foreground/70 mb-2">
                {t('chat.recentHeader')}
            </h2>
            <ChatHistory />
        </div>
      </SidebarContent>
    </>
  );
}
