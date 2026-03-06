import { callLLM } from './llmClient';

export async function summarizeAndCategorize(fullText: string, title?: string) {
  // Build a clear prompt instructing the LLM to return JSON
  const prompt = `Given the following research paper text${title ? ` (title: ${title})` : ''},

1) Provide a concise summary in 3-5 sentences.
2) Provide 3-6 categorical labels (topics) appropriate for the paper, as short strings.
3) Return output STRICTLY as a JSON object with keys: summary, categories (array), and confidence (0-1 float).

Text:
${fullText}

If you cannot determine categories, return an array with "Uncategorized".
`;

  try {
    const { text } = await callLLM(prompt, 400);

    // Attempt to parse JSON from the LLM response
    let parsed: any = null;
    try {
      // The assistant is instructed to return JSON, but strip surrounding markdown if present
      const cleaned = text.replace(/^[`\s]*json\s*/i, '').replace(/^[`\s]*/,'').replace(/\n```[a-zA-Z]*\n?/g,'\n').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Fallback: simple heuristics
      parsed = {
        summary: (text || '').slice(0, 500),
        categories: extractCategoriesFromText(fullText),
        confidence: 0.5,
      };
    }

    // Normalize result
    const result = {
      summary: parsed.summary || parsed.description || '',
      categories: Array.isArray(parsed.categories) ? parsed.categories : (parsed.topics || []),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
    };

    if (!result.categories || result.categories.length === 0) result.categories = ['Uncategorized'];

    return result;
  } catch (err: any) {
    console.error('Error in summarizeAndCategorize:', err);
    return {
      summary: fullText.slice(0, 500),
      categories: extractCategoriesFromText(fullText),
      confidence: 0.4,
    };
  }
}

function extractCategoriesFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const cats: string[] = [];
  if (lower.includes('machine learning') || lower.includes('neural')) cats.push('Machine Learning');
  if (lower.includes('natural language') || lower.includes('nlp')) cats.push('NLP');
  if (lower.includes('computer vision')) cats.push('Computer Vision');
  if (lower.includes('distributed') || lower.includes('cloud') || lower.includes('edge')) cats.push('Systems');
  if (lower.includes('security') || lower.includes('cryptography')) cats.push('Security');
  if (cats.length === 0) cats.push('Uncategorized');
  return cats;
}

export default { summarizeAndCategorize };
