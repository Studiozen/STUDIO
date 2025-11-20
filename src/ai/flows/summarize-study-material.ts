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
  text: z.string().describe('The study material text to summarize.'),
  style: z
    .enum(['concise', 'detailed', 'keywords'])
    .default('concise')
    .describe('The summarization style.'),
});
export type SummarizeStudyMaterialInput = z.infer<typeof SummarizeStudyMaterialInputSchema>;

const SummarizeStudyMaterialOutputSchema = z.object({
  summary: z.string().describe('The summarized text.'),
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
  prompt: `You are an expert summarizer, skilled at condensing information.

  Summarize the following text in a {{{style}}} style:

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
