type LLMProvider = 'openai' | 'claude' | 'deepseek' | 'gemini';

interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
}

// Detect which LLM provider is available based on environment variables
function detectAvailableProvider(): LLMConfig {
  // Check for Claude (Anthropic)
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'claude',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    };
  }

  // Check for Deepseek
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    };
  }

  // Check for Gemini
  if (process.env.GEMINI_API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    };
  }

  // Default to OpenAI
  return {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  };
}

async function callOpenAI(prompt: string, apiKey: string, model: string, maxTokens: number) {
  console.log('[OpenAI] Making API call with model:', model);
  console.log('[OpenAI] API Key format:', apiKey.substring(0, 20) + '...');

  const body = {
    model,
    messages: [
      { role: 'system', content: 'You are an assistant that extracts concise summaries and categories from research paper text. Respond in JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.0,
  };

  try {
    console.log('[OpenAI] Fetching from https://api.openai.com/v1/chat/completions');
    const res = await (globalThis as any).fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    console.log('[OpenAI] Response status:', res.status);
    console.log('[OpenAI] Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const error = await res.text();
      console.error('[OpenAI] Error response:', error);
      throw new Error(`OpenAI request failed: ${res.status} ${error}`);
    }

    const data = await res.json();
    console.log('[OpenAI] Response data:', JSON.stringify(data).substring(0, 200) + '...');
    const content = data?.choices?.[0]?.message?.content || '';
    console.log('[OpenAI] Extracted content:', content.substring(0, 100) + '...');
    return content;
  } catch (error) {
    console.error('[OpenAI] Exception:', error);
    throw error;
  }
}

async function callClaude(prompt: string, apiKey: string, model: string, maxTokens: number) {
  const body = {
    model,
    max_tokens: maxTokens,
    system: 'You are an assistant that extracts concise summaries and categories from research paper text. Respond in JSON.',
    messages: [
      { role: 'user', content: prompt }
    ],
  };

  const res = await (globalThis as any).fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude request failed: ${res.status} ${error}`);
  }

  const data = await res.json();
  return data?.content?.[0]?.text || '';
}

async function callDeepseek(prompt: string, apiKey: string, model: string, maxTokens: number) {
  const body = {
    model,
    messages: [
      { role: 'system', content: 'You are an assistant that extracts concise summaries and categories from research paper text. Respond in JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: maxTokens,
    temperature: 0.0,
  };

  const res = await (globalThis as any).fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Deepseek request failed: ${res.status} ${error}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt: string, apiKey: string, model: string, maxTokens: number) {
  console.log('[Gemini] Making API call with model:', model);
  
  // Build the full prompt with instructions
  const fullPrompt = `You are an assistant that extracts concise summaries and categories from research paper text. Respond in JSON with keys: summary, categories (array), and confidence (0-1 float).

Research Paper:
${prompt}

Extract summary (3-5 sentences) and 3-6 relevant categories.`;

  const body = {
    contents: [
      {
        parts: [
          { text: fullPrompt }
        ]
      }
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0,
    }
  };

  try {
    console.log('[Gemini] Fetching from Google API');
    const res = await (globalThis as any).fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    console.log('[Gemini] Response status:', res.status);

    if (!res.ok) {
      const error = await res.text();
      console.error('[Gemini] Error response:', error);
      throw new Error(`Gemini request failed: ${res.status} ${error}`);
    }

    const data = await res.json();
    console.log('[Gemini] Response received');
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[Gemini] Extracted content:', content.substring(0, 100) + '...');
    return content;
  } catch (error) {
    console.error('[Gemini] Exception:', error);
    throw error;
  }
}

// Fallback mock response
function getMockResponse(prompt: string) {
  // Extract the actual paper text from the prompt (after "Text:")
  const textMatch = prompt.match(/Text:\s*([\s\S]*?)$/);
  const paperText = textMatch ? textMatch[1].trim() : prompt;
  
  // Generate a realistic summary from the paper text
  const sentences = paperText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 3).join('. ').slice(0, 300) + '.';
  
  // Extract title if present
  const titleMatch = prompt.match(/\(title:\s*([^)]+)\)/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Generate realistic categories based on keywords
  const categories: string[] = [];
  const lower = paperText.toLowerCase();
  
  if (lower.includes('machine learning') || lower.includes('neural') || lower.includes('deep learning')) 
    categories.push('Machine Learning');
  if (lower.includes('natural language') || lower.includes('nlp') || lower.includes('text')) 
    categories.push('NLP');
  if (lower.includes('computer vision') || lower.includes('image') || lower.includes('vision'))
    categories.push('Computer Vision');
  if (lower.includes('security') || lower.includes('cryptography') || lower.includes('attack'))
    categories.push('Security');
  if (lower.includes('network') || lower.includes('communication') || lower.includes('protocol'))
    categories.push('Networking');
  if (lower.includes('optimization') || lower.includes('algorithm'))
    categories.push('Optimization');
  if (lower.includes('reinforcement learning') || lower.includes('rl'))
    categories.push('Reinforcement Learning');
  if (lower.includes('transformer') || lower.includes('attention'))
    categories.push('Transformers');
  if (lower.includes('generative') || lower.includes('gan'))
    categories.push('Generative Models');
  if (lower.includes('clustering') || lower.includes('classification'))
    categories.push('Classification');
  
  // Ensure we have at least one category
  if (categories.length === 0) {
    categories.push('General AI/ML');
  }
  
  // Return properly formatted JSON
  return JSON.stringify({
    summary: summary || paperText.slice(0, 300),
    categories: categories.slice(0, 6),
    confidence: 0.75 + Math.random() * 0.15  // 0.75-0.90 confidence for mock
  }, null, 2);
}

export async function callLLM(prompt: string, maxTokens = 512) {
  const config = detectAvailableProvider();
  
  console.log('[LLM] Detected provider:', config.provider);
  console.log('[LLM] API Key present:', !!config.apiKey);

  // If no API key is set, use mock response
  if (!config.apiKey) {
    console.log('[LLM] No API key configured. Using mock response.');
    return {
      text: getMockResponse(prompt),
      raw: { provider: 'mock', model: 'mock-summarizer' },
    };
  }

  try {
    let response: string;

    console.log(`[LLM] Using provider: ${config.provider}, model: ${config.model}`);

    switch (config.provider) {
      case 'claude':
        console.log('[LLM] Routing to Claude');
        response = await callClaude(prompt, config.apiKey, config.model!, maxTokens);
        break;
      case 'deepseek':
        console.log('[LLM] Routing to Deepseek');
        response = await callDeepseek(prompt, config.apiKey, config.model!, maxTokens);
        break;
      case 'gemini':
        console.log('[LLM] Routing to Gemini');
        response = await callGemini(prompt, config.apiKey, config.model!, maxTokens);
        break;
      case 'openai':
      default:
        console.log('[LLM] Routing to OpenAI');
        response = await callOpenAI(prompt, config.apiKey, config.model!, maxTokens);
    }

    console.log('[LLM] Successfully got response from API');
    return {
      text: response,
      raw: { provider: config.provider, model: config.model },
    };
  } catch (error) {
    console.error(`[LLM] Error calling ${config.provider}:`, error);
    console.log('[LLM] Falling back to mock response');
    return {
      text: getMockResponse(prompt),
      raw: { provider: 'mock', model: 'mock-summarizer', error: String(error) },
    };
  }
}

export { LLMProvider, LLMConfig, detectAvailableProvider };
export default { callLLM, detectAvailableProvider };
