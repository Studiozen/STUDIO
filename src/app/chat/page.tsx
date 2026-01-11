'use client';

import { Sparkles } from "lucide-react";

export default function ChatRootPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block rounded-full bg-primary/10 p-4">
           <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Welcome to StudioZen Chat</h1>
        <p className="mt-2 text-muted-foreground">
          Select a conversation or start a new one to begin.
        </p>
      </div>
    </div>
  );
}
