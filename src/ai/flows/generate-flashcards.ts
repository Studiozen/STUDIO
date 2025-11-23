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
  language: z.enum(['en', 'it']).describe("La lingua in cui l'IA deve generare le flashcard."),
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
  prompt: `You are an expert tutor. Create a set of 20 different multiple-choice questions based on the provided text to help a student review. Each question should have 4 answer options: one correct and three plausible but incorrect. Ensure each question is unique and covers a different aspect of the text. For each question, provide the correct answer and a brief explanation.

**Important**: All questions, options, and explanations must be generated exclusively in the language specified by the 'language' parameter. For example, if the language is 'it', generate everything in Italian. If it is 'en', generate everything in English.

{{#if learningStyle}}
If the learningStyle is 'simplified', adapt the complexity of the questions, options, answers, and explanations for a user with specific learning needs (such as dyslexia). Use short sentences, simple language, and clear concepts.
{{/if}}

Text:
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
