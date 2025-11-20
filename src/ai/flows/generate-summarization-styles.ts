'use server';

/**
 * @fileOverview AI agent that provides different summarization styles.
 *
 * - generateSummarizationStyles - A function that generates summaries with different styles.
 * - GenerateSummarizationStylesInput - The input type for the generateSummarizationStyles function.
 * - GenerateSummarizationStylesOutput - The return type for the generateSummarizationStyles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummarizationStylesInputSchema = z.object({
  text: z.string().describe('Il testo da riassumere.'),
  style: z
    .enum(['bullet points', 'concise paragraph', 'key concepts'])
    .describe('Lo stile di riassunto.'),
  learningStyle: z.string().optional().describe('Lo stile di apprendimento preferito dall\'utente (es. "simplified" per testo semplificato).'),
});
export type GenerateSummarizationStylesInput = z.infer<
  typeof GenerateSummarizationStylesInputSchema
>;

const GenerateSummarizationStylesOutputSchema = z.object({
  summary: z.string().describe('Il testo riassunto.'),
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
  prompt: `Sei un esperto riassuntore. Riassumi il seguente testo nello stile di {{{style}}}.
{{#if learningStyle == 'simplified'}}
Adatta la complessità del testo per un utente con bisogni specifici di apprendimento (come la dislessia). Usa frasi brevi, un linguaggio semplice e concetti chiari.
{{/if}}

Testo: {{{text}}}`,
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
