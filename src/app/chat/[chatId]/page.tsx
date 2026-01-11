'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Flower2 } from 'lucide-radix';
import { ChatMessage as ChatMessageType, Chat } from '@/types/chat';
import { ChatMessage } from '@/components/chat/chat-message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { chat as callChatApi } from '@/ai/flows/chat';
import { useTranslation } from '@/hooks/use-translation';

export default function ChatPage() {
  const { chatId } = useParams() as { chatId: string };
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc(userDocRef);

  const messagesQuery = useMemoFirebase(
    () => user ? query(collection(firestore, `users/${user.uid}/chats/${chatId}/messages`), orderBy('createdAt', 'asc')) : null,
    [user, chatId]
  );

  const { data: messages, isLoading: messagesLoading } = useCollection<ChatMessageType>(messagesQuery);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isSending]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    setIsSending(true);
    setError(null);
    const userMessageContent = inputValue;
    setInputValue('');

    try {
      const isFirstMessage = messages?.length === 0;

      // 1. Save user message
      const userMessage = {
        chatId,
        role: 'user' as const,
        content: userMessageContent,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(firestore, `users/${user.uid}/chats/${chatId}/messages`), userMessage);
      
      // 2. If it's the first message, update the chat title
      if (isFirstMessage) {
        const chatRef = doc(firestore, `users/${user.uid}/chats/${chatId}`);
        await updateDoc(chatRef, {
            title: userMessageContent.substring(0, 50) + (userMessageContent.length > 50 ? '...' : '')
        });
      }

      // 3. Call AI for response
      const history = messages?.map(m => ({ role: m.role, content: m.content })) || [];
      const aiResponse = await callChatApi({ 
        history, 
        message: userMessageContent,
        learningStyle: userProfile?.learningStyle,
        language: language,
      });

      // 4. Save AI message
      const modelMessage = {
        chatId,
        role: 'model' as const,
        content: aiResponse.message,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(firestore, `users/${user.uid}/chats/${chatId}/messages`), modelMessage);

    } catch (err) {
      console.error('Error in chat flow:', err);
      setError(t('chat.errors.description'));
    } finally {
      setIsSending(false);
    }
  };

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messagesLoading && !hasMessages && (
             <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        )}
        {!messagesLoading && !hasMessages && !isSending && (
            <div className="flex h-full items-center justify-center">
                <div className="text-center p-4 rounded-lg">
                    <Flower2 className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-2xl font-semibold">{t('chat.welcome.title')}</h2>
                </div>
            </div>
        )}
        {hasMessages && messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isSending && (
            <ChatMessage message={{ id: 'temp-user', role: 'user', content: inputValue, chatId, createdAt: new Date() }} />
        )}
        {isSending && (
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Flower2 className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2 pt-1.5">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">{t('chat.loading')}</p>
            </div>
          </div>
        )}
         {error && (
            <Alert variant="destructive">
                <AlertTitle>{t('chat.errors.title')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </div>

      <div className="border-t bg-background p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('chat.form.placeholder')}
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || !inputValue.trim()} size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">{t('chat.form.send')}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
