import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PaperParser, SimilarityAnalyzer } from './paperProcessor';
import { summarizeAndCategorize } from './mcp/mcpController';
import { detectAvailableProvider } from './mcp/llmClient';

dotenv.config();

const app: Express = express();
const PORT = process.env.MCP_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'MCP Server is running' });
});

/**
 * POST /api/parse-paper
 * Parse a research paper and extract metadata
 */
app.post('/api/parse-paper', async (req: Request, res: Response) => {
  try {
    const { filePath, fileName } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }

    console.log(`Parsing paper: ${fileName}`);

    // Parse the PDF file
    const parsedData = await PaperParser.parsePDF(filePath);

    console.log(`Successfully parsed: ${parsedData.title}`);
    console.log(`Authors: ${parsedData.authors.join(', ')}`);
    console.log(`Tags: ${parsedData.tags.join(', ')}`);

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error parsing paper:', error);
    return res.status(500).json({
      error: 'Failed to parse paper',
      message: error.message,
    });
  }
});

/**
 * POST /api/find-similar
 * Find papers similar to the provided one
 */
app.post('/api/find-similar', async (req: Request, res: Response) => {
  try {
    const { title, abstract, tags, existingPapers = [] } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    console.log(`Finding similar papers for: ${title}`);

    // Find similar papers
    const similarPapers = await SimilarityAnalyzer.findSimilarPapers(
      title,
      abstract || '',
      tags || [],
      existingPapers
    );

    console.log(`Found ${similarPapers.length} similar papers`);

    return res.json({
      query: {
        title,
        tags,
      },
      similar_papers: similarPapers,
    });
  } catch (error: any) {
    console.error('Error finding similar papers:', error);
    return res.status(500).json({
      error: 'Failed to find similar papers',
      message: error.message,
    });
  }
});

/**
 * POST /api/analyze-paper
 * Perform deeper analysis on paper content
 */
app.post('/api/analyze-paper', async (req: Request, res: Response) => {
  try {
    const { fullText, title } = req.body;

    if (!fullText || !title) {
      return res.status(400).json({ error: 'fullText and title are required' });
    }

    console.log(`Analyzing paper: ${title}`);

    const keyPoints = extractKeyPoints(fullText);
    const summary = generateAnalysisSummary(fullText, keyPoints);
    const topics = extractTopics(fullText);

    return res.json({
      title,
      key_points: keyPoints,
      summary,
      topics,
    });
  } catch (error: any) {
    console.error('Error analyzing paper:', error);
    return res.status(500).json({
      error: 'Failed to analyze paper',
      message: error.message,
    });
  }
});

// Helper functions
function extractKeyPoints(text: string): string[] {
  const points: string[] = [];
  const lines = text.split('\n').filter(l => l.trim().length > 0);

  for (const line of lines) {
    if (/^[-•*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const point = line.replace(/^[-•*\d.]+\s+/, '').trim();
      if (point.length > 20 && point.length < 200) {
        points.push(point);
      }
    }
  }

  return points.slice(0, 5);
}

function generateAnalysisSummary(text: string, keyPoints: string[]): string {
  const sentences = text.match(/[^.!?]*[.!?]+/g) || [];
  let summary = sentences.slice(0, 3).join(' ');

  if (keyPoints.length > 0) {
    summary += '\n\nKey findings: ' + keyPoints.slice(0, 2).join('; ');
  }

  return summary.substring(0, 500);
}

function extractTopics(text: string): string[] {
  const topics: Set<string> = new Set();
  const keywords = [
    'machine learning', 'deep learning', 'neural network',
    'natural language processing', 'computer vision',
    'reinforcement learning', 'distributed systems',
    'database', 'security', 'cryptography',
    'algorithm', 'optimization', 'performance',
    'web', 'mobile', 'cloud', 'edge computing'
  ];

  const lowerText = text.toLowerCase();
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      topics.add(keyword);
    }
  }

  return Array.from(topics);
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP Server listening on port ${PORT}`);
});

/**
 * MCP endpoints
 */

// Basic MCP info - advertise capabilities
app.get('/mcp/info', (req: Request, res: Response) => {
  const llmConfig = detectAvailableProvider();
  res.json({
    name: 'MCP Summarizer',
    version: '0.1.0',
    capabilities: ['summarize', 'categorize', 'analyze'],
    llm_provider: llmConfig.provider,
    llm_model: llmConfig.model,
    endpoints: {
      summarize: '/mcp/summarize (POST) -> { title?, fullText }',
    },
  });
});

// POST /mcp/summarize - uses LLM to summarize and categorize provided text
app.post('/mcp/summarize', async (req: Request, res: Response) => {
  try {
    const { fullText, title } = req.body;
    if (!fullText) return res.status(400).json({ error: 'fullText is required' });

    const result = await summarizeAndCategorize(fullText, title);
    return res.json({ title: title || null, ...result });
  } catch (err: any) {
    console.error('MCP summarize error:', err);
    return res.status(500).json({ error: 'MCP summarize failed', message: err.message });
  }
});

export default app;
