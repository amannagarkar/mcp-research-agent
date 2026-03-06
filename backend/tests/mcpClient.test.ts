import axios from 'axios';
import { summarizeViaMCP } from '../src/services/mcpClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('mcpClient', () => {
  it('parses MCP response correctly', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { summary: 'Short summary', categories: ['ML','NLP'], confidence: 0.9 } });

    const res = await summarizeViaMCP('some full text', 'Test Title');
    expect(res.summary).toBe('Short summary');
    expect(res.categories).toEqual(['ML','NLP']);
    expect(res.confidence).toBe(0.9);
  });

  it('handles MCP returning non-array categories', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { summary: 'S', categories: 'Security' } });
    const res = await summarizeViaMCP('text');
    expect(res.categories).toEqual(['Security']);
  });
});
