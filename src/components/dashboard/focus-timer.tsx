'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useTimer } from '@/context/timer-context';

export default function FocusTimer() {
  const { t } = useTranslation();
  const {
    mode,
    timeLeft,
    isActive,
    toggleTimer,
    resetTimer,
    formatTime,
    progress,
    FOCUS_DURATION,
    BREAK_DURATION,
  } = useTimer();

  const totalDuration = mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Timer className="h-6 w-6" />
            {t('focusTimer.title')}
        </CardTitle>
        <CardDescription>{t('focusTimer.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <div className={`text-6xl font-bold font-mono ${mode === 'focus' ? 'text-primary' : 'text-green-500'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="w-full space-y-2">
            <Progress value={progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{mode === 'focus' ? t('focusTimer.mode.focus') : t('focusTimer.mode.break')}</span>
                <span>{mode === 'focus' ? '25 min' : '5 min'}</span>
            </div>
        </div>
        <div className="flex w-full gap-2">
          <Button onClick={toggleTimer} className="flex-1">
            {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isActive ? t('focusTimer.buttons.pause') : t('focusTimer.buttons.start')}
          </Button>
          <Button onClick={resetTimer} variant="outline" aria-label={t('focusTimer.buttons.resetAriaLabel')}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
            {mode === 'focus' ? t('focusTimer.footer.focus') : t('focusTimer.footer.break')}
        </p>
      </CardContent>
    </Card>
  );
}
