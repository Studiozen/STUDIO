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
  site: z.string().url({ message: "Please enter a valid URL." }),
});

const WebsiteBlocker: FC = () => {
  const [sites, setSites] = useState<string[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);
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
      console.error("Failed to parse blocked sites from localStorage", error)
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldBan className="h-5 w-5" />
          Website Blocker
        </CardTitle>
        <CardDescription>
          Create a list of distracting websites to block during focus sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
            <AlertTriangle className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">Feature Simulation</AlertTitle>
            <AlertDescription>
                Actual website blocking requires a browser extension. This is a UI demonstration.
            </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2">
            <Switch id="blocking-mode" checked={isBlocking} onCheckedChange={setIsBlocking} aria-label={`Turn blocking ${isBlocking ? 'off' : 'on'}`} />
            <Label htmlFor="blocking-mode">Blocking mode is {isBlocking ? 'ON' : 'OFF'}</Label>
        </div>

        <form onSubmit={form.handleSubmit(addSite)} className="flex items-start gap-2">
            <div className="grid gap-2 flex-1">
                <Label htmlFor="site-url" className="sr-only">Website URL</Label>
                <Input id="site-url" placeholder="e.g., https://youtube.com" {...form.register('site')} />
                {form.formState.errors.site && <p className="text-sm text-destructive">{form.formState.errors.site.message}</p>}
            </div>
            <Button type="submit"><Plus className="h-4 w-4 mr-2" />Add Site</Button>
        </form>

        <div className="space-y-2">
            <Label>Blocked Websites</Label>
            <div className="min-h-[40px] rounded-md border border-dashed p-2 flex flex-wrap gap-2 items-center">
            {sites.length > 0 ? (
                sites.map((site, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                        {new URL(site).hostname}
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 hover:bg-transparent" onClick={() => removeSite(site)}>
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {site}</span>
                        </Button>
                    </Badge>
                ))
            ) : (
                <p className="text-sm text-muted-foreground px-2">No sites in block list.</p>
            )}
            </div>
        </div>

      </CardContent>
       <CardFooter>
        <div className="flex items-center gap-2">
            <Label htmlFor="timer">Block for (minutes)</Label>
            <Input 
                id="timer" 
                type="number" 
                value={timer} 
                onChange={(e) => setTimer(Math.max(1, Number(e.target.value)))}
                className="w-20"
                min="1"
            />
        </div>
      </CardFooter>
    </Card>
  );
};

export default WebsiteBlocker;
