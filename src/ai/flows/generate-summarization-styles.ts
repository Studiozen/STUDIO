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
  text: z.string().describe('The text to be summarized.'),
  learningStyle: z.string().optional().describe('The user\'s preferred learning style (e.g., "simplified" for simplified text).'),
  language: z.enum(['en', 'it']).describe("The language in which the AI should generate the summaries."),
});
export type GenerateSummarizationStylesInput = z.infer<
  typeof GenerateSummarizationStylesInputSchema
>;

const GenerateSummarizationStylesOutputSchema = z.object({
  conciseParagraph: z.string().describe('A summary in a single concise paragraph.'),
  bulletPoints: z.string().describe('A summary formatted as a bulleted list.'),
  keyConcepts: z.string().describe('A summary listing the main key concepts.'),
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
