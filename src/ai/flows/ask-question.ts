'use server';

/**
 * @fileOverview Agente IA che risponde a domande basate su un dato contesto.
 *
 * - askQuestion - Una funzione che risponde a una domanda basata su un contesto di testo fornito.
 * - AskQuestionInput - Il tipo di input per la funzione askQuestion.
 * - AskQuestionOutput - Il tipo di ritorno per la funzione askQuestion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AskQuestionInputSchema = z.object({
  context: z.string().describe('Il testo dal materiale di studio. Se non viene fornito alcun materiale di studio, questo sarà uguale alla domanda.'),
  question: z.string().describe('La domanda specifica da porre riguardo al contesto.'),
  learningStyle: z.string().optional().describe('Lo stile di apprendimento preferito dall\'utente (es. "simplified" per testo semplificato).'),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
  answer: z.string().describe('La risposta alla domanda basata sul contesto fornito.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(
  input: AskQuestionInput
): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: { schema: AskQuestionInputSchema },
  output: { schema: AskQuestionOutputSchema },
  prompt: `Sei un assistente allo studio esperto. Il tuo compito è rispondere alla domanda dell'utente. Se viene fornito un "Testo di Riferimento" ed è pertinente, basa la tua risposta ESCLUSIVAMENTE su di esso. Se il testo di riferimento è uguale alla domanda o non è pertinente, usa la tua conoscenza generale. Fornisci una risposta chiara e concisa.

Testo di Riferimento:
{{{context}}}

Domanda:
{{{question}}}

{{#if learningStyle}}
Se il learningStyle è 'simplified', formula la risposta in un modo particolarmente semplice, usando frasi brevi e un linguaggio chiaro, adatto a qualcuno con bisogni di apprendimento specifici.
{{/if}}

Risposta:`,
});

const askQuestionFlow = ai.defineFlow(
  {
    name: 'askQuestionFlow',
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
