'use client';

import { Flower2, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-4', isUser ? 'justify-end' : '')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Flower2 className="h-5 w-5" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {/* We can add markdown support here later if needed */}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
