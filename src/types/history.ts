export interface GeneratedQuiz {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    sourceText: string;
}

export interface GeneratedSummary {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    sourceType: 'text' | 'image';
    sourceText?: string;
}

export interface GeneratedQuestion {
    id: string;
    userId: string;
    createdAt: any; // Firestore Timestamp
    question: string;
    answer: string;
}
