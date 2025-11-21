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
    question: z.string().describe('La domanda per la flashcard.'),
    answer: z.string().describe('La risposta alla domanda della flashcard.'),
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
  prompt: `Sei un tutor esperto. Crea una serie di domande e risposte (flashcard) basate sul testo fornito per aiutare uno studente a ripassare. Le domande dovrebbero coprire i concetti chiave e le informazioni importanti. Assicurati che ogni domanda sia unica e copra un aspetto diverso del testo. Per ogni risposta, fornisci anche una breve spiegazione.

{{#if learningStyle}}
Se il learningStyle è 'simplified', adatta la complessità delle domande, risposte e spiegazioni per un utente con bisogni specifici di apprendimento (come la dislessia). Usa frasi brevi, un linguaggio semplice e concetti chiari.
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
