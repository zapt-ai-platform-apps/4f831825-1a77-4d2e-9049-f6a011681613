import OpenAI from 'openai';

/**
 * Creates and configures an OpenAI API client
 * @returns {OpenAI} Configured OpenAI client
 */
export function createOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}