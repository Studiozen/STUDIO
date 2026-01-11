'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  limit,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/chat-message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { chat, type ChatInput } from '@/ai/flows/chat';
import type { MessageData } from 'genkit';
import { useTranslation } from '@/hooks/use-translation';

type ChatMessageEntity = {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: any;
};

export default function ChatPage() {
  const { chatId } = useParams() as { chatId: string };
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(
    () =>
      user && chatId
        ? query(
            collection(firestore, `users/${user.uid}/chats/${chatId}/messages`),
            orderBy('createdAt', 'asc'),
            limit(50)
          )
        : null,
    [firestore, user, chatId]
  );

  const { data: messages, isLoading: isLoadingMessages } =
    useCollection<ChatMessageEntity>(messagesQuery);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  }, [messages, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !firestore || isSending) return;

    const userMessageContent = input;
    setOptimisticUserMessage(userMessageContent); // For optimistic UI update
    setInput('');
    setIsSending(true);
    setError(null);

    const isFirstMessage = !messages || messages.length === 0;

    try {
      // 1. Prepare history for AI
      const history = (messages || []).map((msg) => ({
        role: msg.role,
        content: [{ text: msg.content }],
      }));

      // 2. Call AI flow
      const aiResponse = await chat({
        history,
        message: userMessageContent,
      });

      // 3. Save messages to Firestore
      const batch = writeBatch(firestore);
      const messagesRef = collection(firestore, `users/${user.uid}/chats/${chatId}/messages`);

      // Add user message
      const userMessageRef = doc(messagesRef);
      batch.set(userMessageRef, {
        role: 'user',
        content: userMessageContent,
        createdAt: serverTimestamp(),
      });

      // Add model message
      const modelMessageRef = doc(messagesRef);
      batch.set(modelMessageRef, {
        role: 'model',
        content: aiResponse.message,
        createdAt: serverTimestamp(),
      });
      
      // If it's the first message, update the chat title
      if (isFirstMessage) {
        const chatRef = doc(firestore, `users/${user.uid}/chats/${chatId}`);
        const newTitle = userMessageContent.split(' ').slice(0, 5).join(' ');
        batch.update(chatRef, { title: newTitle });
      }

      await batch.commit();

    } catch (err: any) {
      console.error('Error during chat:', err);
      setError(err.message || 'An error occurred while sending the message.');
      // Revert optimistic update on error
      setInput(userMessageContent);
    } finally {
      setIsSending(false);
      setOptimisticUserMessage(null);
    }
  };

  if (isUserLoading || isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="mx-auto max-w-3xl space-y-6">
          {messages?.length === 0 && !isSending && (
             <div className='flex h-[60vh] flex-col items-center justify-center text-center'>
                <div className='bg-primary/10 p-4 rounded-full'>
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className='mt-4 text-2xl font-bold'>StudioZen Chat</h2>
                <p className='text-muted-foreground'>{t('chat.startConversation')}</p>
             </div>
          )}

          {messages?.map((message) => (
            <ChatMessage key={message.id} role={message.role} content={message.content} />
          ))}

          {isSending && optimisticUserMessage && (
            <>
                <ChatMessage role="user" content={optimisticUserMessage} />
                <ChatMessage role="model" content="" isLoading={true} />
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <form
          onSubmit={handleSendMessage}
          className="mx-auto flex max-w-3xl items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.inputPlaceholder')}
            className="flex-1"
            disabled={isSending}
            autoFocus
          />
          <Button type="submit" disabled={!input.trim() || isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
