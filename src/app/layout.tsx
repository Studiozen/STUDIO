import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import { LanguageProvider } from '@/context/language-context';

export const metadata: Metadata = {
  title: 'StudioZen',
  description: 'An app to help students study without distractions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <LanguageProvider>
          <FirebaseClientProvider>
            {children}
            <Toaster />
            <CookieConsentBanner />
          </FirebaseClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
