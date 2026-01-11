'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { Loader2, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/chat/chat-message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { chat } from '@/ai/flows/chat';
import type { MessageData } from 'genkit';

type ChatMessageEntity = {
  role: 'user' | 'model';
  content: string;
  createdAt: any;
};

export default function ChatPage() {
  const { chatId } = useParams() as { chatId: string };
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
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
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !firestore || isSending) return;

    const userMessageContent = input;
    setInput('');
    setIsSending(true);
    setError(null);

    const messagesRef = collection(
      firestore,
      `users/${user.uid}/chats/${chatId}/messages`
    );

    try {
      // 1. Add user's message to Firestore
      await addDoc(messagesRef, {
        role: 'user',
        content: userMessageContent,
        createdAt: serverTimestamp(),
      });

      // 2. Prepare history for AI
      const history: MessageData[] = (messages || []).map((msg) => ({
        role: msg.role,
        content: [{ text: msg.content }],
      }));

      // 3. Call AI flow
      const aiResponse = await chat({
        history: history,
        message: userMessageContent,
      });

      // 4. Add AI's response to Firestore
      await addDoc(messagesRef, {
        role: 'model',
        content: aiResponse.message,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error during chat:', err);
      setError(err.message || 'An error occurred while sending the message.');
      // Optional: Add the user message back to the input
      setInput(userMessageContent);
    } finally {
      setIsSending(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="mx-auto max-w-3xl space-y-6">
          {isLoadingMessages && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
          
          {!isLoadingMessages && messages?.length === 0 && (
             <div className='flex h-[60vh] flex-col items-center justify-center text-center'>
                <div className='bg-primary/10 p-4 rounded-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                </div>
                <h2 className='mt-4 text-2xl font-bold'>StudioZen Chat</h2>
                <p className='text-muted-foreground'>Start a conversation by typing your question below.</p>
             </div>
          )}

          {messages?.map((message, index) => (
            <ChatMessage key={index} role={message.role} content={message.content} />
          ))}

          {isSending && (
            <ChatMessage role="model" content="" isLoading={true} />
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
            placeholder="Ask me anything..."
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
