'use server';

/**
 * @fileOverview Agente IA che riassume il contenuto di un'immagine.
 *
 * - generateImageSummary - Una funzione che genera un riassunto da un'immagine fornita.
 * - GenerateImageSummaryInput - Il tipo di input per la funzione generateImageSummary.
 * - GenerateImageSummaryOutput - Il tipo di ritorno per la funzione generateImageSummary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateImageSummaryInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "Una foto di un documento, diagramma o qualsiasi cosa con testo, come un data URI che deve includere un tipo MIME e utilizzare la codifica Base64. Formato previsto: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  learningStyle: z
    .string()
    .optional()
    .describe(
      'Lo stile di apprendimento preferito dall\'utente (es. "simplified" per testo semplificato).'
    ),
  language: z.enum(['en', 'it']).describe("La lingua in cui l'IA deve generare il riassunto."),
});
export type GenerateImageSummaryInput = z.infer<
  typeof GenerateImageSummaryInputSchema
>;

const GenerateImageSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('Un riassunto del contenuto testuale presente nell\'immagine.'),
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
