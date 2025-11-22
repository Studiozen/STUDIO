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
import { it, enUS } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function SignupPage() {
  const { t, language } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(2, { message: t('signup.form.name.invalid') }),
    email: z.string().email({ message: t('signup.form.email.invalid') }),
    password: z
      .string()
      .min(6, { message: t('signup.form.password.invalid') }),
    birthDate: z.date({
      required_error: t('signup.form.birthDate.required'),
    }),
    country: z.string().min(2, { message: t('signup.form.country.invalid')}),
    schoolType: z.string({ required_error: t('signup.form.schoolType.required') }),
    learningStyle: z.string({ required_error: t('signup.form.learningStyle.required') }),
    privacy: z.boolean().refine(val => val === true, {
      message: t('signup.form.privacy.required'),
    }),
  });

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
      privacy: false,
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
        title: t('signup.toast.success.title'),
        description: t('signup.toast.success.description', { name: values.name }),
        duration: 3000,
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('errors.generic.title'),
        description:
          error.message || t('errors.generic.default'),
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
          learningStyle: 'standard', // default value
        });
      }
      
      toast({
        title: t('login.toast.success.title'),
        description: t('login.toast.success.description', { name: user.displayName || 'user' }),
        duration: 3000,
      });
      router.push('/');
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

  const datePickerLocale = language === 'it' ? it : enUS;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
        <div className='absolute top-4 right-4 z-10'>
          <LanguageSwitcher />
        </div>
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
        <div className='p-4 sm:p-8 border rounded-lg bg-card'>
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">{t('signup.title')}</h1>
                <p className="text-balance text-muted-foreground mt-2">
                    {t('signup.subtitle')}
                </p>
            </div>
            
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                {t('signup.googleButton')}
            </Button>
            <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-muted" />
                <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">
                    {t('signup.separator')}
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
                      <FormLabel>{t('signup.form.name.label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('signup.form.name.placeholder')} {...field} />
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
                      <FormLabel>{t('signup.form.email.label')}</FormLabel>
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
                      <FormLabel>{t('signup.form.password.label')}</FormLabel>
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
                        <FormLabel>{t('signup.form.birthDate.label')}</FormLabel>
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
                                    format(field.value, "PPP", { locale: datePickerLocale })
                                ) : (
                                    <span>{t('signup.form.birthDate.placeholder')}</span>
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
                        <FormLabel>{t('signup.form.country.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('signup.form.country.placeholder')} {...field} />
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
                      <FormLabel>{t('signup.form.schoolType.label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('signup.form.schoolType.placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="middle-school">{t('signup.form.schoolType.options.middle-school')}</SelectItem>
                          <SelectItem value="high-school">{t('signup.form.schoolType.options.high-school')}</SelectItem>
                          <SelectItem value="university">{t('signup.form.schoolType.options.university')}</SelectItem>
                          <SelectItem value="other">{t('signup.form.schoolType.options.other')}</SelectItem>
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
                      <FormLabel>{t('signup.form.learningStyle.label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('signup.form.learningStyle.placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">{t('signup.form.learningStyle.options.standard')}</SelectItem>
                          <SelectItem value="simplified">{t('signup.form.learningStyle.options.simplified')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {t('signup.form.privacy.label')}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                            {t('signup.form.privacy.description.part1')}{' '}
                          <Link href="/privacy" className="underline hover:text-primary">
                            {t('signup.form.privacy.description.link')}
                          </Link>
                          .
                        </p>
                         <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? t('signup.form.submitButton.loading') : t('signup.form.submitButton.default')}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              {t('signup.haveAccount.text')}{' '}
              <Link href="/login" className="underline">
                {t('signup.haveAccount.link')}
              </Link>
            </div>
          </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
            {t('login.footer')}
        </div>
      </div>
    </div>
  );
}
