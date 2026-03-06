import React from 'react';
import { BookOpen, Upload, Database } from 'lucide-react';
import './App.css';
import { UploadPaper } from './components/UploadPaper';
import { PaperBrowser } from './components/PaperBrowser';

type AppPage = 'home' | 'upload' | 'browse';

function App() {
  const [currentPage, setCurrentPage] = React.useState<AppPage>('home');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <BookOpen className="logo-icon" />
            <h1>Research Paper Agent</h1>
          </div>
          <nav className="nav-menu">
            <button
              className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
            <button
              className={`nav-button ${currentPage === 'upload' ? 'active' : ''}`}
              onClick={() => setCurrentPage('upload')}
            >
              <Upload size={18} />
              Upload Paper
            </button>
            <button
              className={`nav-button ${currentPage === 'browse' ? 'active' : ''}`}
              onClick={() => setCurrentPage('browse')}
            >
              <Database size={18} />
              Browse Papers
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'home' && (
          <div className="home-page">
            <div className="hero-section">
              <h2>Welcome to Research Paper Agent</h2>
              <p>An intelligent system for parsing, analyzing, and managing research papers</p>
              <button
                className="primary-button"
                onClick={() => setCurrentPage('upload')}
              >
                Get Started - Upload a Paper
              </button>
            </div>

            <div className="features-section">
              <div className="feature-card">
                <div className="feature-icon">📄</div>
                <h3>Smart Parsing</h3>
                <p>Automatically extract metadata, authors, abstract, and key insights from research papers</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Find Similar Papers</h3>
                <p>Discover related research papers in your domain of interest</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💾</div>
                <h3>Organized Database</h3>
                <p>Store and manage papers with tags, categories, and comprehensive metadata</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏷️</div>
                <h3>Auto-Tagging</h3>
                <p>Intelligent categorization and tagging based on paper content</p>
              </div>
            </div>

            <div className="how-it-works">
              <h3>How It Works</h3>
              <div className="steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <h4>Upload Paper</h4>
                  <p>Upload a PDF or text research paper</p>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <h4>Parsing & Analysis</h4>
                  <p>MCP server parses the paper and extracts metadata</p>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <h4>Find Similar Papers</h4>
                  <p>Discover related papers in the database</p>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <h4>Store & Browse</h4>
                  <p>Paper is stored with tags and easily searchable</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'upload' && (
          <div className="page-wrapper">
            <h2>Upload Research Paper</h2>
            <p className="page-subtitle">Upload a PDF or text file to parse and analyze a research paper</p>
            <UploadPaper onUploadSuccess={() => setCurrentPage('browse')} />
          </div>
        )}

        {currentPage === 'browse' && (
          <div className="page-wrapper">
            <h2>Browse Papers</h2>
            <p className="page-subtitle">Explore all papers in the database</p>
            <PaperBrowser />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Research Paper Agent. Built with React, Node.js, and PostgreSQL.</p>
      </footer>
    </div>
  );
}

export default App;
