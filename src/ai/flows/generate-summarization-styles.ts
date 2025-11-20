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
  text: z.string().describe('The text to summarize.'),
  style: z
    .enum(['bullet points', 'concise paragraph', 'key concepts'])
    .describe('The summarization style.'),
});
export type GenerateSummarizationStylesInput = z.infer<
  typeof GenerateSummarizationStylesInputSchema
>;

const GenerateSummarizationStylesOutputSchema = z.object({
  summary: z.string().describe('The summarized text.'),
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
  prompt: `You are an expert summarizer. Summarize the following text in the style of {{{style}}}.\n\nText: {{{text}}}`,
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
