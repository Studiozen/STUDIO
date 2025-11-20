'use client';

import { useState, useEffect, useRef, useCallback, type FC } from 'react';
import * as Tone from 'tone';
import { Timer, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

const FocusTimer: FC = () => {
  const [minutes, setMinutes] = useState(WORK_MINUTES);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  
  const synthRef = useRef<Tone.Synth | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    synthRef.current = new Tone.Synth().toDestination();
    return () => {
      synthRef.current?.dispose();
    }
  }, []);

  const playSound = useCallback(() => {
    Tone.start().then(() => {
      if (synthRef.current) {
        synthRef.current.triggerAttackRelease(isBreak ? "G4" : "C5", "8n");
      }
    });
  }, [isBreak]);

  const saveFocusSession = useCallback(async () => {
    if (!user || !firestore) return;
    try {
      const sessionData = {
        userId: user.uid,
        startTime: new Date(Date.now() - WORK_MINUTES * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: WORK_MINUTES,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(firestore, `users/${user.uid}/focusSessions`), sessionData);
    } catch (error) {
      console.error("Error saving focus session:", error);
    }
  }, [user, firestore]);

  const resetTimer = useCallback((startBreak: boolean) => {
    setIsActive(false);
    setIsBreak(startBreak);
    setMinutes(startBreak ? BREAK_MINUTES : WORK_MINUTES);
    setSeconds(0);
    
    if (startBreak) { // Completed a work session
      saveFocusSession();
      setIsActive(true); // Automatically start the break
    }
  }, [saveFocusSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          playSound();
          resetTimer(!isBreak);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, minutes, playSound, resetTimer, isBreak]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const handleReset = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(WORK_MINUTES);
    setSeconds(0);
  }
  
  const isTimerRunningOrPaused = isActive || (!isActive && (minutes !== WORK_MINUTES || seconds !== 0) && !isBreak);

  const totalSeconds = (isBreak ? BREAK_MINUTES : WORK_MINUTES) * 60;
  const elapsedSeconds = minutes * 60 + seconds;
  const progress = 100 - (elapsedSeconds / totalSeconds) * 100;

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Timer Concentrazione
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative h-48 w-48 flex flex-col justify-center items-center">
           <p className="text-sm font-semibold uppercase tracking-widest">{isBreak ? 'Pausa' : 'Concentrazione'}</p>
           <p className="text-7xl font-bold font-mono text-center my-2">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button 
            onClick={toggleTimer} 
            size="lg" 
            className="w-28" 
            disabled={isBreak && isActive}
        >
          {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isActive ? 'Pausa' : (minutes === WORK_MINUTES && seconds === 0 && !isBreak) ? 'Avvia' : 'Riprendi'}
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg" disabled={!isTimerRunningOrPaused && !isActive}>
          <RefreshCw />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FocusTimer;
