'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Flower2 } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  email: z.string().email({ message: 'Inserisci un indirizzo email valido.' }),
  password: z
    .string()
    .min(1, { message: 'Per favore, inserisci la tua password.' }), // Min 1 to allow form submission check, real validation is on Firebase
});

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Accesso effettuato!',
        description: 'Bentornato!',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Login Error:', error);
      let description = 'Impossibile accedere. Controlla le tue credenziali e riprova.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = 'Credenziali non valide. Controlla email e password.';
      }
      toast({
        variant: 'destructive',
        title: 'Errore di Accesso',
        description,
      });
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email richiesta',
        description: 'Per favore, inserisci la tua email per reimpostare la password.',
      });
      form.setFocus('email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Email inviata!',
        description: 'Controlla la tua casella di posta per le istruzioni su come reimpostare la password.',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ops! Qualcosa è andato storto.',
        description: error.message || "Impossibile inviare l'email di reimpostazione. Controlla che l'email sia corretta.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);

      if (additionalUserInfo?.isNewUser) {
        await setDoc(doc(firestore, 'users', user.uid), {
          id: user.uid,
          name: user.displayName,
          email: user.email,
        });
        toast({
          title: 'Account creato!',
          description: 'Sei stato registrato con successo con Google.',
        });
      } else {
         toast({
          title: 'Accesso effettuato!',
          description: 'Bentornato!',
        });
      }
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ops! Qualcosa è andato storto.',
        description:
          error.message || 'Impossibile accedere con Google.',
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
                    <h1 className="text-3xl font-bold">Accedi</h1>
                    <p className="text-balance text-muted-foreground">
                        Inserisci la tua email per accedere al tuo account
                    </p>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Accedi con Google
                </Button>
                <div className="my-2 flex items-center">
                    <div className="flex-grow border-t border-muted" />
                    <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">
                        Oppure continua con
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
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                        placeholder="tu@email.com"
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
                                    <div className="flex items-center">
                                        <FormLabel>Password</FormLabel>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="ml-auto inline-block h-auto p-0 text-sm"
                                            onClick={handlePasswordReset}
                                            >
                                            Password dimenticata?
                                        </Button>
                                    </div>
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
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Accesso in corso...' : 'Accedi'}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Non hai un account?{' '}
                    <Link href="/signup" className="underline">
                        Registrati
                    </Link>
                </div>
            </div>
        </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/studiovibes/1200/1800"
          alt="Ambiente di studio sereno con una pianta e luce naturale"
          data-ai-hint="serene study"
          width="1200"
          height="1800"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
