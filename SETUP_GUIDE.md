# Setup & Run Guide

Complete step-by-step instructions for setting up and running the Research Paper MCP Agent project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Running All Services](#running-all-services)
4. [Individual Service Setup](#individual-service-setup)
5. [Verification & Testing](#verification--testing)
6. [Environment Configuration](#environment-configuration)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **macOS/Linux/Windows** with terminal access
- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **Python** 3.8+ (for PDF processing - optional)

### Check Prerequisites

```bash
# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: 8.0.0 or higher

# Check Python version (optional)
python3 --version
# Expected: Python 3.8 or higher
```

### Install Node.js (if needed)

**macOS (using Homebrew):**
```bash
brew install node
```

**macOS (direct download):**
- Visit https://nodejs.org/
- Download LTS version
- Run installer

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
- Download from https://nodejs.org/
- Run .msi installer
- Restart terminal after installation

## Initial Setup

### Step 1: Clone/Navigate to Project

```bash
# Navigate to the project directory
cd /Users/amannagarkar/Documents/SCU\ Phd\ Coursework/EMGT-Project/EMGT-Project/mcp-research-agent

# Or set an alias for easier access
alias mcp_cd='cd /Users/amannagarkar/Documents/SCU\ Phd\ Coursework/EMGT-Project/EMGT-Project/mcp-research-agent'
mcp_cd
```

### Step 2: Verify Directory Structure

```bash
ls -la

# Should show:
# README.md
# ARCHITECTURE.md
# SETUP_GUIDE.md (this file)
# .env.example
# mcp-server/
# backend/
# frontend/
# res/
# src/
```

### Step 3: Install Root Dependencies (if using monorepo setup)

```bash
npm install

# Note: Each service has its own package.json and node_modules
```

### Step 4: Install Service Dependencies

**MCP Server:**
```bash
cd mcp-server
npm install
npm run build
cd ..
```

**Backend:**
```bash
cd backend
npm install
npm run build
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### Step 5: Configure Environment Variables

Copy and configure `.env` files for each service:

**MCP Server:**
```bash
# Copy template
cp .env.example mcp-server/.env

# Edit configuration (use your preferred editor)
nano mcp-server/.env
# or
vim mcp-server/.env
# or
code mcp-server/.env  # VS Code
```

**Backend:**
```bash
cp .env.example backend/.env
nano backend/.env
```

**Frontend:**
```bash
cp .env.example frontend/.env
nano frontend/.env
```

See [Environment Configuration](#environment-configuration) section below for detailed setup.

## Running All Services

### Option A: Run All Services in One Command (Recommended for Development)

From project root:

```bash
npm start
```

This uses a root `package.json` script that starts all three services simultaneously.

**Expected Output:**
```
> npm start

[mcp-server] npm start
[backend] npm start
[frontend] npm run dev

MCP Server listening on port 3001
Backend Server running on port 3000
Vite local preview server running at:
➜  Local: http://localhost:5173
```

**To Stop:** Press `Ctrl+C` twice

### Option B: Run Services in Separate Terminals (Better for Debugging)

Open three terminal windows and navigate to project root in each.

**Terminal 1 - MCP Server:**
```bash
cd mcp-server
npm start

# Output:
# > research-paper-mcp-server@1.0.0 start
# > node dist/index.js
# 
# MCP Server listening on port 3001
# [LLM] Detected provider: (mock|gemini|claude|etc)
```

**Terminal 2 - Backend API:**
```bash
cd backend
npm start

# Output:
# > research-paper-backend@1.0.0 start
# > node dist/index.js
# 
# Backend Server running on port 3000
# Connected to database (or file storage)
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev

# Output:
# VITE v4.x.x  ready in xxx ms
# 
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### Option C: Run with Docker Compose

```bash
# Build images
docker-compose build

# Start all services
docker-compose up

# In another terminal, view logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Individual Service Setup

### MCP Server Setup

**Directory:**
```bash
cd mcp-server
```

**Installation:**
```bash
npm install
npm run build
```

**Configuration (`.env`):**
```properties
MCP_PORT=3001

# Leave all LLM keys commented for mock responses
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
# DEEPSEEK_API_KEY=
# GEMINI_API_KEY=
```

**Run Modes:**

```bash
# Production build & run
npm start

# Development with auto-reload
npm run dev

# Just build TypeScript
npm run build

# Run tests
npm test

# Clean build
npm run clean && npm run build
```

**Verify Server:**
```bash
# Test MCP server info endpoint
curl http://localhost:3001/mcp/info

# Expected response:
# {
#   "name": "Research Paper MCP Server",
#   "version": "1.0.0",
#   "llm_provider": "mock",
#   "capabilities": ["summarize", "categorize"]
# }
```

### Backend API Setup

**Directory:**
```bash
cd backend
```

**Installation:**
```bash
npm install
npm run build
```

**Configuration (`.env`):**
```properties
PORT=3000
MCP_URL=http://localhost:3001
DATABASE_URL=postgresql://user:password@localhost:5432/research_papers
NODE_ENV=development
```

**Run Modes:**

```bash
# Production build & run
npm start

# Development with auto-reload
npm run dev

# Just build TypeScript
npm run build

# Run tests
npm test
```

**Verify Backend:**
```bash
# Test backend health endpoint
curl http://localhost:3000/api/health

# Expected response:
# { "status": "ok", "timestamp": "..." }
```

### Frontend Setup

**Directory:**
```bash
cd frontend
```

**Installation:**
```bash
npm install
```

**Configuration (`.env`):**
```properties
VITE_API_URL=http://localhost:3000/api
```

**Run Modes:**

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

**Access Frontend:**
- Open browser to http://localhost:5173
- Or access via: `open http://localhost:5173` (macOS)

## Verification & Testing

### Step 1: Verify All Services Are Running

```bash
# Check MCP server
curl http://localhost:3001/mcp/info
# Should return JSON with server info

# Check Backend
curl http://localhost:3000/api/health
# Should return { "status": "ok", ... }

# Check Frontend
curl http://localhost:5173
# Should return HTML content
```

### Step 2: Test Paper Upload Flow

**Create test file:**
```bash
cat > /tmp/test_paper.txt << 'EOF'
Title: Machine Learning Advances 2024

Abstract: This paper presents novel approaches to deep learning and neural networks. 
We propose transformer-based architectures for natural language processing tasks.
Our model achieves state-of-the-art results on multiple benchmarks.

Keywords: machine learning, deep learning, transformers, NLP
EOF
```

**Upload via API:**
```bash
curl -X POST http://localhost:3000/api/papers \
  -F "file=@/tmp/test_paper.txt" \
  -F "title=Test Paper"

# Expected response:
# {
#   "id": "paper_12345...",
#   "title": "Test Paper",
#   "status": "pending"
# }
```

**Check analysis results:**
```bash
# Replace paper_id with ID from above response
curl http://localhost:3000/api/analysis/paper_12345

# Expected response (after processing):
# {
#   "summary": "Machine learning advances...",
#   "categories": ["Machine Learning", "NLP"],
#   "confidence": 0.85
# }
```

### Step 3: Test MCP Directly

```bash
curl -X POST http://localhost:3001/mcp/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "fullText": "Deep learning revolutionizes artificial intelligence. Neural networks with multiple layers enable learning complex patterns. Transformers use attention mechanisms for sequence processing.",
    "title": "Deep Learning Overview"
  }'

# Expected response:
# {
#   "title": "Deep Learning Overview",
#   "summary": "Concise 3-5 sentence summary...",
#   "categories": ["Machine Learning", "Deep Learning"],
#   "confidence": 0.90
# }
```

### Step 4: Load Test

```bash
# Simple load test with Apache Bench
# Install: brew install httpd (macOS) or apt-get install apache2-utils (Linux)

# Test MCP endpoint with 100 requests, 5 concurrent
ab -n 100 -c 5 http://localhost:3001/mcp/info

# Test Backend endpoint
ab -n 100 -c 5 http://localhost:3000/api/health
```

## Environment Configuration

### MCP Server (.env)

**Default Configuration:**
```properties
# Server Port
MCP_PORT=3001

# LLM Provider Selection
# The MCP will automatically detect and use the first configured provider
# Priority: Claude > Deepseek > Gemini > OpenAI > Mock

# === OPTION 1: Use Mock Responses (Default, No API Key Needed) ===
# Leave all API keys commented out to use mock responses
# Perfect for development and testing

# === OPTION 2: Use Claude (Anthropic) ===
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
# CLAUDE_MODEL=claude-3-5-sonnet-20241022

# === OPTION 3: Use Deepseek ===
# DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
# DEEPSEEK_MODEL=deepseek-chat

# === OPTION 4: Use Google Gemini ===
# GEMINI_API_KEY=AIzaSyxxxxxxxxxxx
# GEMINI_MODEL=gemini-pro

# === OPTION 5: Use OpenAI ===
# OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
# OPENAI_MODEL=gpt-3.5-turbo
```

**Getting API Keys:**

| Provider | Free Tier | Sign Up |
|----------|-----------|---------|
| Gemini | Yes (generous) | https://aistudio.google.com |
| Claude | Limited credits | https://console.anthropic.com |
| Deepseek | Trial credits | https://platform.deepseek.com |
| OpenAI | None (paid) | https://platform.openai.com |

### Backend (.env)

```properties
# Server Configuration
PORT=3000
NODE_ENV=development  # or production

# MCP Server Connection
MCP_URL=http://localhost:3001

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/research_papers

# Or use SQLite (file-based, no setup needed)
# DATABASE_TYPE=sqlite
# DATABASE_PATH=./data/papers.db

# Logging
LOG_LEVEL=info  # debug, info, warn, error

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800  # 50MB in bytes

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```properties
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Feature Flags
VITE_ENABLE_ADVANCED_SEARCH=true
VITE_ENABLE_EXPORT=false
```

## Troubleshooting

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution:**

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or kill all Node.js processes
pkill -f "node"

# Then restart your service
npm start
```

**For all three ports:**
```bash
# Kill processes on all service ports
lsof -ti:3001,3000,5173 | xargs kill -9
```

### CORS Errors

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**

1. Verify backend is running on port 3000
2. Check `CORS_ORIGIN` in backend `.env` matches frontend URL
3. Restart backend after changing `.env`

```bash
# backend/.env
CORS_ORIGIN=http://localhost:5173
```

### Cannot Find Module Errors

**Error:** `Error: Cannot find module '@types/express'`

**Solution:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or just rebuild the specific service
cd mcp-server  # (or backend)
rm -rf dist node_modules
npm install
npm run build
```

### Build Errors

**Error:** `tsc: command not found` or TypeScript errors

**Solution:**

```bash
# Install TypeScript globally
npm install -g typescript

# Or reinstall locally
cd mcp-server  # (or backend)
npm install
npm run build
```

### MCP Not Responding

**Error:** `connect ECONNREFUSED 127.0.0.1:3001`

**Solution:**

1. Verify MCP server is running:
```bash
ps aux | grep "node dist/index.js"
```

2. Check port:
```bash
curl http://localhost:3001/mcp/info
```

3. Restart MCP server:
```bash
pkill -f "mcp-server"
sleep 2
cd mcp-server && npm start
```

### Slow Performance

**Possible Causes:**

1. **Mock LLM taking time:**
   - Normal, mock generation takes ~1-2s per paper
   
2. **LLM API latency:**
   - Try with Gemini (faster)
   - Or use mock responses

3. **Large PDF files:**
   - Limit file size to <50MB
   - Increase `MAX_FILE_SIZE` in backend `.env` if needed

**Solution:**

```bash
# Monitor resource usage
# macOS
top -l1 | grep -E "^(Processes|MemRegions|PhysMem)"

# Linux
free -h
ps aux | grep node

# Use mock responses for faster testing
# In mcp-server/.env, comment out all API keys
```

### Database Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**

Use SQLite instead (no setup needed):

```bash
# backend/.env
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/papers.db
```

Or set up PostgreSQL:

```bash
# macOS
brew install postgresql
brew services start postgresql

# Linux
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
createdb research_papers

# Update .env
DATABASE_URL=postgresql://username:password@localhost:5432/research_papers
```

### Frontend Not Loading

**Error:** Browser shows blank page or connection refused

**Solution:**

1. Check frontend is running:
```bash
ps aux | grep "vite"
```

2. Check port 5173:
```bash
lsof -i :5173
curl http://localhost:5173
```

3. Check browser console for errors (F12)

4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

5. Restart frontend:
```bash
cd frontend
npm run dev
```

### LLM API Key Errors

**Error:** `401 Unauthorized` or `API key not valid`

**Solution:**

1. Verify API key format:
```bash
# Check key in .env (first 20 chars)
cat mcp-server/.env | grep API_KEY
```

2. Verify key has permissions in provider console
3. Check key hasn't expired
4. Try a different LLM provider
5. Check internet connectivity

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Project directory navigated to
- [ ] All dependencies installed (`npm install` in each service)
- [ ] Environment variables configured (`.env` files)
- [ ] MCP server running on port 3001
- [ ] Backend API running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173 in browser
- [ ] Can upload paper file
- [ ] Can see analysis results

## Common Commands Reference

```bash
# From project root
npm start                          # Start all services

# MCP Server
cd mcp-server
npm start                          # Run MCP server
npm run dev                        # Dev with auto-reload
npm run build                      # Rebuild TypeScript
npm test                           # Run tests

# Backend
cd backend
npm start                          # Run backend
npm run dev                        # Dev with auto-reload
npm run build                      # Rebuild TypeScript

# Frontend
cd frontend
npm run dev                        # Run dev server
npm run build                      # Build for production
npm run preview                    # Preview build locally

# Utilities
lsof -i :3000                      # Check port 3000
lsof -i :3001                      # Check port 3001
lsof -i :5173                      # Check port 5173
ps aux | grep node                 # List all Node processes
pkill -f "node"                    # Kill all Node processes
```

## Getting Help

If you encounter issues not covered here:

1. Check service logs for error messages
2. Review ARCHITECTURE.md for system design
3. Check README.md for overview
4. Verify .env configuration
5. Try restarting all services
6. Clear cache and reinstall dependencies

Happy coding! 🚀
