'use client';

import { useMemo } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSidebar } from '../ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare } from 'lucide-react';

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
      <SidebarGroup>
        <SidebarGroupLabel>Recenti</SidebarGroupLabel>
        <SidebarGroupContent>
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
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <div className="p-4 text-center text-sm text-sidebar-foreground/70">
      Nessuna conversazione ancora. Iniziane una nuova!
    </div>
  );
}
