'use server';

/**
 * @fileOverview AI agent for handling chat conversations.
 *
 * - chat - A function that responds to a user's message in a conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { MessageData } from 'genkit';

// Define the schema for a single message part (either text or media).
const MessagePartSchema = z.object({
  text: z.string().optional(),
  media: z.object({
    contentType: z.string(),
    url: z.string(),
  }).optional(),
});


// Define the schema for the history of messages.
const HistorySchema = z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({text: z.string()})),
}));

// Define the schema for the chat input, which includes the history and the new message.
const ChatInputSchema = z.object({
  history: HistorySchema,
  message: z.string().describe('The user\'s new message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string().describe('The model\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// The main chat function that will be called from the frontend.
export async function chat(input: ChatInput): Promise<ChatOutput> {
  return await chatFlow(input);
}

// Define the Genkit flow.
const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const history: MessageData[] = input.history.map(h => ({
        role: h.role,
        content: h.content,
    }));

    // Generate the response using the prompt.
    const response = await ai.generate({
        prompt: input.message,
        history: history,
    });

    // Return the model's response.
    return {
      message: response.text,
    };
  }
);
