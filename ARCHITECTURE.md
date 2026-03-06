# Architecture Documentation

## System Overview

The Research Paper MCP Agent is a three-tier application designed to process research papers, extract summaries, and categorize them using AI/LLM services.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT TIER                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         React Frontend (Vite)                           │    │
│  │  - Paper Upload Interface                               │    │
│  │  - Paper Management (List, View, Delete)                │    │
│  │  - Real-time Analysis Results Display                   │    │
│  │  - User Authentication (future)                         │    │
│  └────────────────────┬────────────────────────────────────┘    │
│                       │                                         │
│                       │ HTTP (JSON over REST)                   │
│                       │ Port: 5173 → 3000                       │
│                       ↓                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│              APPLICATION TIER                                   │
│                        │                                        │
│  ┌────────────────────▼──────────────────────────────────┐      │
│  │        Express.js Backend Server (Port: 3000)         │      │
│  │                                                       │      │
│  │  ┌──────────────────────────────────────────────┐     │      │
│  │  │         HTTP Routes & Controllers             │    │      │
│  │  │  - POST /api/papers (upload)                 │     │      │
│  │  │  - GET /api/papers (list)                    │     │      │
│  │  │  - GET /api/papers/:id (retrieve)            │     │      │
│  │  │  - POST /api/papers/:id/analyze (trigger)   │      │      │
│  │  │  - GET /api/analysis/:id (results)           │     │      │
│  │  └──────────┬───────────────────────────────────┘     │      │
│  │             │                                         │      │
│  │  ┌──────────▼───────────────────────────────────┐     │      │
│  │  │      Service Layer                           │     │      │
│  │  │                                              │     │      │
│  │  │  ┌──────────────────────────────────────┐    │     │      │
│  │  │  │ mcpClient.ts                         │    │      │     │
│  │  │  │ - HTTP calls to MCP server           │    │      │     │
│  │  │  │ - Request/response marshalling       │    │      │     │
│  │  │  │ - Error handling                     │    │      │     │
│  │  │  └──────────────────────────────────────┘    │      │     │
│  │  │                                              │     │     │
│  │  │  ┌──────────────────────────────────────┐   │    │     │
│  │  │  │ paperService.ts                      │   │    │     │
│  │  │  │ - Paper processing logic             │   │    │     │
│  │  │  │ - Caching & persistence              │   │    │     │
│  │  │  │ - Business rule application          │   │    │     │
│  │  │  └──────────────────────────────────────┘   │    │     │
│  │  │                                              │     │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  │             │                                        │    │
│  │             │ HTTP (JSON over REST)                 │    │
│  │             │ Port: 3000 → 3001                     │    │
│  │             ↓                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────┬───────────────────────────────────────┘
                        │
