'use client';

import { ChatSidebar } from '@/components/chat/sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-[calc(100vh-4rem)]">
        <ChatSidebar />
        <main className="flex-1 w-full overflow-y-auto">
            {children}
        </main>
    </div>
  );
}
