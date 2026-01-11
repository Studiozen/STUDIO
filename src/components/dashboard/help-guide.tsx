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
import { HelpCircle, TextQuote, BookOpen, Timer, Image as ImageIcon, MessageSquare, User, History } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function HelpGuide() {
  const { t } = useTranslation();

  const helpSections = [
    {
        icon: TextQuote,
        title: t('helpGuide.sections.summarizer.title'),
        content: [
            t('helpGuide.sections.summarizer.content.text'),
            t('helpGuide.sections.summarizer.content.image')
        ]
    },
    {
        icon: BookOpen,
        title: t('helpGuide.sections.quizGenerator.title'),
        content: [t('helpGuide.sections.quizGenerator.content')]
    },
    {
        icon: Timer,
        title: t('helpGuide.sections.focusTimer.title'),
        content: [t('helpGuide.sections.focusTimer.content')]
    },
    {
        icon: MessageSquare,
        title: t('helpGuide.sections.chat.title'),
        content: [t('helpGuide.sections.chat.content')]
    },
    {
        icon: User,
        title: t('helpGuide.sections.profile.title'),
        content: [t('helpGuide.sections.profile.content')]
    },
    {
        icon: History,
        title: t('helpGuide.sections.history.title'),
        content: [t('helpGuide.sections.history.content')]
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
                    <AccordionContent className='text-muted-foreground space-y-4'>
                        {section.content.map((paragraph, pIndex) => (
                             <p key={pIndex} className="flex items-start gap-3">
                                {section.title === t('helpGuide.sections.summarizer.title') && pIndex === 0 && <TextQuote className="h-5 w-5 mt-1 flex-shrink-0" />}
                                {section.title === t('helpGuide.sections.summarizer.title') && pIndex === 1 && <ImageIcon className="h-5 w-5 mt-1 flex-shrink-0" />}
                                <span>{paragraph}</span>
                            </p>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
