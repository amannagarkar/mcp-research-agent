// Mock in-memory database for demo purposes
// In production, this would connect to PostgreSQL

import { v4 as uuidv4 } from 'uuid';

interface MockDatabase {
  papers: any[];
  authors: any[];
  tags: any[];
  conferences: any[];
  categories: any[];
}

const db: MockDatabase = {
  papers: [],
  authors: [],
  tags: [],
  conferences: [],
  categories: [],
};

export const mockQuery = (text: string, params?: any[]): Promise<any> => {
  return Promise.resolve({
    rows: [],
    rowCount: 0,
  });
};

export const mockDb = {
  addPaper: (paper: any) => {
    const id = uuidv4();
    db.papers.push({ ...paper, id, created_at: new Date() });
    return { ...paper, id, created_at: new Date() };
  },

  getPapers: () => db.papers,

  getPaperById: (id: string) => db.papers.find((p) => p.id === id),

  searchPapers: (query: string) =>
    db.papers.filter(
      (p) =>
        p.title?.toLowerCase().includes(query.toLowerCase()) ||
        p.abstract?.toLowerCase().includes(query.toLowerCase())
    ),

  deletePaper: (id: string) => {
    db.papers = db.papers.filter((p) => p.id !== id);
    return true;
  },

  updatePaper: (id: string, updates: any) => {
    const paper = db.papers.find((p) => p.id === id);
    if (paper) {
      Object.assign(paper, updates, { updated_at: new Date() });
    }
    return paper;
  },

  getSimilarPapers: (paperId: string, limit: number = 10) => {
    const paper = db.papers.find((p) => p.id === paperId);
    if (!paper) return [];

    return db.papers
      .filter((p) => p.id !== paperId)
      .sort(
        (a, b) =>
          (b.tags?.length || 0) - (a.tags?.length || 0)
      )
      .slice(0, limit);
  },
};

export default mockDb;
