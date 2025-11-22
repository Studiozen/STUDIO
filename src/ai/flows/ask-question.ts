'use server';

/**
 * @fileOverview AI agent that answers questions based on a given context.
 *
 * - askQuestion - A function that answers a question based on a provided text context.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const AskQuestionInputSchema = z.object({
  context: z.string().describe('The text from the study material. If no study material is provided, this will be the same as the question.'),
  question: z.string().describe('The specific question to ask about the context.'),
  learningStyle: z.string().optional().describe('The user\'s preferred learning style (e.g., "simplified" for simplified text).'),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

export const AskQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question based on the provided context.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(
  input: AskQuestionInput
): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: { schema: AskQuestionInputSchema },
  output: { schema: AskQuestionOutputSchema },
  prompt: `You are an expert study assistant. Your task is to answer the user's question. If a "Reference Text" is provided and relevant, base your answer EXCLUSIVELY on it. If the reference text is the same as the question or not relevant, use your general knowledge. Provide a clear and concise answer.

Reference Text:
{{{context}}}

Question:
{{{question}}}

{{#if learningStyle}}
If the learningStyle is 'simplified', formulate the answer in a particularly simple way, using short sentences and clear language, suitable for someone with specific learning needs.
{{/if}}

Answer:`,
});

const askQuestionFlow = ai.defineFlow(
  {
    name: 'askQuestionFlow',
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
