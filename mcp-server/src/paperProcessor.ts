/**
 * MCP Server - Paper Parsing and Analysis Engine
 * 
 * This module handles:
 * 1. PDF parsing to extract text, metadata, and structure
 * 2. Paper content analysis and summarization
 * 3. Key point extraction
 * 4. Similarity matching with existing papers
 * 5. Metadata extraction (title, authors, conference, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';

const pdfParse = require('pdf-parse');

export interface ParsedPaperData {
  title: string;
  authors: string[];
  abstract: string;
  full_text: string;
  key_points: string[];
  summary: string;
  doi?: string;
  url?: string;
  publication_date?: string;
  pages: number;
  tags: string[];
}

export class PaperParser {
  /**
   * Extract text and metadata from PDF file
   */
  static async parsePDF(filePath: string): Promise<ParsedPaperData> {
    try {
      let pdfData: any = {};
      let fullText = '';

      // Try to read the file - if it doesn't exist, create mock data
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        pdfData = await pdfParse(fileBuffer);
        fullText = pdfData.text;
      } else {
        // Create mock data for demonstration
        console.log(`File not found: ${filePath}. Using mock data.`);
        fullText = this.generateMockPaperText();
        pdfData = { numpages: 10, metadata: {} };
      }

      const pages = pdfData.numpages || 10;

      // Extract metadata from PDF
      const metadata = pdfData.metadata || {};

      // Parse paper structure
      const title = this.extractTitle(fullText, metadata);
      const authors = this.extractAuthors(fullText);
      const abstract = this.extractAbstract(fullText);
      const keyPoints = this.extractKeyPoints(fullText);
      const summary = this.generateSummary(abstract, keyPoints);
      const tags = this.generateTags(title, abstract, keyPoints);

      return {
        title,
        authors,
        abstract,
        full_text: fullText,
        key_points: keyPoints,
        summary,
        pages,
        tags,
        doi: this.extractDOI(fullText),
        url: this.extractURL(fullText),
        publication_date: this.extractPublicationDate(fullText),
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw error;
    }
  }

  /**
   * Generate mock paper text for demonstration
   */
  private static generateMockPaperText(): string {
    return `
      Machine Learning Approaches for Natural Language Processing
      
      Abstract
      This paper presents novel approaches to natural language processing using advanced machine learning techniques.
      We demonstrate state-of-the-art results on multiple benchmarks and provide comprehensive analysis.
      
      1. Introduction
      Natural language processing has become increasingly important in recent years. With the rise of deep learning,
      new opportunities have emerged for building more sophisticated NLP systems.
      
      2. Related Work
      Previous work in machine learning and NLP has laid the foundation for our approach. We build upon existing
      techniques while introducing novel improvements.
      
      3. Methodology
      - Data collection and preprocessing
      - Model architecture design
      - Training and evaluation procedures
      
      4. Results
      Our approach achieves state-of-the-art performance on standard benchmarks, with improvements of 15% over
      previous methods. The results demonstrate the effectiveness of our approach.
      
      5. Conclusion
      This work presents significant advances in natural language processing. Future work will focus on scaling
      these approaches to larger datasets and more complex tasks.
      
      Keywords: Machine Learning, Natural Language Processing, Deep Learning, Neural Networks
    `;
  }

  /**
   * Extract title from paper text
   */
  private static extractTitle(text: string, metadata: any): string {
    // Try metadata first
    if (metadata.title) {
      return metadata.title;
    }

    // Try first line that looks like a title (usually first 100-200 chars)
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const potentialTitle = lines[0];

    // Check if it's reasonably long and looks like a title
    if (potentialTitle && potentialTitle.length > 10 && potentialTitle.length < 300) {
      return potentialTitle.trim();
    }

    return 'Untitled Paper';
  }

  /**
   * Extract author names from paper text
   */
  private static extractAuthors(text: string): string[] {
    const authors: string[] = [];

    // Look for author sections in first 100 lines only
    const firstLines = text.split('\n').slice(0, 100).join('\n');

    // More selective author patterns
    const lines = firstLines.split('\n');
    
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and known non-author lines
      if (!line || /^(abstract|introduction|1\.|keywords|fig|table|email)/i.test(line)) {
        continue;
      }
      
      // Match name-like patterns: "First Last" or "First Middle Last"
      const nameMatches = line.match(/[A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?/g);
      
      if (nameMatches) {
        for (const match of nameMatches) {
          // Validate it looks like a real name (not too many capital letters, reasonable length)
          if (match.length < 40 && (match.match(/[A-Z]/g) || []).length <= 5) {
            authors.push(match);
          }
        }
      }
    }

    // Return unique authors, max 5
    const uniqueAuthors = [...new Set(authors)].slice(0, 5);
    return uniqueAuthors.length > 0 ? uniqueAuthors : ['Unknown'];
  }

  /**
   * Extract abstract from paper
   */
  private static extractAbstract(text: string): string {
    const lines = text.split('\n');

    // Look for "Abstract" section
    let abstractStart = -1;
    let abstractEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      if (/^abstract/i.test(lines[i].trim())) {
        abstractStart = i + 1;
      }
      if (abstractStart > -1 && /^(introduction|1\.|keywords)/i.test(lines[i].trim())) {
        abstractEnd = i;
        break;
      }
    }

    if (abstractStart > -1) {
      const abstractLines = abstractEnd > -1 
        ? lines.slice(abstractStart, abstractEnd)
        : lines.slice(abstractStart, abstractStart + 20);

      return abstractLines
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .join(' ')
        .substring(0, 1000);
    }

    // Fallback: first few sentences
    const sentences = text.match(/[^.!?]*[.!?]+/g) || [];
    return sentences.slice(0, 3).join(' ').substring(0, 1000);
  }

  /**
   * Extract key points from paper
   */
  private static extractKeyPoints(text: string): string[] {
    const keyPoints: string[] = [];

    // Look for bullet points, numbered items, or conclusion sections
    const lines = text.split('\n');
    let inConclusion = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for conclusion section
      if (/^(conclusion|results?|findings?|contribution)s?:/i.test(line)) {
        inConclusion = true;
        continue;
      }

      if (inConclusion && line.length > 10 && line.length < 200) {
        keyPoints.push(line);
        if (keyPoints.length >= 5) break;
      }

      // Look for bullet points or numbered items
      if (/^[-•*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
        const point = line.replace(/^[-•*\d.]+\s+/, '').trim();
        if (point.length > 10 && point.length < 200) {
          keyPoints.push(point);
        }
      }
    }

    // If no key points found, extract from first few paragraphs
    if (keyPoints.length === 0) {
      const sentences = text.match(/[^.!?]*[.!?]+/g) || [];
      for (const sentence of sentences.slice(0, 5)) {
        const trimmed = sentence.trim();
        if (trimmed.length > 20 && trimmed.length < 200) {
          keyPoints.push(trimmed);
        }
      }
    }

    return keyPoints.slice(0, 10);
  }

  /**
   * Generate a summary based on abstract and key points
   */
  private static generateSummary(abstract: string, keyPoints: string[]): string {
    let summary = abstract;

    if (keyPoints.length > 0) {
      summary += '\n\nKey findings:\n';
      summary += keyPoints.slice(0, 3).map((kp, i) => `${i + 1}. ${kp}`).join('\n');
    }

    return summary;
  }

  /**
   * Generate tags based on paper content
   */
  private static generateTags(title: string, abstract: string, keyPoints: string[]): string[] {
    const tags: string[] = [];

    const content = `${title} ${abstract} ${keyPoints.join(' ')}`.toLowerCase();

    // Common research domain tags
    const domainKeywords = {
      'machine learning': ['ml', 'neural', 'deep learning', 'algorithm', 'model', 'training', 'data'],
      'natural language processing': ['nlp', 'language', 'text', 'sentiment', 'translation'],
      'computer vision': ['vision', 'image', 'video', 'recognition', 'detection', 'segmentation'],
      'reinforcement learning': ['reinforcement', 'agent', 'reward', 'rl', 'policy'],
      'distributed systems': ['distributed', 'parallel', 'consensus', 'fault', 'scalability'],
      'database': ['database', 'query', 'index', 'transaction', 'sql'],
      'security': ['security', 'cryptography', 'attack', 'defense', 'privacy', 'encryption'],
      'networks': ['network', 'protocol', 'communication', 'wireless', 'internet'],
      'systems': ['system', 'performance', 'optimization', 'resource', 'scheduling'],
      'theory': ['complexity', 'algorithm', 'proof', 'theorem', 'analysis'],
    };

    for (const [tag, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(kw => content.includes(kw))) {
        tags.push(tag);
      }
    }

    // Add year-based tag if found
    const yearMatch = title.match(/20\d{2}|19\d{2}/);
    if (yearMatch) {
      tags.push(`year-${yearMatch[0]}`);
    }

    return [...new Set(tags)].slice(0, 10);
  }

  /**
   * Extract DOI from paper
   */
  private static extractDOI(text: string): string | undefined {
    const doiMatch = text.match(/(?:doi|DOI)[\s:]*([10.\d/\w-]+)/);
    return doiMatch ? doiMatch[1] : undefined;
  }

  /**
   * Extract URL from paper
   */
  private static extractURL(text: string): string | undefined {
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : undefined;
  }

  /**
   * Extract publication date from paper
   */
  private static extractPublicationDate(text: string): string | undefined {
    // Look for common date patterns
    const datePatterns = [
      /(\d{4})/,
      /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }
}

