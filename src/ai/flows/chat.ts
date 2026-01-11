'use server';

/**
 * @fileOverview AI agent for conversational chat.
 *
 * - chat - A function that responds to a user's message in a conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatMessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest user message.'),
  learningStyle: z.string().optional().describe("The user's preferred learning style (e.g., 'simplified' for simplified text)."),
  language: z.enum(['en', 'it']).describe("The language in which the AI should respond."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string().describe('The AI model\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return await chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are a friendly and helpful study assistant. Continue the conversation with the user.

**Important**: You must always and only answer in the language specified by the 'language' parameter. For example, if the language is 'it', you must answer in Italian. If it is 'en', you must answer in English.

{{#if learningStyle}}
If the learningStyle is 'simplified', formulate the answer in a particularly simple way, using short sentences and clear language, suitable for someone with specific learning needs.
{{/if}}

{{#each history}}
{{#if (eq role 'user')}}
User: {{{content}}}
{{/if}}
{{#if (eq role 'model')}}
Assistant: {{{content}}}
{{/if}}
{{/each}}

User: {{{message}}}
Assistant:`,
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to provide a response.');
    }
    return output;
  }
);
