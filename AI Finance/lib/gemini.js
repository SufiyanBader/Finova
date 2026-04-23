import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Utility to call Gemini API with exponential backoff retries to handle 503/429 errors.
 * 
 * @param {Function} apiCall - A function that returns a Promise (the API call).
 * @param {number} maxRetries - Maximum number of retry attempts.
 * @param {number} baseDelay - Initial delay in milliseconds.
 * @returns {Promise<any>}
 */
async function withRetry(apiCall, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      const isRetryable = 
        error.message?.includes("503") || 
        error.message?.includes("Service Unavailable") || 
        error.message?.includes("overloaded") ||
        error.message?.includes("429") || 
        error.message?.includes("Too Many Requests");

      if (!isRetryable || i === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);
      console.warn(`[Gemini API] Retryable error. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Robustly generates content using a Gemini model.
 * Supports text prompts and multipart arrays (e.g. image + text for receipt scanning).
 *
 * @param {string} modelId
 * @param {string | Array} prompt - Plain text string or multipart array.
 * @returns {Promise<string>}
 */
export async function generateResilientContent(modelId, prompt) {
  // Do NOT pass apiVersion — the SDK resolves the correct endpoint automatically.
  const model = genAI.getGenerativeModel({ model: modelId });
  
  return await withRetry(async () => {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  });
}

/**
 * Robustly handles chat interactions with retries.
 *
 * @param {string} modelId
 * @param {Array}  history - Gemini-format chat history array.
 * @param {string} message - The new user message to send.
 * @returns {Promise<string>}
 */
export async function sendResilientChat(modelId, history, message) {
  // Do NOT pass apiVersion — the SDK resolves the correct endpoint automatically.
  const model = genAI.getGenerativeModel({ model: modelId });
  
  const chat = model.startChat({ history });
  
  return await withRetry(async () => {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  });
}

export const SUPPORTED_MODELS = {
  FLASH: "gemini-2.5-flash",        // Standard workhorse
  FLASH_LITE: "gemini-2.0-flash",   // Fallback / Lite
  PRO: "gemini-2.5-pro",            // High intelligence
};
