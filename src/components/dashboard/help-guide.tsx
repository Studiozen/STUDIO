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
import { useTranslation } from '@/hooks/use-translation';

export function HelpGuide() {
  const { t } = useTranslation();

  const helpSections = [
    {
        icon: TextQuote,
        title: t('helpGuide.sections.summarizer.title'),
        content: t('helpGuide.sections.summarizer.content')
    },
    {
        icon: BookOpen,
        title: t('helpGuide.sections.quizGenerator.title'),
        content: t('helpGuide.sections.quizGenerator.content')
    },
    {
        icon: Timer,
        title: t('helpGuide.sections.focusTimer.title'),
        content: t('helpGuide.sections.focusTimer.content')
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <HelpCircle className="mr-2 h-4 w-4" />
            {t('helpGuide.triggerButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="h-6 w-6 text-primary" />
            {t('helpGuide.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <p className="text-muted-foreground">
                {t('helpGuide.description')}
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
