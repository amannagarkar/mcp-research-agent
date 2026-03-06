import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { paperAPI } from '../api/paperAPI';
import { PaperDetails } from './PaperDetails';
import './PaperBrowser.css';

interface Paper {
  id: string;
  title: string;
  abstract?: string;
  authors?: any[];
  tags?: any[];
  created_at: string;
}

export const PaperBrowser: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const data = await paperAPI.getAllPapers(50);
      setPapers(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load papers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      loadPapers();
      return;
    }

    try {
      setSearching(true);
      const results = await paperAPI.searchPapers(query, 50);
      setPapers(results);
      setError(null);
    } catch (err: any) {
      setError('Search failed');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="browser-container">
        <div className="loading-state">
          <Loader className="spinner" />
          <p>Loading papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="browser-container">
      <div className="search-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search papers by title or content..."
            value={searchQuery}
            onChange={handleSearch}
            disabled={searching}
          />
          {searching && <Loader className="search-spinner" />}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="papers-grid">
        {papers.length === 0 ? (
          <div className="empty-state">
            <p>No papers found</p>
            <p className="hint">Upload a paper to get started</p>
          </div>
        ) : (
          papers.map((paper) => (
            <div key={paper.id} className="paper-card">
              <div className="paper-header">
                <h3 className="paper-title">{paper.title}</h3>
              </div>

              {paper.abstract && (
                <p className="paper-abstract">
                  {paper.abstract.substring(0, 200)}...
                </p>
              )}

              {paper.authors && paper.authors.length > 0 && (
                <div className="paper-authors">
                  <strong>Authors:</strong> {paper.authors.map((a: any) => {
                    // Handle both string and object formats
                    if (typeof a === 'string') {
                      return a;
                    } else if (a.name) {
                      return a.name;
                    } else if (a.first_name || a.last_name) {
                      return `${a.first_name || ''} ${a.last_name || ''}`.trim();
                    }
                    return 'Unknown';
                  }).filter(Boolean).join(', ')}
                </div>
              )}

              {paper.tags && paper.tags.length > 0 && (
                <div className="paper-tags">
                  {paper.tags.map((tag: any, idx: number) => {
                    const tagText = typeof tag === 'string' ? tag : (tag.name || 'tag');
                    return (
                      <span key={`${tagText}-${idx}`} className="tag">
                        {tagText}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="paper-meta">
                <span className="date">
                  {new Date(paper.created_at).toLocaleDateString()}
                </span>
                <button className="view-btn" onClick={() => setSelectedPaper(paper)}>View Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPaper && (
        <PaperDetails 
          paper={selectedPaper} 
          onClose={() => setSelectedPaper(null)} 
        />
      )}
    </div>
  );
};
