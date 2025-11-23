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
  language: z.enum(['en', 'it']).describe("La lingua in cui l'IA deve rispondere."),
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
  prompt: `You are an expert study assistant. Your task is to answer the user's question. If "Reference Text" is provided and relevant, base your answer EXCLUSIVELY on it. If the reference text is the same as the question or not relevant, use your general knowledge. Provide a clear and concise answer.

**Important**: You must always and only answer in the language specified by the 'language' parameter. For example, if the language is 'it', you must answer in Italian. If it is 'en', you must answer in English.

Reference Text:
{{{context}}}

Question:
{{{question}}}

{{#if learningStyle}}
If the learningStyle is 'simplified', formulate the answer in a particularly simple way, using short sentences and clear language, suitable for someone with specific learning needs.
{{/if}}

Answer:`,
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
