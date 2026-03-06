# MCP Research Agent - Complete Integration Guide

## System Architecture

The system consists of 3 main components:

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   FRONTEND      │        │   BACKEND        │        │   MCP SERVER    │
│  (React+Vite)   │◄────►  │  (Express)       │◄────►  │  (Express)      │
│  Port: 5173     │        │  Port: 3000      │        │  Port: 3001     │
└─────────────────┘        └──────────────────┘        └─────────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │   PostgreSQL DB  │
                           │   (Connections)  │
                           └──────────────────┘
```

## Component Details

### 1. MCP Server (Port 3001)
- **Location**: `mcp-server/`
- **Language**: TypeScript + Express
- **Key Files**:
  - `src/mcp/llmClient.ts` - LLM integration (OpenAI or mock)
  - `src/mcp/mcpController.ts` - Summarization & categorization logic
  - `src/index.ts` - Express server with MCP endpoints

- **Endpoints**:
  - `GET /mcp/info` - Server health and capabilities
  - `POST /mcp/summarize` - Summarize and categorize paper text
  - `POST /api/parse-paper` - Parse PDF papers
  - `POST /api/find-similar` - Find similar papers

### 2. Backend (Port 3000)
- **Location**: `backend/`
- **Language**: TypeScript + Express + PostgreSQL
- **Key Files**:
  - `src/services/mcpClient.ts` - Backend MCP client
  - `src/routes/papers.ts` - Paper upload & management routes
  - `src/index.ts` - Express server with API routes

- **Endpoints**:
  - `GET /health` - Backend health check
  - `POST /api/papers/upload` - Upload paper with MCP summarization
  - `GET /api/papers` - Get all papers
  - `GET /api/papers/:id` - Get specific paper
  - `POST /api/papers/search` - Search papers
  - `GET /api/papers/:id/similar` - Get similar papers

- **MCP Integration**:
  - When a paper is uploaded, the backend calls `POST /api/parse-paper` on MCP
  - Then calls `POST /mcp/summarize` to get AI-generated summary and categories
  - Merges MCP results with parsed paper data before storing in DB

### 3. Frontend (Port 5173)
- **Location**: `frontend/`
- **Language**: React + TypeScript + Vite
- **Key Files**:
  - `src/api/paperAPI.ts` - Backend API client
  - `src/components/` - UI components (MainLayout, ChatUploadSection, etc.)
  - `src/App.tsx` - Main app component

- **Configuration**:
  - Backend URL: `http://localhost:3000/api` (or env var `VITE_API_URL`)
  - All paper operations go through the backend API

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL (running and configured)
- OpenAI API key (optional - falls back to mock if not set)

### Environment Variables

**MCP Server** (`mcp-server/.env`):
```bash
OPENAI_API_KEY=sk-...          # Optional - set for real LLM calls
OPENAI_MODEL=gpt-3.5-turbo    # Optional - model selection
MCP_PORT=3001                  # Default
```

**Backend** (`backend/.env`):
```bash
PORT=3000                      # Default
MCP_URL=http://localhost:3001  # MCP server URL
DATABASE_URL=postgres://...    # PostgreSQL connection
```

**Frontend** (`.env` in frontend root):
```bash
VITE_API_URL=http://localhost:3000/api  # Backend API URL
```

### Installation & Running

#### 1. Start MCP Server
```bash
cd mcp-server
npm install
npm run dev
# MCP Server listening on port 3001
```

#### 2. Start Backend
```bash
cd backend
npm install
npm run dev
# Backend API running on port 3000
```

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend running on port 5173
```

#### 4. Open in Browser
```
http://localhost:5173
```

## Testing

### Unit Tests (MCP Client)
```bash
cd backend
npm test                    # Runs Jest tests for mcpClient
```

Expected output:
```
PASS tests/mcpClient.test.ts
  mcpClient
    ✓ parses MCP response correctly
    ✓ handles MCP returning non-array categories
Test Suites: 1 passed, 1 total
Tests: 2 passed, 2 total
```

### Integration Tests
```bash
cd backend
npx jest --testPathPattern="integration.test.ts" --forceExit
```

Tests verify:
- ✓ MCP server is running
- ✓ Backend server is running
- ✓ MCP summarize endpoint works
- ✓ Backend can call MCP
- ✓ Backend /api/papers endpoint works
- ✓ Frontend API client is configured

### Manual Testing

#### 1. MCP Health Check
```bash
curl http://localhost:3001/mcp/info
# Response: {"name":"MCP Summarizer","version":"0.1.0","capabilities":["summarize",...]}
```

#### 2. Backend Health Check
```bash
curl http://localhost:3000/health
# Response: {"status":"Backend API is running"}
```

#### 3. Test MCP Summarization
```bash
curl -X POST http://localhost:3001/mcp/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "fullText": "Machine learning is a subset of artificial intelligence...",
    "title": "Introduction to ML"
  }'
