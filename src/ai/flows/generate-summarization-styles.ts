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
  language: z.enum(['en', 'it']).describe("La lingua in cui l'IA deve generare i riassunti."),
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
  prompt: `You are an expert summarizer. Analyze the provided text and generate three separate summaries, one for each style required in the output format.

**Important**: All summaries must be generated exclusively in the language specified by the 'language' parameter. For example, if the language is 'it', you must write in Italian. If it is 'en', you must write in English.

1.  **Concise Paragraph**: A single paragraph that captures the essence of the text.
2.  **Bullet Points**: The most important points formatted as a list.
3.  **Key Concepts**: A list of the fundamental terms or ideas.

{{#if learningStyle}}
If the learningStyle is 'simplified', adapt the complexity of all three summaries for a user with specific learning needs (such as dyslexia). Use short sentences, simple language, and clear concepts.
{{/if}}

Text to analyze:
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
