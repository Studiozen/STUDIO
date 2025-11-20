'use server';
/**
 * @fileOverview Summarizes study materials using AI to efficiently grasp essential information.
 *
 * - summarizeStudyMaterial - A function that handles the summarization process.
 * - SummarizeStudyMaterialInput - The input type for the summarizeStudyMaterial function.
 * - SummarizeStudyMaterialOutput - The return type for the summarizeStudyMaterial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeStudyMaterialInputSchema = z.object({
  text: z.string().describe('Il testo del materiale di studio da riassumere.'),
  style: z
    .enum(['concise', 'detailed', 'keywords'])
    .default('concise')
    .describe('Lo stile di riassunto.'),
});
export type SummarizeStudyMaterialInput = z.infer<typeof SummarizeStudyMaterialInputSchema>;

const SummarizeStudyMaterialOutputSchema = z.object({
  summary: z.string().describe('Il testo riassunto.'),
});
export type SummarizeStudyMaterialOutput = z.infer<typeof SummarizeStudyMaterialOutputSchema>;

export async function summarizeStudyMaterial(
  input: SummarizeStudyMaterialInput
): Promise<SummarizeStudyMaterialOutput> {
  return summarizeStudyMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeStudyMaterialPrompt',
  input: {schema: SummarizeStudyMaterialInputSchema},
  output: {schema: SummarizeStudyMaterialOutputSchema},
  prompt: `Sei un esperto riassuntore, abile nel condensare le informazioni.

  Riassumi il seguente testo in uno stile {{{style}}}:

  {{text}}`,
});

const summarizeStudyMaterialFlow = ai.defineFlow(
  {
    name: 'summarizeStudyMaterialFlow',
    inputSchema: SummarizeStudyMaterialInputSchema,
    outputSchema: SummarizeStudyMaterialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
