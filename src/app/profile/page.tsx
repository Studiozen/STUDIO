'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import Header from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Brain, Clock, BarChart3, Medal, Trophy, Star, GraduationCap, Accessibility, History } from 'lucide-react';
import { collection, doc, Timestamp } from 'firebase/firestore';
import type { FocusSession } from '@/types/focus-session';
import { cn } from '@/lib/utils';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useTranslation } from '@/hooks/use-translation';
import { ActivityHistory } from '@/components/profile/activity-history';

interface UserProfile {
    schoolType?: string;
    learningStyle?: string;
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

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
      title: t('profile.achievements.firstSteps.title'),
      description: t('profile.achievements.firstSteps.description'),
      isUnlocked: studyStats.totalSessions >= 1,
    },
    {
      icon: Medal,
      title: t('profile.achievements.consistentStudent.title'),
      description: t('profile.achievements.consistentStudent.description'),
      isUnlocked: studyStats.totalSessions >= 10,
    },
    {
      icon: Clock,
      title: t('profile.achievements.beginnerMarathoner.title'),
      description: t('profile.achievements.beginnerMarathoner.description'),
      isUnlocked: studyStats.totalMinutes >= 120,
    },
    {
      icon: Trophy,
      title: t('profile.achievements.focusGuru.title'),
      description: t('profile.achievements.focusGuru.description'),
      isUnlocked: studyStats.totalMinutes >= 600,
    },
  ], [studyStats, t]);


  const formatTimestamp = (timestamp?: Timestamp | string) => {
    if (!timestamp) return 'N/A';
    try {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate();
        return date.toLocaleString(t('locale'), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'N/A'
    }
  }

  const getSchoolTypeLabel = (schoolType?: string) => {
      if (!schoolType) return t('profile.form.unspecified');
      return t(`profile.form.schoolType.options.${schoolType}`);
  }

  const getLearningStyleLabel = (learningStyle?: string) => {
      if (!learningStyle) return t('profile.form.unspecified');
      return t(`profile.form.learningStyle.options.${learningStyle}`);
  }

  if (isUserLoading || !user || isLoadingSessions || isProfileLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>{t('profile.loading')}</p>
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
              <CardTitle>{t('profile.userProfile.title')}</CardTitle>
              <CardDescription>{t('profile.userProfile.description')}</CardDescription>
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
                    <Label htmlFor="name">{t('profile.form.name.label')}</Label>
                    <Input id="name" value={user.displayName || ''} readOnly />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.form.email.label')}</Label>
                    <Input id="email" value={user.email || ''} readOnly />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="creationDate">{t('profile.form.memberSince.label')}</Label>
                    <Input id="creationDate" value={formatTimestamp(user.metadata.creationTime)} readOnly />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="schoolType" className='flex items-center gap-2'><GraduationCap className='w-4 h-4'/>{t('profile.form.schoolType.label')}</Label>
                    <Input id="schoolType" value={getSchoolTypeLabel(userProfile?.schoolType)} readOnly />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="learningStyle" className='flex items-center gap-2'><Accessibility className='w-4 h-4'/>{t('profile.form.learningStyle.label')}</Label>
                    <Input id="learningStyle" value={getLearningStyleLabel(userProfile?.learningStyle)} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History/>{t('profile.history.title')}</CardTitle>
                <CardDescription>{t('profile.history.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ActivityHistory />
            </CardContent>
           </Card>

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3/>{t('profile.studyStats.title')}</CardTitle>
              <CardDescription>{t('profile.studyStats.description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('profile.studyStats.sessionsCompleted')}</p>
                        <p className="text-2xl font-bold">{studyStats.totalSessions}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="bg-accent/10 p-3 rounded-full">
                        <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('profile.studyStats.totalMinutes')}</p>
                        <p className="text-2xl font-bold">{studyStats.totalMinutes}</p>
                    </div>
                </div>
            </CardContent>
           </Card>

           <Card>
             <CardHeader>
                <CardTitle>{t('profile.achievements.title')}</CardTitle>
                <CardDescription>{t('profile.achievements.description')}</CardDescription>
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
