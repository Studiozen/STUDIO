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
    parts: z.array(MessagePartSchema),
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


// Define the Genkit prompt.
const prompt = ai.definePrompt(
  {
    name: 'chatPrompt',
    input: { schema: ChatInputSchema },
    // Define the prompt function that constructs the prompt from the input.
    prompt: (input) => {
        // Map the zod-validated history to the expected MessageData format for Genkit.
        const history: MessageData[] = input.history.map(h => ({
            role: h.role,
            content: h.parts.map(p => {
                if (p.text) {
                    return { text: p.text };
                }
                if (p.media) {
                    return { media: { contentType: p.media.contentType, url: p.media.url } };
                }
                // This should not happen if validation passes, but it's good practice.
                return { text: '' };
            })
        }));

        // Add the new user message to the history.
        history.push({ role: 'user', content: [{ text: input.message }] });
        return history;
    }
  },
);

// Define the Genkit flow.
const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // Generate the response using the prompt.
    const response = await ai.generate({
        prompt: await prompt.render({input: input}),
        history: [], // History is now part of the prompt itself
        output: {
            format: 'text'
        }
    });

    // Return the model's response.
    return {
      message: response.text,
    };
  }
);
