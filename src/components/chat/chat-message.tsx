'use client';

import { User as UserIcon, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

interface ChatMessageProps {
  role: 'user' | 'model';
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const { user } = useUser();

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const isModel = role === 'model';

  return (
    <div
      className={cn(
        'flex items-start gap-4',
        isModel ? '' : 'flex-row-reverse'
      )}
    >
      <Avatar className={cn('h-8 w-8', isModel ? '' : 'bg-primary text-primary-foreground')}>
        {isModel ? (
          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5"/>
          </div>
        ) : (
          <>
            <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={cn(
          'max-w-[75%] rounded-lg p-3 text-sm',
          isModel ? 'bg-muted' : 'bg-primary text-primary-foreground'
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.1s' }}></span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.2s' }}></span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" style={{ animationDelay: '0.3s' }}></span>
          </div>
        ) : (
          <div className="prose prose-sm prose-p:leading-normal dark:prose-invert max-w-none break-words">
            {content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
