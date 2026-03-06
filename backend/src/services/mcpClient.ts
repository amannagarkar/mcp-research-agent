import axios from 'axios';

const MCP_BASE = process.env.MCP_URL || 'http://localhost:3001';

export interface MCPResult {
  summary: string;
  categories: string[];
  confidence?: number;
}

export async function summarizeViaMCP(fullText: string, title?: string): Promise<MCPResult> {
  const url = `${MCP_BASE}/mcp/summarize`;
  const payload: any = { fullText };
  if (title) payload.title = title;

  const res = await axios.post(url, payload, { timeout: 30_000 });
  // Expect { title?, summary, categories, confidence }
  const data = res.data || {};
  return {
    summary: data.summary || '',
    categories: Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []),
    confidence: typeof data.confidence === 'number' ? data.confidence : undefined,
  };
}

export default { summarizeViaMCP };