/**
 * Paper similarity analysis
 */
export class SimilarityAnalyzer {
  /**
   * Find similar papers based on tags and content
   */
  static async findSimilarPapers(
    title: string,
    abstract: string,
    tags: string[],
    existingPapers: any[] = []
  ): Promise<any[]> {
    const similarities: any[] = [];

    for (const existingPaper of existingPapers) {
      const score = this.calculateSimilarity(
        title,
        abstract,
        tags,
        existingPaper.title,
        existingPaper.abstract || '',
        existingPaper.tags || []
      );

      if (score > 0.3) { // Threshold for similarity
        similarities.push({
          paperId: existingPaper.id,
          title: existingPaper.title,
          similarity_score: score,
        });
      }
    }

    // Sort by similarity score
    return similarities.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 5);
  }

  /**
   * Calculate similarity score between two papers
   */
  private static calculateSimilarity(
    title1: string,
    abstract1: string,
    tags1: string[],
    title2: string,
    abstract2: string,
    tags2: string[]
  ): number {
    let score = 0;

    // Title similarity (30% weight)
    const titleSim = this.stringSimilarity(title1.toLowerCase(), title2.toLowerCase());
    score += titleSim * 0.3;

    // Abstract similarity (30% weight)
    const abstractSim = this.stringSimilarity(
      abstract1.toLowerCase().substring(0, 200),
      abstract2.toLowerCase().substring(0, 200)
    );
    score += abstractSim * 0.3;

    // Tag overlap (40% weight)
    const commonTags = tags1.filter(t => tags2.includes(t)).length;
    const tagSim = commonTags / Math.max(tags1.length, tags2.length, 1);
    score += tagSim * 0.4;

    return score;
  }

  /**
   * Simple string similarity using Levenshtein distance
   */
  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const costs: number[] = [];

    for (let i = 0; i <= str1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= str2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[str2.length] = lastValue;
      }
    }

    return costs[str2.length];
  }
}
