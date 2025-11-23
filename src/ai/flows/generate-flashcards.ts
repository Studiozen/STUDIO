'use server';

/**
 * @fileOverview AI agent that generates flashcards (Q&A) from study material.
 *
 * - generateFlashcards - A function that generates flashcards from a given text.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  text: z.string().describe('Il testo del materiale di studio da cui generare le flashcard.'),
  learningStyle: z.string().optional().describe('Lo stile di apprendimento preferito dall\'utente (es. "simplified" per testo semplificato).'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
    question: z.string().describe('La domanda a scelta multipla.'),
    options: z.array(z.string()).describe('Un array di 4 possibili risposte per la domanda.'),
    answer: z.string().describe('La risposta corretta dall\'array di opzioni.'),
    explanation: z.string().describe('Una breve spiegazione della risposta corretta.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('Un elenco di flashcard generate.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `Sei un tutor esperto. Crea una serie di 20 domande a scelta multipla diverse basate sul testo fornito per aiutare uno studente a ripassare. Ogni domanda deve avere 4 opzioni di risposta: una corretta e tre verosimili ma errate. Assicurati che ogni domanda sia unica e copra un aspetto diverso del testo. Per ogni domanda, fornisci la risposta corretta e una breve spiegazione.

**Importante**: Tutte le domande, le opzioni e le spiegazioni devono essere generate esclusivamente in lingua italiana.

{{#if learningStyle}}
Se il learningStyle è 'simplified', adatta la complessità delle domande, opzioni, risposte e spiegazioni per un utente con bisogni specifici di apprendimento (come la dislessia). Usa frasi brevi, un linguaggio semplice e concetti chiari.
{{/if}}

Testo:
{{{text}}}`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
