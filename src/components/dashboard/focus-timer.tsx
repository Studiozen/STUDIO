'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, Coffee, Play, Pause, RotateCcw } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

type TimerMode = 'focus' | 'break';

export default function FocusTimer() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Client-side only
    audioRef.current = new Audio('/sounds/timer-end.mp3');
  }, []);


  useEffect(() => {
    if (isActive) {
      timerId.current = setInterval(() => {
        setTimeLeft((prevTime) => {
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
  }, [isActive, mode]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const saveFocusSession = async (durationSeconds: number) => {
    if (user && firestore) {
      try {
        const sessionData = {
          userId: user.uid,
          startTime: serverTimestamp(),
          endTime: serverTimestamp(), // This will be the same as startTime, but Firestore updates it
          duration: Math.round(durationSeconds / 60), // duration in minutes
        };
        await addDoc(collection(firestore, `users/${user.uid}/focusSessions`), sessionData);
      } catch (error) {
        console.error("Error saving focus session: ", error);
      }
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Timer className="h-6 w-6" />
            Timer Concentrazione
        </CardTitle>
        <CardDescription>Usa la tecnica del Pomodoro per studiare meglio.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <div className={`text-6xl font-bold font-mono ${mode === 'focus' ? 'text-primary' : 'text-green-500'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="w-full space-y-2">
            <Progress value={progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{mode === 'focus' ? 'Concentrazione' : 'Pausa'}</span>
                <span>{mode === 'focus' ? '25 min' : '5 min'}</span>
            </div>
        </div>
        <div className="flex w-full gap-2">
          <Button onClick={toggleTimer} className="flex-1">
            {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isActive ? 'Pausa' : 'Avvia'}
          </Button>
          <Button onClick={resetTimer} variant="outline" aria-label="Reset timer">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
            {mode === 'focus' ? "Resta concentrato per 25 minuti." : "Fai una breve pausa di 5 minuti."}
        </p>
      </CardContent>
    </Card>
  );
}
