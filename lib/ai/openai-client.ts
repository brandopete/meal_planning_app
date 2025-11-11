import OpenAI from 'openai';

// Initialize OpenAI client
// Use placeholder for build time
const apiKey = process.env.OPENAI_API_KEY || 'placeholder-key';

export const openai = new OpenAI({
  apiKey,
});

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
