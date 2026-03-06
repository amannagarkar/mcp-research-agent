import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, BookMarked } from 'lucide-react';
import { Paper } from '../types';
import './Sidebar.css';

interface SidebarProps {
  papers: Paper[];
  selectedPaper: Paper | null;
  onSelectPaper: (paper: Paper) => void;
  onPapersLoaded: (papers: Paper[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  papers,
  selectedPaper,
  onSelectPaper,
  onPapersLoaded,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({ recent: true, all: true });

  useEffect(() => {
    const loadPapers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/papers');
        if (response.ok) {
          const data = await response.json();
          onPapersLoaded(data);
        }
      } catch (error) {
        console.error('Error loading papers:', error);
      }
    };
    
    loadPapers();
  }, [onPapersLoaded]);

  const filteredPapers = papers.filter((paper) =>
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors.some((author: string) =>
      author.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const recentPapers = papers.slice(0, 10);

  const toggleSection = (section: 'recent' | 'all') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search papers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="sidebar-section">
        <button
          className="section-header"
          onClick={() => toggleSection('recent')}
        >
          <ChevronDown
            size={18}
            style={{ transform: expandedSections.recent ? 'rotate(0)' : 'rotate(-90deg)' }}
          />
          <span>Recent Papers</span>
        </button>
        {expandedSections.recent && (
          <div className="section-content">
            {recentPapers.map((paper) => (
              <button
                key={paper.id}
                className={`paper-item ${selectedPaper?.id === paper.id ? 'active' : ''}`}
                onClick={() => onSelectPaper(paper)}
              >
                <BookMarked size={14} />
                <div className="paper-item-content">
                  <div className="paper-item-title">{paper.title}</div>
                  <div className="paper-item-authors">
                    {paper.authors.join(', ').substring(0, 50)}...
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <button
          className="section-header"
          onClick={() => toggleSection('all')}
        >
          <ChevronDown
            size={18}
            style={{ transform: expandedSections.all ? 'rotate(0)' : 'rotate(-90deg)' }}
          />
          <span>All Papers</span>
        </button>
        {expandedSections.all && (
          <div className="section-content">
            {filteredPapers.length > 0 ? (
              filteredPapers.map((paper) => (
                <button
                  key={paper.id}
                  className={`paper-item ${selectedPaper?.id === paper.id ? 'active' : ''}`}
                  onClick={() => onSelectPaper(paper)}
                >
                  <BookMarked size={14} />
                  <div className="paper-item-content">
                    <div className="paper-item-title">{paper.title}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="no-results">No papers found</div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
