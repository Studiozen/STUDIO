'use client';

import { useState, useEffect, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldBan, Plus, X, AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const formSchema = z.object({
  site: z.string().url({ message: "Inserisci un URL valido." }),
});

interface WebsiteBlockerProps {
    isBlocking: boolean;
    setIsBlocking: (isBlocking: boolean) => void;
}

const WebsiteBlocker: FC<WebsiteBlockerProps> = ({ isBlocking, setIsBlocking }) => {
  const [sites, setSites] = useState<string[]>([]);
  const [timer, setTimer] = useState(60);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedSites = localStorage.getItem('blockedSites');
      if (storedSites) {
        setSites(JSON.parse(storedSites));
      }
    } catch (error) {
      console.error("Impossibile analizzare i siti bloccati da localStorage", error)
    }
  }, []);
  
  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('blockedSites', JSON.stringify(sites));
    }
  }, [sites, isMounted]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site: '',
    },
  });
  
  const addSite = (values: z.infer<typeof formSchema>) => {
    if (!sites.includes(values.site)) {
      setSites([...sites, values.site]);
    }
    form.reset();
  };
  
  const removeSite = (siteToRemove: string) => {
    setSites(sites.filter((site) => site !== siteToRemove));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldBan className="h-5 w-5" />
          Blocco Siti Web
        </CardTitle>
        <CardDescription>
          Crea un elenco di siti web che distraggono da bloccare durante le sessioni di concentrazione.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
            <AlertTriangle className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">Simulazione Funzionalità</AlertTitle>
            <AlertDescription>
                Il blocco effettivo dei siti web richiede un'estensione del browser. Questa è una dimostrazione dell'interfaccia utente.
            </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2">
            <Switch id="blocking-mode" checked={isBlocking} onCheckedChange={setIsBlocking} aria-label={`Attiva il blocco ${isBlocking ? 'off' : 'on'}`} disabled={true} />
            <Label htmlFor="blocking-mode" className={isBlocking ? 'font-bold text-destructive' : ''}>La modalità di blocco è {isBlocking ? 'ATTIVA' : 'DISATTIVATA'}</Label>
        </div>

        <form onSubmit={form.handleSubmit(addSite)} className="flex items-start gap-2">
            <div className="grid gap-2 flex-1">
                <Label htmlFor="site-url" className="sr-only">URL del sito web</Label>
                <Input id="site-url" placeholder="es., https://youtube.com" {...form.register('site')} />
                {form.formState.errors.site && <p className="text-sm text-destructive">{form.formState.errors.site.message}</p>}
            </div>
            <Button type="submit"><Plus className="h-4 w-4 mr-2" />Aggiungi Sito</Button>
        </form>

        <div className="space-y-2">
            <Label>Siti Web Bloccati</Label>
            <div className="min-h-[40px] rounded-md border border-dashed p-2 flex flex-wrap gap-2 items-center">
            {sites.length > 0 ? (
                sites.map((site, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                        {new URL(site).hostname}
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-transparent" onClick={() => removeSite(site)}>
                            <X className="h-3 w-3" />
                            <span className="sr-only">Rimuovi {site}</span>
                        </Button>
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
