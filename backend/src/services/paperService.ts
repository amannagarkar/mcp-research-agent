import { v4 as uuidv4 } from 'uuid';
import mockDb from '../mockDb';
import * as sha256 from 'js-sha256';

export interface Paper {
  id: string;
  title: string;
  abstract?: string;
  full_text?: string;
  summary?: string;
  key_points?: string[];
  doi?: string;
  url?: string;
  publication_date?: Date;
  conference_id?: string;
  category_id?: string;
  file_path?: string;
  file_hash?: string;
  pages?: number;
  citations_count?: number;
  created_at: Date;
  updated_at: Date;
}

export class PaperService {
  static async createPaper(paperData: Partial<Paper>, authors?: string[], tags?: string[]): Promise<Paper> {
    console.log('[Service] createPaper - title=', paperData.title, 'authors=', authors?.length || 0, 'tags=', tags?.length || 0);
    const paper = mockDb.addPaper({
      ...paperData,
      authors: authors || [],
      tags: tags || [],
    });
    console.log('[Service] createPaper - created id=', paper.id);
    return paper;
  }

  static async getPaperById(paperId: string): Promise<Paper> {
    console.log('[Service] getPaperById - id=', paperId);
    const paper = mockDb.getPaperById(paperId);
    if (!paper) {
      console.log('[Service] getPaperById - not found id=', paperId);
      throw new Error('Paper not found');
    }
    return paper;
  }

  static async searchPapers(query_text: string, limit: number = 20): Promise<Paper[]> {
    console.log('[Service] searchPapers - query=', query_text, 'limit=', limit);
    return mockDb.searchPapers(query_text).slice(0, limit);
  }

  static async getPapersByCategory(categoryId: string, limit: number = 50): Promise<Paper[]> {
    return mockDb.getPapers().filter((p) => p.category_id === categoryId).slice(0, limit);
  }

  static async getPapersByTag(tagId: string, limit: number = 50): Promise<Paper[]> {
    return mockDb.getPapers().filter((p) => p.tags?.includes(tagId)).slice(0, limit);
  }

  static async updatePaper(paperId: string, updates: Partial<Paper>): Promise<Paper> {
    console.log('[Service] updatePaper - id=', paperId, 'updates=', Object.keys(updates || {}).join(','));
    const paper = mockDb.updatePaper(paperId, updates);
    if (!paper) {
      console.log('[Service] updatePaper - not found id=', paperId);
      throw new Error('Paper not found');
    }
    console.log('[Service] updatePaper - updated id=', paperId);
    return paper;
  }

  static async deletePaper(paperId: string): Promise<boolean> {
    console.log('[Service] deletePaper - id=', paperId);
    const ok = mockDb.deletePaper(paperId);
    console.log('[Service] deletePaper - result=', ok);
    return ok;
  }

  static async addAuthorToPaper(paperId: string, authorName: string, order: number): Promise<void> {
    const paper = mockDb.getPaperById(paperId);
    if (paper) {
      if (!paper.authors) paper.authors = [];
      paper.authors.push({ name: authorName, order });
    }
  }

  static async addTagToPaper(paperId: string, tagName: string): Promise<void> {
    const paper = mockDb.getPaperById(paperId);
    if (paper) {
      if (!paper.tags) paper.tags = [];
      if (!paper.tags.includes(tagName)) {
        paper.tags.push(tagName);
      }
    }
  }

  static async getSimilarPapers(paperId: string, limit: number = 10): Promise<Paper[]> {
    console.log('[Service] getSimilarPapers - id=', paperId, 'limit=', limit);
    return mockDb.getSimilarPapers(paperId, limit);
  }

  static async getAllPapers(limit: number = 50, offset: number = 0): Promise<Paper[]> {
    console.log('[Service] getAllPapers - offset=', offset, 'limit=', limit);
    return mockDb.getPapers().slice(offset, offset + limit);
  }

  static async paperExists(fileHash: string): Promise<Paper | null> {
    console.log('[Service] paperExists - fileHash=', fileHash);
    const papers = mockDb.getPapers();
    const found = papers.find((p) => p.file_hash === fileHash) || null;
    console.log('[Service] paperExists - found=', !!found);
    return found;
  }

  static calculateFileHash(content: Buffer | string): string {
    const data = typeof content === 'string' ? content : content.toString();
    return sha256.sha256(data);
  }
}
