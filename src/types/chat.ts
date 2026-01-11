export interface Chat {
  id: string;
  userId: string;
  createdAt: any; // Typically a Firestore Timestamp
  title: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: any; // Typically a Firestore Timestamp
}
