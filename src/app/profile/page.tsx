'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import Header from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Brain, Clock, BarChart3, Medal, Trophy, Star } from 'lucide-react';
import { collection } from 'firebase/firestore';
import type { FocusSession } from '@/types/focus-session';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const focusSessionsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/focusSessions`) : null),
    [firestore, user]
  );
  
  const { data: focusSessions, isLoading: isLoadingSessions } = useCollection<FocusSession>(focusSessionsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const studyStats = useMemo(() => {
    if (!focusSessions) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
      };
    }
    const totalMinutes = focusSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    return {
      totalSessions: focusSessions.length,
      totalMinutes: totalMinutes,
    };
  }, [focusSessions]);

  const achievements = useMemo(() => [
    {
      icon: Star,
      title: 'Primi Passi',
      description: 'Completa la tua prima sessione di concentrazione.',
      isUnlocked: studyStats.totalSessions >= 1,
    },
    {
      icon: Medal,
      title: 'Studente Costante',
      description: 'Completa 10 sessioni di concentrazione.',
      isUnlocked: studyStats.totalSessions >= 10,
    },
    {
      icon: Clock,
      title: 'Maratoneta Principiante',
      description: 'Raggiungi 120 minuti totali di studio.',
      isUnlocked: studyStats.totalMinutes >= 120,
    },
    {
      icon: Trophy,
      title: 'Guru della Concentrazione',
      description: 'Raggiungi 600 minuti totali di studio.',
      isUnlocked: studyStats.totalMinutes >= 600,
    },
  ], [studyStats]);


  const formatCreationTime = (creationTime?: string) => {
    if (!creationTime) return 'N/D';
    return new Date(creationTime).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
  }

  if (isUserLoading || !user || isLoadingSessions) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Caricamento in corso...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profilo Utente</CardTitle>
              <CardDescription>Visualizza e gestisci le informazioni del tuo account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                  <AvatarFallback className="text-3xl">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.displayName}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={user.displayName || ''} readOnly />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email || ''} readOnly />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="creationDate">Membro dal</Label>
                    <Input id="creationDate" value={formatCreationTime(user.metadata.creationTime)} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3/>Statistiche di Studio</CardTitle>
              <CardDescription>I tuoi progressi e le tue abitudini di studio.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Sessioni Completate</p>
                        <p className="text-2xl font-bold">{studyStats.totalSessions}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="bg-accent/10 p-3 rounded-full">
                        <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Minuti di Studio Totali</p>
                        <p className="text-2xl font-bold">{studyStats.totalMinutes}</p>
                    </div>
                </div>
            </CardContent>
           </Card>

           <Card>
             <CardHeader>
                <CardTitle>I Miei Riconoscimenti</CardTitle>
                <CardDescription>Sblocca obiettivi e celebra i tuoi successi nello studio.</CardDescription>
             </CardHeader>
             <CardContent className='grid gap-4 sm:grid-cols-2'>
                {achievements.map((achievement, index) => (
                    <div key={index} className={cn("flex items-center gap-4 rounded-lg border p-4 transition-all", achievement.isUnlocked ? 'bg-accent/10' : 'bg-muted/50 opacity-60')}>
                        <div className={cn("p-3 rounded-full", achievement.isUnlocked ? 'bg-accent text-accent-foreground' : 'bg-muted-foreground/20 text-muted-foreground')}>
                            <achievement.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className={cn("font-semibold", achievement.isUnlocked ? 'text-accent-foreground' : 'text-foreground')}>
                                {achievement.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                    </div>
                ))}
             </CardContent>
           </Card>

        </div>
      </main>
    </div>
  );
}
