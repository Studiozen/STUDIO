// Dynamic import per genkit per evitare problemi di build
let aiInstance: any = null;

async function initializeGenkit() {
  if (aiInstance) return aiInstance;
  
  try {
    const { genkit } = await import('genkit');
    const { googleAI } = await import('@genkit-ai/google-genai');
    
    aiInstance = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.5-flash',
    });
    
    return aiInstance;
  } catch (error) {
    console.error('Failed to initialize genkit:', error);
    // Fallback: ritorna un mock per evitare errori durante il build
    return {
      generate: async () => ({ text: 'Genkit not available' }),
      model: () => ({
        generate: async () => ({ text: 'Genkit not available' }),
      }),
    };
  }
}

// Export async function per ottenere l'istanza
export async function getAI() {
  return await initializeGenkit();
}

// Export sincrono per compatibilità (lazy load)
export const ai = new Proxy({} as any, {
  get: function(target, prop) {
    return async function(...args: any[]) {
      const ai = await getAI();
      return (ai as any)[prop](...args);
    };
  },
});
