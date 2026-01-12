export interface FocusSession {
    id: string;
    userId: string;
    startTime: string;
    endTime: string;
    duration: number;
    interruptionCount?: number;
  }
  