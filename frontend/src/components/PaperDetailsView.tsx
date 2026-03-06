import React from 'react';
import { X, Download, Copy } from 'lucide-react';
import { Paper } from '../types';
import './PaperDetailsView.css';

interface PaperDetailsViewProps {
  paper: Paper;
  onClose: () => void;
}

export const PaperDetailsView: React.FC<PaperDetailsViewProps> = ({ paper, onClose }) => {
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([paper.full_text || ''], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${paper.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paper.full_text || paper.abstract);
  };

  return (
    <div className="paper-details-overlay" onClick={onClose}>
      <div className="paper-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="details-header">
          <h2>{paper.title}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="details-content">
          <div className="paper-metadata">
            <div className="metadata-row">
              <label>Authors:</label>
              <div className="authors-list">
                {paper.authors.map((author: string, idx: number) => (
                  <span key={idx} className="author-badge">
                    {author}
                  </span>
                ))}
              </div>
            </div>

            {paper.conference && (
              <div className="metadata-row">
                <label>Conference:</label>
                <span>{paper.conference}</span>
              </div>
            )}

            {paper.category && (
              <div className="metadata-row">
                <label>Category:</label>
                <span>{paper.category}</span>
              </div>
            )}

            {paper.topic && (
              <div className="metadata-row">
                <label>Topic:</label>
                <span>{paper.topic}</span>
              </div>
            )}

            {paper.doi && (
              <div className="metadata-row">
                <label>DOI:</label>
                <span>{paper.doi}</span>
              </div>
            )}

            <div className="metadata-row">
              <label>Date:</label>
              <span>{new Date(paper.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="paper-section">
            <h3>Abstract</h3>
            <p>{paper.abstract}</p>
          </div>

          {paper.summary && (
            <div className="paper-section">
              <h3>Summary</h3>
              <p>{paper.summary}</p>
            </div>
          )}

          {paper.tags && paper.tags.length > 0 && (
            <div className="paper-section">
              <h3>Tags</h3>
              <div className="tags-list">
                {paper.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {paper.full_text && (
            <div className="paper-section">
              <h3>Full Text Preview</h3>
              <p className="full-text-preview">
                {paper.full_text.substring(0, 500)}...
              </p>
            </div>
          )}
        </div>

        <div className="details-footer">
          <button className="action-button" onClick={handleDownload}>
            <Download size={18} /> Download as Text
          </button>
          <button className="action-button" onClick={handleCopy}>
            <Copy size={18} /> Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};
