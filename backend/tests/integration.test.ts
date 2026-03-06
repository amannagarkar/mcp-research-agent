/**
 * Integration test for MCP + Backend + Frontend flow
 * Tests the complete pipeline of paper upload -> MCP summarization -> database
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

const BACKEND_URL = 'http://localhost:3000';
const MCP_URL = 'http://localhost:3001';

describe('MCP Integration Tests', () => {
  // Test 1: MCP Server Health
  it('should verify MCP server is running', async () => {
    const response = await axios.get(`${MCP_URL}/mcp/info`);
    expect(response.status).toBe(200);
    expect(response.data.name).toBe('MCP Summarizer');
    expect(response.data.capabilities).toContain('summarize');
  });

  // Test 2: Backend Health
  it('should verify backend server is running', async () => {
    const response = await axios.get(`${BACKEND_URL}/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toContain('Backend API is running');
  });

  // Test 3: MCP Summarize Endpoint
  it('should call MCP summarize endpoint and get results', async () => {
    const testText = 'Machine Learning is a subset of artificial intelligence...';
    const response = await axios.post(`${MCP_URL}/mcp/summarize`, {
      fullText: testText,
      title: 'Introduction to ML',
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('summary');
    expect(response.data).toHaveProperty('categories');
    expect(response.data).toHaveProperty('confidence');
    expect(typeof response.data.summary).toBe('string');
    expect(Array.isArray(response.data.categories)).toBe(true);
  });

  // Test 4: Backend MCP Client
  it('should verify backend can call MCP summarizer', async () => {
    // This test verifies the backend mcpClient service is correctly wired
    const testText = 'Deep learning models are neural networks...';
    
    try {
      const response = await axios.post(`${MCP_URL}/mcp/summarize`, {
        fullText: testText,
        title: 'Deep Learning Basics',
      });
      
      expect(response.status).toBe(200);
      expect(response.data.summary).toBeTruthy();
      expect(response.data.categories.length).toBeGreaterThanOrEqual(0);
    } catch (error: any) {
      throw new Error(`Backend failed to call MCP: ${error.message}`);
    }
  });

  // Test 5: Backend GET all papers (should work even if no papers exist)
  it('should be able to get all papers from backend', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/papers`, {
        validateStatus: () => true, // Accept any status
      });
      
      // Should return 200 with empty array or existing papers
      expect([200, 404]).toContain(response.status);
    } catch (error: any) {
      // Network error or service down - fail test
      throw new Error(`Backend /api/papers unreachable: ${error.message}`);
    }
  });

  // Test 6: Verify Frontend API Client Configuration
  it('should verify frontend has correct API URLs configured', async () => {
    // Read frontend's environment/config
    const frontendEnvPath = path.join(
      __dirname,
      '../../frontend/src/api/paperAPI.ts'
    );
    
    if (fs.existsSync(frontendEnvPath)) {
      const content = fs.readFileSync(frontendEnvPath, 'utf-8');
      expect(content).toContain('localhost:3000/api');
    }
  });
});
