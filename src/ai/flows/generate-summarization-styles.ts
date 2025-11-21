'use server';

/**
 * @fileOverview AI agent that provides different summarization styles.
 *
 * - generateSummarizationStyles - A function that generates summaries with different styles.
 * - GenerateSummarizationStylesInput - The input type for the generateSummarizationStyles function.
 * - GenerateSummarizationStylesOutput - The return type for the generateSummarizationStyles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateSummarizationStylesInputSchema = z.object({
  text: z.string().describe('Il testo da riassumere.'),
  learningStyle: z.string().optional().describe('Lo stile di apprendimento preferito dall\'utente (es. "simplified" per testo semplificato).'),
});
export type GenerateSummarizationStylesInput = z.infer<
  typeof GenerateSummarizationStylesInputSchema
>;

const GenerateSummarizationStylesOutputSchema = z.object({
  conciseParagraph: z.string().describe('Un riassunto in un unico paragrafo conciso.'),
  bulletPoints: z.string().describe('Un riassunto formattato come elenco puntato.'),
  keyConcepts: z.string().describe('Un riassunto che elenca i concetti chiave principali.'),
});
export type GenerateSummarizationStylesOutput = z.infer<
  typeof GenerateSummarizationStylesOutputSchema
>;

export async function generateSummarizationStyles(
  input: GenerateSummarizationStylesInput
): Promise<GenerateSummarizationStylesOutput> {
  return generateSummarizationStylesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummarizationStylesPrompt',
  input: {schema: GenerateSummarizationStylesInputSchema},
  output: {schema: GenerateSummarizationStylesOutputSchema},
  prompt: `Sei un esperto riassuntore. Analizza il testo fornito e genera tre riassunti separati, uno per ogni stile richiesto nel formato di output.

1.  **Paragrafo Conciso**: Un singolo paragrafo che cattura l'essenza del testo.
2.  **Punti Elenco**: I punti più importanti formattati come un elenco.
3.  **Concetti Chiave**: Una lista dei termini o delle idee fondamentali.

{{#if learningStyle}}
Se il learningStyle è 'simplified', adatta la complessità di tutti e tre i riassunti per un utente con bisogni specifici di apprendimento (come la dislessia). Usa frasi brevi, un linguaggio semplice e concetti chiari.
{{/if}}

Testo da analizzare:
{{{text}}}`,
});

const generateSummarizationStylesFlow = ai.defineFlow(
  {
    name: 'generateSummarizationStylesFlow',
    inputSchema: GenerateSummarizationStylesInputSchema,
    outputSchema: GenerateSummarizationStylesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
