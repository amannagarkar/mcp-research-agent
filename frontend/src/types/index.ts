export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  tags: string[];
  created_at: string;
  conference?: string;
  category?: string;
  topic?: string;
  pages?: string;
  doi?: string;
  full_text?: string;
  summary?: string;
}

export interface FilterOptions {
  conferences: string[];
  authors: string[];
  topics: string[];
  categories: string[];
  years: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  paperId?: string;
}