┌───────────────────────┼───────────────────────────────────────┐
│              MCP TIER (Port: 3001)                            │
│                        │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │      Express.js MCP Server (Node.js)                 │   │
│  │                                                       │   │
│  │  Routes:                                             │   │
│  │  - GET /mcp/info (server status)                    │   │
│  │  - POST /mcp/summarize (text → summary)             │   │
│  │  - POST /mcp/analyze (advanced analysis)            │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │       MCP Controller Layer                 │    │   │
│  │  │                                            │    │   │
│  │  │  summarizeAndCategorize()                 │    │   │
│  │  │  - Orchestrates LLM calls                 │    │   │
│  │  │  - Parses JSON responses                 │    │   │
│  │  │  - Extracts key information              │    │   │
│  │  └────────┬────────────────────────────────┘    │   │
│  │           │                                      │   │
│  │  ┌────────▼────────────────────────────────┐    │   │
│  │  │    LLM Client (llmClient.ts)            │    │   │
│  │  │                                         │    │   │
│  │  │  detectAvailableProvider()             │    │   │
│  │  │  - Checks env vars for configured keys │    │   │
│  │  │  - Returns active provider priority    │    │   │
│  │  │                                         │    │   │
│  │  │  callLLM(prompt, maxTokens)            │    │   │
│  │  │  - Routes to appropriate provider      │    │   │
│  │  │  - Handles errors & fallback           │    │   │
│  │  │                                         │    │   │
│  │  │  Provider Functions:                   │    │   │
│  │  │  - callOpenAI()  → OpenAI API          │    │   │
│  │  │  - callClaude()  → Anthropic API       │    │   │
│  │  │  - callDeepseek() → Deepseek API       │    │   │
│  │  │  - callGemini()  → Google API          │    │   │
│  │  │  - getMockResponse() (fallback)        │    │   │
│  │  └────────┬────────────────────────────┘    │   │
│  │           │                                  │   │
│  │           ↓                                  │   │
│  │        Network Call                         │   │
│  │     (HTTP over TLS)                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│          EXTERNAL LLM TIER                         │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │      Priority-Based Provider Selection       │ │
│  │                                              │ │
│  │  1. Claude (Anthropic)                       │ │
│  │     Endpoint: api.anthropic.com              │ │
│  │     Free tier: Limited credits               │ │
│  │     Auth: X-Api-Key header                   │ │
│  │                                              │ │
│  │  2. Deepseek                                 │ │
│  │     Endpoint: api.deepseek.com               │ │
│  │     Free tier: Trial credits                 │ │
│  │     Auth: Bearer token                       │ │
│  │                                              │ │
│  │  3. Gemini (Google)                          │ │
│  │     Endpoint: generativelanguage.googleapis │ │
│  │     Free tier: Generous rate limits          │ │
│  │     Auth: API key in query params             │ │
│  │                                              │ │
│  │  4. OpenAI (GPT)                             │ │
│  │     Endpoint: api.openai.com                 │ │
│  │     Free tier: None (paid only)              │ │
│  │     Auth: Bearer token                       │ │
│  │                                              │ │
│  │  Fallback: Mock Responses                    │ │
│  │     - Generates realistic summaries          │ │
│  │     - Uses keyword-based categorization      │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Component (React/Vite)

**File Structure:**
```
frontend/src/
├── main.tsx                 # Entry point
├── App.tsx                  # Root component
├── components/
│   ├── PaperUpload.tsx       # Upload interface
│   ├── PaperList.tsx         # Paper listing
│   ├── AnalysisResults.tsx   # Results display
│   └── common/               # Shared components
├── services/
│   └── api.ts                # Axios/fetch client
├── types/
│   └── index.ts              # TypeScript interfaces
└── styles/                   # CSS modules
```

**Key Interfaces:**
```typescript
interface Paper {
  id: string;
  title: string;
  filename: string;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  size: number;
}

interface AnalysisResult {
  paperId: string;
  summary: string;
  categories: string[];
  confidence: number;
  processedAt: Date;
  llmProvider: string;
}
```

### 2. Backend Component (Express/TypeScript)

**File Structure:**
```
backend/src/
├── index.ts                      # Server setup
├── routes/
│   ├── papers.ts                 # Paper CRUD endpoints
│   └── analysis.ts               # Analysis endpoints
├── services/
│   ├── mcpClient.ts              # MCP integration
│   └── paperService.ts           # Business logic
├── middleware/
│   ├── errorHandler.ts           # Error handling
│   └── logger.ts                 # Request logging
└── types/
    └── index.ts                  # Shared types
```

**Request Flow:**
```
POST /api/papers
  ↓
paperRoute.ts (handles multipart)
  ↓
paperService.ts (stores file metadata)
  ↓
Returns { paperId, status: 'pending' }
  ↓
Frontend polls GET /api/analysis/:id
  ↓
(Auto-triggered by separate process)
```

**MCP Integration:**
```
POST /api/papers/:id/analyze
  ↓
paperService.analyzeWithMCP(paperId)
  ↓
mcpClient.ts (HTTP POST to /mcp/summarize)
  ↓
Backend waits for MCP response (timeout: 30s)
  ↓
Cache result in local storage/database
  ↓
Return { summary, categories, confidence }
```

### 3. MCP Server Component (Node.js)

