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
import { HelpCircle, TextQuote, BookOpen, Timer, Music, ShieldBan } from 'lucide-react';

const helpSections = [
    {
        icon: TextQuote,
        title: "Riassunto AI",
        content: "Incolla qualsiasi testo nel riquadro 'Materiale di Studio', scegli uno stile (paragrafo, punti elenco, ecc.) e clicca 'Riassumi'. L'IA creerà un riassunto per te. Puoi anche cliccare 'Ascolta' per sentire il riassunto letto ad alta voce."
    },
    {
        icon: BookOpen,
        title: "Generatore di Flashcard AI",
        content: "Trasforma i tuoi appunti in flashcard. Incolla il testo e clicca 'Genera Flashcard'. L'IA creerà una serie di domande e risposte per aiutarti a ripassare in modo interattivo."
    },
    {
        icon: Timer,
        title: "Timer Concentrazione (Pomodoro)",
        content: "Usa la tecnica del Pomodoro per massimizzare la tua produttività. Clicca 'Avvia' per iniziare una sessione di studio di 25 minuti. Al termine, il timer ti avviserà e partirà automaticamente una pausa di 5 minuti."
    },
    {
        icon: Music,
        title: "Musica Rilassante",
        content: "Scegli un suono d'ambiente per creare l'atmosfera giusta e ridurre le distrazioni. Clicca su una delle opzioni (es. 'Piano Classico') per avviare o interrompere la musica."
    },
    {
        icon: ShieldBan,
        title: "Blocco Siti Web",
        content: "Durante le sessioni di concentrazione, l'app blocca automaticamente una lista predefinita di siti che distraggono (es. social media). La funzione si attiva insieme al 'Timer Concentrazione'."
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
