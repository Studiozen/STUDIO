export interface Flashcard {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export interface GeneratedQuiz {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    sourceText: string;
    flashcards: Flashcard[];
}

export interface GeneratedSummary {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    sourceType: 'text' | 'image';
    sourceText?: string;
    summary: string;
}

export interface GeneratedQuestion {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    question: string;
    answer: string;
}

    