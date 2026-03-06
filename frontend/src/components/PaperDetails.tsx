import React from 'react';
import { X, Download, Copy } from 'lucide-react';
import './PaperDetails.css';

interface PaperDetailsProps {
  paper: any;
  onClose: () => void;
}

export const PaperDetails: React.FC<PaperDetailsProps> = ({ paper, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = `${paper.title}\n\nAuthors: ${paper.authors ? paper.authors.join(', ') : 'Unknown'}\n\nAbstract: ${paper.abstract || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `
Title: ${paper.title}

Authors: ${paper.authors ? paper.authors.join(', ') : 'Unknown'}

Abstract:
${paper.abstract || 'No abstract available'}

Key Points:
${(paper.key_points || []).map((point: string) => `- ${point}`).join('\n')}

Tags: ${(paper.tags || []).join(', ')}

Pages: ${paper.pages || 'Unknown'}

Created: ${new Date(paper.created_at).toLocaleString()}

Full Text:
${paper.full_text || 'No full text available'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{paper.title}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Paper Metadata */}
          <div className="section">
            <h3>📋 Metadata</h3>
            <div className="metadata-grid">
              <div className="meta-item">
                <span className="meta-label">ID:</span>
                <span className="meta-value">{paper.id}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span className="meta-value">{new Date(paper.created_at).toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Pages:</span>
                <span className="meta-value">{paper.pages || 'Unknown'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">DOI:</span>
                <span className="meta-value">{paper.doi || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Authors */}
          {paper.authors && paper.authors.length > 0 && (
            <div className="section">
              <h3>✍️ Authors</h3>
              <div className="authors-list">
                {paper.authors.map((author: any, index: number) => (
                  <div key={index} className="author-item">
                    {typeof author === 'string' ? author : author.name || 'Unknown'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abstract */}
          {paper.abstract && (
            <div className="section">
              <h3>📄 Abstract</h3>
              <p className="abstract-text">{paper.abstract}</p>
            </div>
          )}

          {/* Key Points */}
          {paper.key_points && paper.key_points.length > 0 && (
            <div className="section">
              <h3>🎯 Key Points</h3>
              <ul className="key-points-list">
                {paper.key_points.map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {paper.summary && (
            <div className="section">
              <h3>📝 Summary</h3>
              <p className="summary-text">{paper.summary}</p>
            </div>
          )}

          {/* Tags */}
          {paper.tags && paper.tags.length > 0 && (
            <div className="section">
              <h3>🏷️ Tags</h3>
              <div className="tags-container">
                {paper.tags.map((tag: any, index: number) => (
                  <span key={index} className="tag-badge">
                    {typeof tag === 'string' ? tag : tag.name || 'tag'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Text Preview */}
          {paper.full_text && (
            <div className="section">
              <h3>📖 Full Text Preview</h3>
              <div className="full-text-preview">
                {paper.full_text.substring(0, 500)}...
              </div>
              <p className="text-length">
                Total text length: {paper.full_text.length} characters
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="modal-footer">
          <button className="action-btn download-btn" onClick={handleDownload}>
            <Download size={18} />
            Download
          </button>
          <button className="action-btn copy-btn" onClick={handleCopy}>
            <Copy size={18} />
            {copied ? 'Copied!' : 'Copy Info'}
          </button>
          <button className="action-btn close-btn-footer" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
