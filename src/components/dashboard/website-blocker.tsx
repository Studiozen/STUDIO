'use client';

import { useState, useEffect, type FC } from 'react';
import { ShieldBan, X, AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WebsiteBlockerProps {
    isBlocking: boolean;
    setIsBlocking: (isBlocking: boolean) => void;
}

const PREDEFINED_SITES = [
    "https://www.youtube.com",
    "https://www.facebook.com",
    "https://www.twitter.com",
    "https://www.instagram.com",
    "https://www.tiktok.com",
    "https://www.reddit.com",
];

const WebsiteBlocker: FC<WebsiteBlockerProps> = ({ isBlocking }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldBan className="h-5 w-5" />
          Blocco Siti Web
        </CardTitle>
        <CardDescription>
          Durante le sessioni di concentrazione, i seguenti siti che distraggono verranno bloccati.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive" className="bg-yellow-500/20 text-yellow-300 border-yellow-400 [&>svg]:text-yellow-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-yellow-200">Simulazione Funzionalità</AlertTitle>
            <AlertDescription>
                Il blocco effettivo dei siti web richiede un'estensione del browser. Questa è una dimostrazione dell'interfaccia utente.
            </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2">
            <Switch id="blocking-mode" checked={isBlocking} aria-label={`La modalità di blocco è ${isBlocking ? 'ATTIVA' : 'DISATTIVATA'}`} disabled={true} />
            <Label htmlFor="blocking-mode" className={isBlocking ? 'font-bold text-destructive' : ''}>La modalità di blocco è {isBlocking ? 'ATTIVA' : 'DISATTIVATA'}</Label>
        </div>

        <div className="space-y-2">
            <Label>Siti Web Bloccati Automaticamente</Label>
            <div className="min-h-[40px] rounded-md border border-dashed p-2 flex flex-wrap gap-2 items-center">
            {PREDEFINED_SITES.length > 0 ? (
                PREDEFINED_SITES.map((site, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1 text-sm">
                        {new URL(site).hostname}
                    </Badge>
                ))
            ) : (
                <p className="text-sm text-muted-foreground px-2">Nessun sito nell'elenco di blocco.</p>
            )}
            </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default WebsiteBlocker;
