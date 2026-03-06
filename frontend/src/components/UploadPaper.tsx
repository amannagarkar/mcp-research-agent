import React, { useState, useRef } from 'react';
import { Upload, Loader } from 'lucide-react';
import { paperAPI } from '../api/paperAPI';
import './UploadPaper.css';

interface UploadPaperProps {
  onUploadSuccess?: (paper: any) => void;
}

export const UploadPaper: React.FC<UploadPaperProps> = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setError('Please upload a PDF or text file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await paperAPI.uploadPaper(file);
      setSuccess(true);
      if (onUploadSuccess) {
        onUploadSuccess(result.paper);
      }
      
      // Reset after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${dragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleChange}
          disabled={loading}
          style={{ display: 'none' }}
        />

        <div className="upload-content">
          {loading ? (
            <>
              <Loader className="upload-icon loading-icon" />
              <p>Uploading and analyzing paper...</p>
            </>
          ) : success ? (
            <>
              <div className="success-icon">✓</div>
              <p>Paper uploaded successfully!</p>
            </>
          ) : (
            <>
              <Upload className="upload-icon" />
              <p>Drag and drop your paper here</p>
              <p className="upload-hint">or click to select a PDF or text file</p>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
