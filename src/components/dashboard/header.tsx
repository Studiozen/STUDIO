'use client';

import { Flower2, LogOut, MessageSquare, User as UserIcon, History, Timer } from 'lucide-react';
import type { FC } from 'react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { HelpGuide } from './help-guide';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '../language-switcher';
import { useTimer } from '@/context/timer-context';
import { cn } from '@/lib/utils';


const HeaderTimer: FC = () => {
    const { isActive, timeLeft, formatTime, mode } = useTimer();
    const router = useRouter();

    if (!isActive) return null;

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className={cn(
                "hidden sm:flex items-center gap-2 text-sm font-mono",
                mode === 'focus' ? 'text-primary' : 'text-green-500'
            )}
        >
            <Timer className="h-4 w-4" />
            {formatTime(timeLeft)}
        </Button>
    );
};


const Header: FC = () => {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Flower2 className="h-6 w-6 text-primary" />
          <span className="font-headline">StudioZen</span>
        </Link>
        <Link
          href="/chat"
          className="text-foreground transition-colors hover:text-foreground"
        >
          {t('header.chat')}
        </Link>
      </nav>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {!isUserLoading &&
          (user ? (
            <div className='flex items-center gap-4'>
            <HeaderTimer />
            <HelpGuide />
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoURL ?? ''}
                      alt={user.displayName ?? 'User'}
                    />
                    <AvatarFallback>
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{t('header.dropdown.profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history">
                    <History className="mr-2 h-4 w-4" />
                    <span>{t('header.dropdown.history')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('header.dropdown.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-2">
              <HelpGuide />
              <LanguageSwitcher />
              <Button asChild variant="ghost">
                <Link href="/login">{t('header.login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t('header.signup')}</Link>
              </Button>
            </div>
          ))}
      </div>
    </header>
  );
};

export default Header;
