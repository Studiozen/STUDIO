'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

type TimerMode = 'focus' | 'break';

interface TimerContextType {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  progress: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
  FOCUS_DURATION: number;
  BREAK_DURATION: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);

  const timerId = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio only on the client side
    audioRef.current = new Audio('/sounds/timer-end.mp3');
  }, []);

  const playNotificationSound = useCallback(() => {
    audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
  }, []);

  const saveFocusSession = useCallback(async (durationSeconds: number) => {
    if (user && firestore) {
      try {
        await addDoc(collection(firestore, `users/${user.uid}/focusSessions`), {
          userId: user.uid,
          startTime: serverTimestamp(),
          endTime: serverTimestamp(),
          duration: Math.round(durationSeconds / 60), // in minutes
        });
      } catch (error) {
        console.error("Error saving focus session:", error);
      }
    }
  }, [user, firestore]);

  useEffect(() => {
    if (isActive) {
      timerId.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            playNotificationSound();
            if (mode === 'focus') {
              saveFocusSession(FOCUS_DURATION);
              setMode('break');
              return BREAK_DURATION;
            } else {
              setMode('focus');
              return FOCUS_DURATION;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    }

    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, [isActive, mode, playNotificationSound, saveFocusSession]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (timerId.current) clearInterval(timerId.current);
    setIsActive(false);
    setMode('focus');
    setTimeLeft(FOCUS_DURATION);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const value = {
    mode,
    timeLeft,
    isActive,
    progress,
    toggleTimer,
    resetTimer,
    formatTime,
    FOCUS_DURATION,
    BREAK_DURATION,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