**File Structure:**
```
mcp-server/src/
├── index.ts                       # Express server & routes
├── mcp/
│   ├── llmClient.ts               # Multi-provider LLM logic
│   ├── mcpController.ts           # Summarization orchestration
│   └── paperAnalyzer.ts           # Analysis utilities
└── paperProcessor.ts              # PDF text extraction
```

**Key Functions:**

```typescript
// llmClient.ts
detectAvailableProvider(): LLMConfig
  - Checks env vars in priority order
  - Returns { provider, apiKey, model }
  - Priority: Claude > Deepseek > Gemini > OpenAI

callLLM(prompt: string, maxTokens: number)
  - Routes to appropriate provider function
  - Handles errors and falls back to mock
  - Logs provider and response info

// mcpController.ts
summarizeAndCategorize(fullText: string, title?: string)
  - Constructs structured prompt
  - Calls callLLM()
  - Parses JSON response
  - Extracts: summary, categories, confidence

// index.ts
GET /mcp/info
  - Returns { name, version, llm_provider, llm_model }
  - Shows current active provider

POST /mcp/summarize
  - Validates fullText field
  - Calls summarizeAndCategorize()
  - Returns JSON with analysis
```

**LLM Provider Implementation:**

```typescript
// Each provider has similar structure:

async callOpenAI(prompt, apiKey, model, maxTokens)
  POST https://api.openai.com/v1/chat/completions
  Headers: Authorization: Bearer {apiKey}
  Body: { model, messages, max_tokens, temperature }

async callClaude(prompt, apiKey, model, maxTokens)
  POST https://api.anthropic.com/v1/messages
  Headers: X-Api-Key: {apiKey}, anthropic-version: 2023-06-01
  Body: { model, max_tokens, messages, system }

async callDeepseek(prompt, apiKey, model, maxTokens)
  POST https://api.deepseek.com/chat/completions
  Headers: Authorization: Bearer {apiKey}
  Body: { model, messages, max_tokens, temperature }

async callGemini(prompt, apiKey, model, maxTokens)
  POST https://generativelanguage.googleapis.com/v1/models/{model}:generateContent
  Params: key={apiKey}
  Body: { contents, generationConfig }
```

## Data Flow Diagrams

### Paper Upload & Analysis Flow

```
1. User Action
   ↓
   PaperUpload.tsx (File selected)
   ↓
2. File Validation
   - Check file type (PDF)
   - Check file size
   ↓
3. Frontend Upload
   POST /api/papers (multipart/form-data)
   ↓
4. Backend Processing
   - Save file to disk/storage
   - Extract metadata
   - Generate paperId
   - Return { paperId, status: 'pending' }
   ↓
5. Frontend Receives Response
   - Store paperId in state
   - Show "Processing..." indicator
   - Start polling /api/analysis/:paperId
   ↓
6. Backend Async Analysis (separate worker)
   - Trigger on file save
   - Extract text from PDF
   - Send to MCP server
   ↓
7. MCP Processes
   POST /mcp/summarize { fullText, title }
   ↓
8. LLM Provider Selection
   - Check env vars for API keys
   - Route to first available provider
   - Send request to provider API
   ↓
9. LLM Response
   - Parse JSON response
   - Extract summary & categories
   ↓
10. MCP Returns to Backend
    { summary, categories, confidence }
    ↓
11. Backend Caches Result
    - Store in database/file
    - Update status to 'completed'
    ↓
12. Frontend Receives Polling Response
    GET /api/analysis/:paperId → { results, status }
    ↓
13. Display Results
    AnalysisResults.tsx (render summary & tags)
```

### LLM Provider Fallback Logic

```
Start Analysis
    ↓
callLLM(prompt)
    ↓
detectAvailableProvider()
    ├─ Check ANTHROPIC_API_KEY
    │  ├─ Yes → callClaude()
    │  │   ├─ Success → return response
    │  │   └─ Error → log & continue
    │  └─ No → check next
    │
    ├─ Check DEEPSEEK_API_KEY
    │  ├─ Yes → callDeepseek()
    │  │   ├─ Success → return response
    │  │   └─ Error → log & continue
    │  └─ No → check next
    │
    ├─ Check GEMINI_API_KEY
    │  ├─ Yes → callGemini()
    │  │   ├─ Success → return response
    │  │   └─ Error → log & continue
    │  └─ No → check next
    │
    ├─ Check OPENAI_API_KEY
    │  ├─ Yes → callOpenAI()
    │  │   ├─ Success → return response
    │  │   └─ Error → log & continue
    │  └─ No → use mock
    │
    └─ Use getMockResponse()
       (generates realistic response without API)
```

