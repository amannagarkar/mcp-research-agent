import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload } from 'lucide-react';
import { Paper, ChatMessage } from '../types';
import './ChatUploadSection.css';

interface ChatUploadSectionProps {
  onPaperUpload: (paper: Paper) => void;
  selectedPaper: Paper | null;
}

export const ChatUploadSection: React.FC<ChatUploadSectionProps> = ({
  onPaperUpload,
  selectedPaper,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      paperId: selectedPaper?.id,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          paperId: selectedPaper?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          paperId: selectedPaper?.id,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/papers/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const paper = await response.json();
        onPaperUpload(paper);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-upload-section">
      <div className="upload-area">
        <div className="upload-box">
          <Upload size={32} />
          <h3>Upload Research Paper</h3>
          <p>Drop your PDF or text file here</p>
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".pdf,.txt"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.role}`}
            >
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about the paper..."
            className="chat-input"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            className="send-button"
            disabled={loading || !inputValue.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
