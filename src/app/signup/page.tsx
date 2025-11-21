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
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { CalendarIcon, Flower2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { it } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri.' }),
  email: z.string().email({ message: 'Inserisci un indirizzo email valido.' }),
  password: z
    .string()
    .min(6, { message: 'La password deve contenere almeno 6 caratteri.' }),
  birthDate: z.date({
    required_error: "È richiesta una data di nascita.",
  }),
  country: z.string().min(2, { message: "Il paese deve contenere almeno 2 caratteri."}),
  schoolType: z.string({ required_error: 'Per favore, seleziona il tuo tipo di scuola.' }),
  learningStyle: z.string({ required_error: 'Per favore, seleziona uno stile di apprendimento.' }),
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

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      country: '',
      learningStyle: 'standard',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      await setDoc(doc(firestore, 'users', user.uid), {
        id: user.uid,
        name: values.name,
        email: values.email,
        birthDate: values.birthDate.toISOString(),
        country: values.country,
        schoolType: values.schoolType,
        learningStyle: values.learningStyle,
      });

      toast({
        title: 'Account creato!',
        description: `Benvenuto, ${values.name}!`,
        duration: 3000,
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ops! Qualcosa è andato storto.',
        description:
          error.message ||
          'Impossibile creare un account. Riprova più tardi.',
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
        // For Google Sign-in, we prompt the user for the extra info on their profile page later
        // or use default values for now.
        await setDoc(doc(firestore, 'users', user.uid), {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          learningStyle: 'standard', // default value
        });
      }
      
      toast({
        title: 'Accesso effettuato!',
        description: `Benvenuto, ${user.displayName || 'utente'}!`,
        duration: 3000,
      });
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <div className="w-full max-w-md">
        <div className="mb-4 flex justify-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-semibold"
            >
              <Flower2 className="h-8 w-8 text-primary" />
              <span className="font-headline">StudioZen</span>
            </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registrati</CardTitle>
            <CardDescription>
              Crea un nuovo account per iniziare a usare StudioZen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Registrati con Google
            </Button>
            <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-muted" />
                <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">
                    Oppure registrati con l'email
                </span>
                <div className="flex-grow border-t border-muted" />
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormLabel>Password</FormLabel>
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Data di nascita</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP", { locale: it })
                                ) : (
                                    <span>Scegli una data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                captionLayout="dropdown-buttons"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Paese</FormLabel>
                        <FormControl>
                            <Input placeholder="Es. Italia" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="schoolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo di Scuola</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona il tuo livello di studi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="middle-school">Scuola Media</SelectItem>
                          <SelectItem value="high-school">Scuola Superiore</SelectItem>
                          <SelectItem value="university">Università</SelectItem>
                          <SelectItem value="other">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="learningStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stile di Apprendimento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona una preferenza" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="simplified">Testo Semplificato (per DSA, ecc.)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creazione in corso...' : 'Crea Account'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Hai già un account?{' '}
              <Link href="/login" className="underline">
                Accedi
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
