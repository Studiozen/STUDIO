'use server';

/**
 * @fileOverview Agente IA che riassume il contenuto di un'immagine.
 *
 * - generateImageSummary - A function that generates a summary from a provided image.
 * - GenerateImageSummaryInput - The input type for the generateImageSummary function.
 * - GenerateImageSummaryOutput - The return type for the generateImageSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateImageSummaryInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a document, diagram, or anything with text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  learningStyle: z
    .string()
    .optional()
    .describe(
      'The user\'s preferred learning style (e.g., "simplified" for simplified text).'
    ),
  language: z.enum(['en', 'it']).describe("The language in which the AI should generate the summary."),
});
export type GenerateImageSummaryInput = z.infer<
  typeof GenerateImageSummaryInputSchema
>;

const GenerateImageSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the textual content present in the image.'),
});
export type GenerateImageSummaryOutput = z.infer<
  typeof GenerateImageSummaryOutputSchema
>;

export async function generateImageSummary(
  input: GenerateImageSummaryInput
): Promise<GenerateImageSummaryOutput> {
  return generateImageSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageSummaryPrompt',
  input: { schema: GenerateImageSummaryInputSchema },
  output: { schema: GenerateImageSummaryOutputSchema },
  prompt: `You are an expert study assistant specializing in extracting and summarizing information from images. Analyze the provided image, which may contain text, diagrams, or notes. Identify the key information and generate a clear and concise summary.

**Important**: The summary must be generated exclusively in the language specified by the 'language' parameter. For example, if the language is 'it', you must write in Italian. If it is 'en', you must write in English.

{{#if learningStyle}}
If the learningStyle is 'simplified', formulate the summary in a particularly simple way, using short sentences and clear language, suitable for someone with specific learning needs.
{{/if}}

Image to analyze:
{{media url=imageDataUri}}`,
});

const generateImageSummaryFlow = ai.defineFlow(
  {
    name: 'generateImageSummaryFlow',
    inputSchema: GenerateImageSummaryInputSchema,
    outputSchema: GenerateImageSummaryOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a summary from the provided image. The image may not contain recognizable text.");
    }
    return output;
  }
);
