/**
 * AI API service for interacting with the Cloudflare Workers proxy
 * Centralizes API calls to avoid duplication
 */

import { API_CONFIG } from '../theme';

/**
 * Send a chat message to the AI
 * @param {string} message - The user's message
 * @param {string} model - The AI model to use (default: microsoft/phi-4-mini-instruct)
 * @returns {Promise<string>} The AI's response text
 */
export async function sendChatMessage(message, model = 'microsoft/phi-4-mini-instruct') {
  try {
    const payload = {
      model,
      messages: [{ role: 'user', content: message }],
    };

    const response = await fetch(API_CONFIG.aiProxyEndpoint, {
      method: 'POST',
      headers: API_CONFIG.defaultHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`AI request failed with status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      throw new Error('No response content from AI');
    }

    return text;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
}

/**
 * Generate custom resume and cover letter based on job description
 * @param {string} resume - The base resume text
 * @param {string} jobDescription - The job description to tailor to
 * @returns {Promise<{customResume: string, coverLetter: string}>} Generated content
 */
export async function generateResumeAndCoverLetter(resume, jobDescription) {
  try {
    const response = await fetch(API_CONFIG.resumeGenerateEndpoint, {
      method: 'POST',
      headers: API_CONFIG.defaultHeaders,
      body: JSON.stringify({
        resume: resume.trim(),
        jobDescription: jobDescription.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resume generation failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      customResume: data.customResume || '',
      coverLetter: data.coverLetter || '',
    };
  } catch (error) {
    console.error('Resume Generation Error:', error);
    throw error;
  }
}
