-- Database setup for Research Paper Management System
-- PostgreSQL schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Authors table
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  affiliation VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(first_name, last_name, affiliation)
);

-- Conferences/Venues table
CREATE TABLE conferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  short_name VARCHAR(50),
  year INTEGER,
  location VARCHAR(255),
  website VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Papers table (main table)
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  full_text TEXT,
  summary TEXT,
  key_points TEXT[], -- Array of key points extracted by MCP
  doi VARCHAR(255) UNIQUE,
  url VARCHAR(500),
  publication_date DATE,
  conference_id UUID REFERENCES conferences(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  file_path VARCHAR(500),
  file_hash VARCHAR(64) UNIQUE, -- For detecting duplicate uploads
  pages INTEGER,
  citations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  embedding VECTOR(1536) -- For similarity search (if using pgvector)
);

-- Paper Authors junction table (many-to-many)
CREATE TABLE paper_authors (
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  author_order INTEGER,
  PRIMARY KEY (paper_id, author_id)
);

-- Paper Tags junction table (many-to-many)
CREATE TABLE paper_tags (
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (paper_id, tag_id)
);

-- Paper similarity table (for caching similarity results)
CREATE TABLE paper_similarities (
  paper_id_1 UUID REFERENCES papers(id) ON DELETE CASCADE,
  paper_id_2 UUID REFERENCES papers(id) ON DELETE CASCADE,
  similarity_score FLOAT CHECK (similarity_score >= 0 AND similarity_score <= 1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (paper_id_1, paper_id_2),
  CHECK (paper_id_1 < paper_id_2) -- Ensure consistent ordering
);

-- User accounts table (for future authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User's favorite papers
CREATE TABLE user_favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, paper_id)
);

-- Processing jobs table (track MCP processing)
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  job_type VARCHAR(100), -- 'parse', 'analyze', 'find_similar'
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_papers_title ON papers(title);
CREATE INDEX idx_papers_conference_id ON papers(conference_id);
CREATE INDEX idx_papers_category_id ON papers(category_id);
CREATE INDEX idx_papers_publication_date ON papers(publication_date);
CREATE INDEX idx_papers_created_at ON papers(created_at DESC);
CREATE INDEX idx_paper_tags_tag_id ON paper_tags(tag_id);
CREATE INDEX idx_paper_authors_author_id ON paper_authors(author_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_paper_id ON processing_jobs(paper_id);

-- View for papers with author information
CREATE VIEW papers_with_authors AS
SELECT 
  p.id,
  p.title,
  p.abstract,
  p.summary,
  p.doi,
  p.url,
  p.publication_date,
  c.name as conference_name,
  cat.name as category_name,
  ARRAY_AGG(
    JSON_BUILD_OBJECT(
      'id', a.id,
      'first_name', a.first_name,
      'last_name', a.last_name,
      'affiliation', a.affiliation
    )
    ORDER BY pa.author_order
  ) as authors,
  p.created_at,
  p.updated_at
FROM papers p
LEFT JOIN conferences c ON p.conference_id = c.id
LEFT JOIN categories cat ON p.category_id = cat.id
LEFT JOIN paper_authors pa ON p.id = pa.paper_id
LEFT JOIN authors a ON pa.author_id = a.id
GROUP BY p.id, c.name, cat.name;
