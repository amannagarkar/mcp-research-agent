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

  try {
    console.log('[MCP] summarizeViaMCP - POST', url, 'payloadKeys=', Object.keys(payload));
    const res = await axios.post(url, payload, { timeout: 30_000 });
    // Expect { title?, summary, categories, confidence }
    const data = res.data || {};
    console.log('[MCP] summarizeViaMCP - response keys=', Object.keys(data));
    return {
      summary: data.summary || '',
      categories: Array.isArray(data.categories) ? data.categories : (data.categories ? [data.categories] : []),
      confidence: typeof data.confidence === 'number' ? data.confidence : undefined,
    };
  } catch (err: any) {
    console.error('[MCP] summarizeViaMCP - request failed:', err && err.message ? err.message : err);
    throw err;
  }
}

export default { summarizeViaMCP };
