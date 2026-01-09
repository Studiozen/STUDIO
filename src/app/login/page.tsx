'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Flower2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.83 0-6.95-3.12-6.95-6.95s3.12-6.95 6.95-6.95c2.21 0 3.66.86 4.5 1.68l2.54-2.54C18.15 2.09 15.65 1 12.48 1 7.22 1 3.23 4.93 3.23 10.18s3.99 9.18 9.25 9.18c5.03 0 8.35-3.4 8.35-8.53 0-.61-.05-1.22-.16-1.82z"
      fill="currentColor"
    />
  </svg>
);

export default function LoginPage() {
  const { t } = useTranslation();
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');
  
  const formSchema = z.object({
    email: z.string().email({ message: t('login.form.email.invalid') }),
    password: z
      .string()
      .min(1, { message: t('login.form.password.required') }),
  });

  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const checkIpAndProceed = async (user: User, isNewUser = false) => {
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        const userDocRef = doc(firestore, 'users', user.uid);

        if (isNewUser) {
            // New user, set authorizedIp
            await setDoc(userDocRef, {
                id: user.uid,
                name: user.displayName,
                email: user.email,
                authorizedIp: ip,
                lastLoginIp: ip,
                lastLoginTimestamp: serverTimestamp()
            }, { merge: true });
            return true;
        }

        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.authorizedIp) {
                if (userData.authorizedIp !== ip) {
                    // IP mismatch, block login
                    await auth.signOut(); // Force sign out for security
                    toast({
                        variant: 'destructive',
                        title: t('login.toast.error.title'),
                        description: t('login.toast.error.ipMismatch'),
                    });
                    return false;
                }
            } else {
                // authorizedIp not set, so set it on first login
                await updateDoc(userDocRef, { authorizedIp: ip });
            }
        }
        
        // IP is valid, update login info
        await updateDoc(userDocRef, {
            lastLoginIp: ip,
            lastLoginTimestamp: serverTimestamp()
        });

        return true;

    } catch (error) {
        console.error("IP check/update failed:", error);
        // In case of IP check failure, we block login to be safe
        await auth.signOut();
        toast({
            variant: 'destructive',
            title: t('login.toast.error.title'),
            description: t('login.toast.error.ipCheckFailed'),
        });
        return false;
    }
  }


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      const canProceed = await checkIpAndProceed(user);

      if (canProceed) {
          toast({
            title: t('login.toast.success.title'),
            description: t('login.toast.success.description', { name: user.displayName || 'user' }),
            duration: 3000,
          });
          router.push('/');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      let description = t('login.toast.error.default');
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = t('login.toast.error.invalidCredentials');
      }
      toast({
        variant: 'destructive',
        title: t('login.toast.error.title'),
        description,
      });
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast({
        variant: 'destructive',
        title: t('login.forgotPassword.toast.emailRequired.title'),
        description: t('login.forgotPassword.toast.emailRequired.description'),
      });
      form.setFocus('email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: t('login.forgotPassword.toast.success.title'),
        description: t('login.forgotPassword.toast.success.description'),
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('errors.generic.title'),
        description: error.message || t('login.forgotPassword.toast.error.description'),
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);

      const isNewUser = !!additionalUserInfo?.isNewUser;
      const canProceed = await checkIpAndProceed(user, isNewUser);

      if (canProceed) {
          if (isNewUser) {
            toast({
              title: t('signup.toast.success.title'),
              description: t('signup.toast.success.description', { name: user.displayName || 'user' }),
              duration: 3000,
            });
          } else {
             toast({
              title: t('login.toast.success.title'),
              description: t('login.toast.success.description', { name: user.displayName || 'user' }),
              duration: 3000,
            });
          }
          router.push('/');
      }

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('errors.generic.title'),
        description:
          error.message || t('login.googleSignInError'),
      });
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
        <div className="flex items-center justify-center py-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 text-2xl font-semibold mb-4"
                    >
                        <Flower2 className="h-8 w-8 text-primary" />
                        <span className="font-headline">StudioZen</span>
                    </Link>
                    <h1 className="text-3xl font-bold">{t('login.title')}</h1>
                    <p className="text-balance text-muted-foreground">
                        {t('login.subtitle')}
                    </p>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    {t('login.googleButton')}
                </Button>
                <div className="my-2 flex items-center">
                    <div className="flex-grow border-t border-muted" />
                    <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">
                        {t('login.separator')}
                    </span>
                    <div className="flex-grow border-t border-muted" />
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('login.form.email.label')}</FormLabel>
                                    <FormControl>
                                        <Input
                                        placeholder="you@email.com"
                                        {...field}
                                        type="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('login.form.password.label')}</FormLabel>
                                    <FormControl>
                                        <Input
                                        placeholder="********"
                                        {...field}
                                        type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="space-y-2">
                            <FormLabel>{t('languageSwitcher.label')}</FormLabel>
                            <LanguageSwitcher />
                        </div>
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? t('login.form.submitButton.loading') : t('login.form.submitButton.default')}
                        </Button>
                    </form>
                </Form>
                 <div className="text-right">
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-sm"
                        onClick={handlePasswordReset}
                        >
                        {t('login.forgotPassword.link')}
                    </Button>
                 </div>
                <div className="mt-4 text-center text-sm">
                    {t('login.noAccount.text')}{' '}
                    <Link href="/signup" className="underline">
                        {t('login.noAccount.link')}
                    </Link>
                </div>
                 <div className="mt-2 text-center text-xs text-muted-foreground">
                    {t('login.footer')}
                </div>
            </div>
        </div>
      <div className="hidden bg-muted lg:block">
        {loginImage && (
            <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            data-ai-hint={loginImage.imageHint}
            width="1200"
            height="1800"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
        )}
      </div>
    </div>
  );
}