## Error Handling & Logging

### Error Hierarchy

```
├─ Network Errors
│  ├─ Connection timeout
│  ├─ DNS resolution failed
│  └─ Certificate errors
│
├─ API Errors
│  ├─ 401 Unauthorized (invalid key)
│  ├─ 402 Payment Required (no credits)
│  ├─ 404 Not Found (model doesn't exist)
│  ├─ 429 Rate Limited
│  └─ 500+ Server Errors
│
├─ Data Errors
│  ├─ Invalid JSON in response
│  ├─ Missing required fields
│  └─ Parse errors
│
└─ File Errors
   ├─ PDF parsing failed
   ├─ Corrupted file
   └─ Unsupported format
```

### Logging Strategy

```
[TIMESTAMP] [LEVEL] [SOURCE] Message

Examples:
[10:30:45] [INFO] [Frontend] Uploading paper: nature-2024.pdf
[10:30:46] [DEBUG] [Backend] Received file, id: paper_12345
[10:30:47] [INFO] [MCP] Detected provider: gemini
[10:30:47] [DEBUG] [Gemini] Making API call with model: gemini-pro
[10:30:49] [INFO] [Gemini] Response received
[10:30:49] [INFO] [Backend] Analysis complete, caching results
[10:30:50] [INFO] [Frontend] Analysis complete, displaying results
```

## Performance Characteristics

### Response Times

- **PDF Upload**: 100-500ms (file transfer)
- **PDF Text Extraction**: 500-2000ms (depends on size)
- **LLM API Call**: 1-10s (provider dependent)
- **Total E2E**: 2-15s (without network delays)

### Resource Usage

- **Frontend**: ~50MB RAM, minimal CPU
- **Backend**: ~150MB RAM, low CPU during idle
- **MCP Server**: ~200MB RAM, CPU spikes during LLM calls
- **Storage**: ~1MB per paper (text + metadata)

## Security Considerations

### API Key Management

- Store API keys in `.env` (never in git)
- Use environment variables only
- Rotate keys periodically
- Monitor API usage for anomalies

### Data Protection

- PDF files stored securely
- Analysis results cached (consider encryption)
- HTTPS/TLS for all network calls
- Input validation on all endpoints

### Access Control (Future)

- User authentication (JWT tokens)
- Role-based access (admin, user)
- Rate limiting per user
- File access permissions

## Scalability

### Horizontal Scaling

- Load balance frontend across CDN
- Load balance backend (stateless)
- Load balance MCP server (concurrent processing)
- Use queue system for analysis jobs

### Optimization Strategies

- Cache LLM responses (same paper → same result)
- Batch multiple papers
- Use cheaper LLM models for simple summarization
- Implement async processing with job queue (Bull, RabbitMQ)

## Testing Strategy

### Unit Tests

- LLM provider selection logic
- JSON parsing and extraction
- Error handling and fallbacks

### Integration Tests

- Backend ↔ MCP communication
- Frontend ↔ Backend API calls
- End-to-end paper upload → analysis

### Load Tests

- MCP server concurrent requests
- Backend file uploads
- Frontend React performance

## Deployment

### Development

```bash
npm start  # All 3 services in parallel
```

### Production

```bash
# Using PM2 process manager
pm2 start mcp-server/dist/index.js
pm2 start backend/dist/index.js
pm2 start frontend/build/index.js

# Or using Docker
docker-compose -f docker-compose.prod.yml up
```

### Monitoring

- Application logs in `/var/log/mcp-research-agent/`
- API request metrics in monitoring system
- Error tracking with Sentry/LogRocket
- Performance metrics with Datadog/New Relic
