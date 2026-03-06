import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Paper, FilterOptions } from '../types';
import { PaperDetailsView } from './PaperDetailsView';
import './PaperListSection.css';

interface PaperListSectionProps {
  papers: Paper[];
  selectedPaper: Paper | null;
  onSelectPaper: (paper: Paper) => void;
  onPapersLoaded: (papers: Paper[]) => void;
}

export const PaperListSection: React.FC<PaperListSectionProps> = ({
  papers,
  selectedPaper,
  onSelectPaper,
}: PaperListSectionProps) => {
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>(papers);
  const [selectedFilters, setSelectedFilters] = useState({
    conferences: new Set<string>(),
    categories: new Set<string>(),
    topics: new Set<string>(),
    years: new Set<string>(),
    authors: new Set<string>(),
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    conferences: [],
    categories: [],
    topics: [],
    years: [],
    authors: [],
  });
  const [groupBy, setGroupBy] = useState<'category' | 'conference' | 'date'>('category');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    extractFilterOptions();
    applyFilters();
  }, [papers]);

  const extractFilterOptions = () => {
    const conferences = new Set<string>();
    const categories = new Set<string>();
    const topics = new Set<string>();
    const years = new Set<string>();
    const authors = new Set<string>();

    papers.forEach((paper) => {
      if (paper.conference) conferences.add(paper.conference);
      if (paper.category) categories.add(paper.category);
      if (paper.topic) topics.add(paper.topic);
      if (paper.created_at) {
        const year = new Date(paper.created_at).getFullYear().toString();
        years.add(year);
      }
      paper.authors.forEach((author: string) => authors.add(author));
    });

    setFilterOptions({
      conferences: Array.from(conferences).sort(),
      categories: Array.from(categories).sort(),
      topics: Array.from(topics).sort(),
      years: Array.from(years).sort().reverse(),
      authors: Array.from(authors).sort(),
    });
  };

  const applyFilters = () => {
    let filtered = papers;

    if (selectedFilters.conferences.size > 0) {
      filtered = filtered.filter((p) =>
        p.conference && selectedFilters.conferences.has(p.conference)
      );
    }

    if (selectedFilters.categories.size > 0) {
      filtered = filtered.filter((p) =>
        p.category && selectedFilters.categories.has(p.category)
      );
    }

    if (selectedFilters.topics.size > 0) {
      filtered = filtered.filter((p) =>
        p.topic && selectedFilters.topics.has(p.topic)
      );
    }

    if (selectedFilters.years.size > 0) {
      filtered = filtered.filter((p) => {
        const year = new Date(p.created_at).getFullYear().toString();
        return selectedFilters.years.has(year);
      });
    }

    if (selectedFilters.authors.size > 0) {
      filtered = filtered.filter((p) =>
        p.authors.some((author: string) => selectedFilters.authors.has(author))
      );
    }

    setFilteredPapers(filtered);
  };

  const handleFilterToggle = (
    filterType: keyof typeof selectedFilters,
    value: string
  ) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      const newSet = new Set(updated[filterType]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      updated[filterType] = newSet;
      return updated;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      conferences: new Set(),
      categories: new Set(),
      topics: new Set(),
      years: new Set(),
      authors: new Set(),
    });
  };

  const groupPapers = () => {
    const grouped: { [key: string]: Paper[] } = {};

    filteredPapers.forEach((paper) => {
      let key = 'Unknown';

      if (groupBy === 'category') {
        key = paper.category || 'Uncategorized';
      } else if (groupBy === 'conference') {
        key = paper.conference || 'No Conference';
      } else if (groupBy === 'date') {
        key = new Date(paper.created_at).toLocaleDateString();
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(paper);
    });

    return grouped;
  };

  const totalFilters = Object.values(selectedFilters).reduce(
    (sum, set) => sum + set.size,
    0
  );

  const groupedPapers = groupPapers();

  return (
    <div className="paper-list-section">
      <div className="filters-panel">
        <div className="filters-header">
          <h3>
            <Filter size={18} /> Filters
            {totalFilters > 0 && <span className="filter-badge">{totalFilters}</span>}
          </h3>
          {totalFilters > 0 && (
            <button className="clear-filters" onClick={clearAllFilters}>
              Clear All
            </button>
          )}
        </div>

        <div className="groupby-section">
          <label>Group By:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
            className="groupby-select"
          >
            <option value="category">Category</option>
            <option value="conference">Conference</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div className="filter-group">
          <h4>Conferences</h4>
          <div className="filter-options">
            {filterOptions.conferences.map((conf: string) => (
              <label key={conf} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedFilters.conferences.has(conf)}
                  onChange={() => handleFilterToggle('conferences', conf)}
                />
                {conf}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h4>Categories</h4>
          <div className="filter-options">
            {filterOptions.categories.map((cat: string) => (
              <label key={cat} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedFilters.categories.has(cat)}
                  onChange={() => handleFilterToggle('categories', cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h4>Topics</h4>
          <div className="filter-options">
            {filterOptions.topics.map((topic: string) => (
              <label key={topic} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedFilters.topics.has(topic)}
                  onChange={() => handleFilterToggle('topics', topic)}
                />
                {topic}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h4>Years</h4>
          <div className="filter-options">
            {filterOptions.years.map((year: string) => (
              <label key={year} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedFilters.years.has(year)}
                  onChange={() => handleFilterToggle('years', year)}
                />
                {year}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h4>Authors</h4>
          <div className="filter-options">
            {filterOptions.authors.slice(0, 10).map((author: string) => (
              <label key={author} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedFilters.authors.has(author)}
                  onChange={() => handleFilterToggle('authors', author)}
                />
                {author}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="papers-display">
        {Object.entries(groupedPapers).map(([groupKey, groupPapers]) => (
          <div key={groupKey} className="paper-group">
            <h3 className="group-title">{groupKey}</h3>
            <div className="papers-grid">
              {groupPapers.map((paper) => (
                <div
                  key={paper.id}
                  className={`paper-card ${selectedPaper?.id === paper.id ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectPaper(paper);
                    setShowDetails(true);
                  }}
                >
                  <div className="paper-card-header">
                    <h4>{paper.title}</h4>
                  </div>
                  <div className="paper-card-body">
                    <p className="paper-abstract">{paper.abstract.substring(0, 100)}...</p>
                    <div className="paper-meta">
                      <span className="meta-authors">{paper.authors[0]}</span>
                      <span className="meta-date">
                        {new Date(paper.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {paper.tags && (
                      <div className="paper-tags">
                        {paper.tags.slice(0, 2).map((tag: string, idx: number) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredPapers.length === 0 && (
          <div className="no-papers">
            <p>No papers match your filters</p>
          </div>
        )}
      </div>

      {showDetails && selectedPaper && (
        <PaperDetailsView
          paper={selectedPaper}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};
