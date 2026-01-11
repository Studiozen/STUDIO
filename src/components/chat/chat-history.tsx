'use client';

import { useMemo } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, MessageSquare, Plus } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSkeleton } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useIsMobile, useSidebar } from '../ui/sidebar';

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
        ? query(collection(firestore, `users/${user.uid}/chats`), orderBy('createdAt', 'desc'))
        : null,
    [firestore, user]
  );
  
  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  const handleLinkClick = () => {
    if (isMobile) {
        setOpenMobile(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
        {isLoading ? (
            <div className='p-2 space-y-2'>
                {[...Array(5)].map((_, i) => (
                    <SidebarMenuSkeleton key={i} />
                ))}
            </div>
        ) : chats && chats.length > 0 ? (
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
        ) : (
            <div className="p-4 text-center text-sm text-sidebar-foreground/70">
                No conversations yet. Start a new one!
            </div>
        )}
    </div>
  );
}
