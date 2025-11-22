'use server';

/**
 * @fileOverview AI agent that answers questions based on a given context.
 *
 * - askQuestion - A function that answers a question based on a provided text context.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const AskQuestionInputSchema = z.object({
  context: z.string().describe('Il testo del materiale di studio.'),
  question: z.string().describe('La domanda specifica da porre sul contesto.'),
  learningStyle: z.string().optional().describe('Lo stile di apprendimento preferito dall\'utente (es. "simplified" per testo semplificato).'),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

export const AskQuestionOutputSchema = z.object({
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
  prompt: `Sei un assistente di studio esperto. Il tuo compito è rispondere alla domanda dell'utente basandoti ESCLUSIVAMENTE sul testo fornito. Non usare conoscenze esterne. Fornisci una risposta chiara e concisa.

Testo di riferimento:
{{{context}}}

Domanda:
{{{question}}}

{{#if learningStyle}}
Se il learningStyle è 'simplified', formula la risposta in modo particolarmente semplice, usando frasi brevi e un linguaggio chiaro, adatto a chi ha bisogni specifici di apprendimento.
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
