'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { HelpCircle, TextQuote, BookOpen, Timer } from 'lucide-react';

const helpSections = [
    {
        icon: TextQuote,
        title: "Riassunto AI",
        content: "Incolla qualsiasi testo nell'area dedicata, scegli uno stile di riepilogo (Paragrafo, Punti Elenco, Concetti Chiave) e clicca 'Riassumi'. L'IA creerà un riassunto personalizzato per te."
    },
    {
        icon: BookOpen,
        title: "Generatore di Quiz",
        content: "Trasforma i tuoi appunti in un quiz interattivo. Incolla il testo e clicca 'Genera Domande'. Verrà visualizzato un elenco di domande. Clicca su una domanda per visualizzare le opzioni a risposta multipla. Seleziona una risposta per ricevere un feedback immediato."
    },
    {
        icon: Timer,
        title: "Timer Concentrazione (Pomodoro)",
        content: "Usa la tecnica del Pomodoro per massimizzare la tua produttività. Clicca 'Avvia' per iniziare una sessione di studio di 25 minuti. Al termine, il timer ti avviserà e partirà automaticamente una pausa di 5 minuti."
    }
]

export function HelpGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <HelpCircle className="mr-2 h-4 w-4" />
            Guida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="h-6 w-6 text-primary" />
            Guida di StudioZen
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <p className="text-muted-foreground">
                Scopri come usare al meglio le funzionalità di StudioZen per migliorare la tua concentrazione e il tuo apprendimento.
            </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
            {helpSections.map((section, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>
                        <div className='flex items-center gap-3'>
                            <section.icon className="h-5 w-5 text-primary" />
                            <span className='font-semibold'>{section.title}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className='text-muted-foreground'>
                        {section.content}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
