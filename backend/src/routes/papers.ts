import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import { PaperService } from '../services/paperService';
import axios from 'axios';

const router = Router();
const upload = multer({ dest: 'uploads/' });

/**
 * POST /api/papers/upload
 * Upload and parse a research paper
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { title, authors, category, tags } = req.body;

    // Calculate file hash for duplicate detection
    const fileContent = require('fs').readFileSync(req.file.path);
    const fileHash = PaperService.calculateFileHash(fileContent);

    // Check if paper already exists
    const existingPaper = await PaperService.paperExists(fileHash);
    if (existingPaper) {
      return res.status(409).json({ 
        error: 'Paper already exists in database',
        paperId: existingPaper.id 
      });
    }

    // Send to MCP server for parsing and analysis
    const absolutePath = require('path').resolve(req.file.path);
    const mcpResponse = await axios.post('http://localhost:3001/api/parse-paper', {
      filePath: absolutePath,
      fileName: req.file.filename,
    });

    const parsedData = mcpResponse.data;

    // Optionally call MCP summarizer/categorizer for stronger summary / categories
    const mcpClient = require('../services/mcpClient');
    let mcpResult = null;
    try {
      mcpResult = await mcpClient.summarizeViaMCP(parsedData.full_text || parsedData.abstract || '', parsedData.title || title);
    } catch (mcpErr: any) {
      console.warn('MCP summarize failed, falling back to parsed data summary:', mcpErr && mcpErr.message ? mcpErr.message : mcpErr);
    }

    const mergedSummary = (mcpResult && mcpResult.summary) ? mcpResult.summary : (parsedData.summary || '');
    const mergedCategories = (mcpResult && mcpResult.categories && mcpResult.categories.length > 0) ? mcpResult.categories : (parsedData.tags || []);

    // Create paper in database
    const paper = await PaperService.createPaper(
      {
        title: title || parsedData.title,
        abstract: parsedData.abstract,
        full_text: parsedData.full_text,
        summary: mergedSummary,
        key_points: parsedData.key_points,
        doi: parsedData.doi,
        url: parsedData.url,
        publication_date: parsedData.publication_date ? new Date(parsedData.publication_date) : undefined,
        file_path: req.file.path,
        file_hash: fileHash,
        pages: parsedData.pages,
      },
      authors ? JSON.parse(authors) : parsedData.authors,
      tags ? JSON.parse(tags) : mergedCategories
    );

    // Find similar papers
    const similarPapers = await axios.post('http://localhost:3001/api/find-similar', {
      paperId: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      tags: paper.key_points,
    });

    return res.status(201).json({
      paper,
      similarPapers: similarPapers.data.similar_papers,
    });
  } catch (error: any) {
    console.error('Error uploading paper:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * GET /api/papers/:id
 * Get a specific paper with all details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const paper = await PaperService.getPaperById(req.params.id);
    return res.json(paper);
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

/**
 * GET /api/papers
 * Get all papers with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const papers = await PaperService.getAllPapers(limit, offset);
    return res.json(papers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/papers/search
 * Search papers by title or abstract
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, limit } = req.body;

    // If query is empty, return all papers
    if (!query || query.trim() === '') {
      const allPapers = await PaperService.getAllPapers(limit || 20, 0);
      return res.json(allPapers);
    }

    const results = await PaperService.searchPapers(query, limit || 20);
    return res.json(results);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/papers/:id/similar
 * Get papers similar to the specified paper
 */
router.get('/:id/similar', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const papers = await PaperService.getSimilarPapers(req.params.id, limit);
    return res.json(papers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/papers/:id
 * Update paper metadata
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await PaperService.updatePaper(req.params.id, req.body);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/papers/:id
 * Delete a paper
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await PaperService.deletePaper(req.params.id);
    if (deleted) {
      return res.json({ message: 'Paper deleted successfully' });
    } else {
      return res.status(404).json({ error: 'Paper not found' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
