'use client';

import { useMemo } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSidebar } from '../ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface Chat {
  id: string;
  title: string;
  createdAt: any;
}

export function ChatHistory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { chatId } = useParams() as { chatId: string };
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const chatsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, `users/${user.uid}/chats`),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, user]
  );

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-2 space-y-2">
        {[...Array(5)].map((_, i) => (
          <SidebarMenuSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (chats && chats.length > 0) {
    return (
      <div className="p-2 h-full">
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                asChild
                isActive={chat.id === chatId}
                tooltip={chat.title}
                onClick={handleLinkClick}
              >
                <Link href={`/chat/${chat.id}`}>
                  <MessageSquare />
                  <span>{chat.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    );
  }

  return (
    <div className="p-4 text-center text-sm text-sidebar-foreground/70">
      {t('chat.noConversations')}
    </div>
  );
}
