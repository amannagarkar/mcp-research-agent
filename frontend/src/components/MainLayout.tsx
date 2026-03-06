import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { PaperListSection } from './PaperListSection';
import { ChatUploadSection } from './ChatUploadSection';
import { Paper } from '../types';
import './MainLayout.css';

export const MainLayout: React.FC = () => {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handlePaperSelect = (paper: Paper) => {
    setSelectedPaper(paper);
  };

  const handlePaperUpload = (paper: Paper) => {
    setPapers((prev) => [paper, ...prev]);
    setSelectedPaper(paper);
  };

  return (
    <div className="main-layout">
      <header className="layout-header">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="header-title">
          <h1>Research Paper Management System</h1>
        </div>
        <div className="header-spacer" />
      </header>

      <div className="layout-container">
        {sidebarOpen && (
          <Sidebar 
            papers={papers} 
            selectedPaper={selectedPaper}
            onSelectPaper={handlePaperSelect}
            onPapersLoaded={setPapers}
          />
        )}

        <div className="main-content">
          <ChatUploadSection 
            onPaperUpload={handlePaperUpload}
            selectedPaper={selectedPaper}
          />
          
          <PaperListSection 
            papers={papers}
            selectedPaper={selectedPaper}
            onSelectPaper={handlePaperSelect}
            onPapersLoaded={setPapers}
          />
        </div>
      </div>
    </div>
  );
};