# Response includes: summary, categories, confidence
```

#### 4. Upload Paper (Frontend)
1. Open `http://localhost:5173`
2. Click "Upload Paper"
3. Select a PDF file
4. Paper is parsed by MCP and summarized
5. Summary and categories stored in database

## Demo Workflow

### Step 1: Verify All Services Running
```bash
# Terminal 1 - MCP Server
curl http://localhost:3001/mcp/info

# Terminal 2 - Backend
curl http://localhost:3000/health

# Terminal 3 - Frontend
curl http://localhost:5173/ | head -20
```

### Step 2: Test MCP Summarization
```bash
curl -X POST http://localhost:3001/mcp/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "fullText": "Natural Language Processing (NLP) is a field of artificial intelligence that focuses on the interaction between computers and human language. Machine learning models have revolutionized NLP by enabling computers to understand and generate human language at scale.",
    "title": "NLP Overview"
  }'
```

### Step 3: Upload Paper Through Backend
```bash
# Create a test PDF or use existing one
curl -X POST http://localhost:3000/api/papers/upload \
  -F "file=@/path/to/paper.pdf" \
  -F 'title=Test Paper' \
  -F 'authors=["Author 1"]' \
  -F 'tags=["ML", "AI"]'
```

### Step 4: View Results in Frontend
1. Open `http://localhost:5173`
2. Uploaded paper appears in "Papers Library"
3. Summary and categories are displayed
4. Can search and filter by categories

## API Contract: MCP ↔ Backend Integration

### MCP Summarize Endpoint
**Request**:
```typescript
POST /mcp/summarize
Content-Type: application/json

{
  fullText: string,     // Required: Full paper text to summarize
  title?: string        // Optional: Paper title for context
}
```

**Response**:
```typescript
{
  summary: string,                // Generated summary
  categories: string[],           // Categorized topics
  confidence?: number             // Confidence score (0-1)
}
```

### Backend Paper Upload
**Request**:
```
POST /api/papers/upload
Content-Type: multipart/form-data

file: File (PDF)
title?: string
authors?: JSON string (array)
tags?: JSON string (array)
```

**Response**:
```typescript
{
  paper: {
    id: string,
    title: string,
    summary: string,      // From MCP or parsed
    categories: string[], // From MCP or tags
    ...
  },
  similarPapers: Paper[]
}
```

## Troubleshooting

### MCP Server Won't Start
```bash
# Check port 3001 is free
lsof -i :3001

# Kill process if needed
pkill -f "mcp-server"

# Check environment variables
env | grep OPENAI
```

### Backend Can't Connect to MCP
```bash
# Verify MCP_URL in backend/.env
cat backend/.env | grep MCP_URL

# Manually test connection
curl http://localhost:3001/mcp/info

# Check backend logs
tail -f /tmp/backend.log
```

### Frontend Can't Connect to Backend
```bash
# Check VITE_API_URL
cat frontend/.env | grep VITE_API_URL

# Test backend endpoint
curl http://localhost:3000/health

# Check CORS settings in backend
# Should have cors() middleware enabled
```

### Tests Failing
```bash
# Ensure all servers are running
ps aux | grep "npm run dev"

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npx jest --testPathPattern="mcpClient" --forceExit
```

## Performance & Optimization

- MCP summarization timeout: 30 seconds
- Backend paper parse timeout: 60 seconds
- Frontend dev server rebuilds on file save
- Production build optimized with gzip compression

## Next Steps

1. **Enable Real LLM**: Set `OPENAI_API_KEY` in MCP environment
2. **Configure Database**: Update `DATABASE_URL` in backend
3. **Customize Categories**: Modify MCP prompt in `mcpController.ts`
4. **Add Authentication**: Implement user login/auth
5. **Deploy**: Use Docker or cloud platform (AWS, Vercel, etc.)

## File Structure
```
mcp-research-agent/
├── mcp-server/              # MCP server with LLM integration
│   ├── src/
│   │   ├── mcp/
│   │   │   ├── llmClient.ts
│   │   │   └── mcpController.ts
│   │   └── index.ts
│   └── package.json
├── backend/                 # Express backend with DB
│   ├── src/
│   │   ├── routes/
│   │   │   └── papers.ts
│   │   ├── services/
│   │   │   ├── mcpClient.ts
│   │   │   └── paperService.ts
│   │   └── index.ts
│   ├── tests/
│   │   ├── mcpClient.test.ts
│   │   └── integration.test.ts
│   └── package.json
└── frontend/                # React frontend
    ├── src/
    │   ├── api/
    │   │   └── paperAPI.ts
    │   ├── components/
    │   └── App.tsx
    └── package.json
```

## Support & Issues

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs: `/tmp/backend.log`, `/tmp/frontend.log`, `/tmp/mcp.log`
3. Verify all services are running on correct ports
4. Check environment variables are set correctly
5. Run unit and integration tests

---
**Last Updated**: March 5, 2026
**Status**: ✅ Demo Ready - All API endpoints tested and working
