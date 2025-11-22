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
  prompt: `Sei un assistente allo studio esperto nell'estrarre e riassumere informazioni da immagini. Analizza l'immagine fornita, che può contenere testo, diagrammi o note. Identifica le informazioni chiave e genera un riassunto chiaro e conciso.

{{#if learningStyle}}
Se il learningStyle è 'simplified', formula il riassunto in un modo particolarmente semplice, usando frasi brevi e un linguaggio chiaro, adatto a qualcuno con bisogni di apprendimento specifici.
{{/if}}

Immagine da analizzare:
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
        throw new Error("L'IA non è riuscita a generare un riassunto dall'immagine fornita. L'immagine potrebbe non contenere testo riconoscibile.");
    }
    return output;
  }
);
