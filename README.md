# Research Paper MCP Agent

A comprehensive Model Context Protocol (MCP) server integrated with a backend API and React frontend for research paper processing, summarization, and categorization.

## Project Overview

This project consists of three main components:

1. **MCP Server** - Model Context Protocol server that handles LLM-based paper analysis
2. **Backend API** - Express.js server that orchestrates paper processing and integrates with the MCP
3. **Frontend UI** - React application providing user interface for paper upload and analysis

### Key Features

- 📄 Research paper upload and processing
- 🤖 AI-powered summarization and categorization using multiple LLM providers
- 🔄 Seamless MCP integration for intelligent decision-making
- 🎨 Modern React UI for paper management and analysis
- 📊 Real-time processing with progress tracking
- 🔌 Multi-provider LLM support (OpenAI, Claude, Deepseek, Gemini)
- 💾 Mock responses for development without API keys

## Architecture

```
┌─────────────────┐
│   Frontend UI   │  (React 18, TypeScript, Vite)
│   Port: 5173    │
└────────┬────────┘
         │ HTTP API calls
         ↓
┌─────────────────────────┐
│   Backend API Server    │  (Express, TypeScript)
│   Port: 3000            │
└────────┬────────────────┘
         │ HTTP calls
         ↓
┌─────────────────────────────┐
│   MCP Server                │  (Node.js, Model Context Protocol)
│   Port: 3001                │  - Summarization
│   - PDF Processing          │  - Categorization
│   - LLM Integration         │  - JSON Response Parsing
└─────────────────────────────┘
         │
         ↓
   LLM Provider
   (OpenAI / Claude / Deepseek / Gemini)
   or Mock Responses
```

## Project Structure

```
mcp-research-agent/
├── README.md                          # This file
├── ARCHITECTURE.md                    # Detailed architecture documentation
├── SETUP_GUIDE.md                     # Step-by-step setup instructions
├── .env.example                       # Example environment configuration
│
├── mcp-server/                        # MCP Server
│   ├── src/
│   │   ├── index.ts                   # Express server & routes
│   │   ├── mcp/
│   │   │   ├── llmClient.ts           # Multi-provider LLM client
│   │   │   ├── mcpController.ts       # Summarization logic
│   │   │   └── paperAnalyzer.ts       # Paper analysis utilities
│   │   └── paperProcessor.ts          # PDF processing
│   ├── dist/                          # Compiled JavaScript
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                           # Environment variables (API keys)
│
├── backend/                           # Backend API
│   ├── src/
│   │   ├── index.ts                   # Express server setup
│   │   ├── routes/
│   │   │   ├── papers.ts              # Paper endpoints
│   │   │   └── analysis.ts            # Analysis endpoints
│   │   ├── services/
│   │   │   ├── mcpClient.ts           # MCP integration
│   │   │   └── paperService.ts        # Paper business logic
│   │   └── middleware/
│   │       ├── errorHandler.ts        # Error handling
│   │       └── logger.ts              # Request logging
│   ├── dist/                          # Compiled JavaScript
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                           # Environment variables
│
└── frontend/                          # React Frontend
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── components/
    │   │   ├── PaperUpload.tsx         # File upload component
    │   │   ├── PaperList.tsx           # Paper display
    │   │   ├── AnalysisResults.tsx     # Results view
    │   │   └── common/                 # Shared components
    │   ├── services/
    │   │   └── api.ts                  # API client
    │   ├── styles/                     # CSS modules
    │   └── types/                      # TypeScript interfaces
    ├── public/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── .env                            # Environment variables
```

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **Python** 3.8+ (for PDF processing utilities)
- One of the following (optional, for real LLM responses):
  - OpenAI API key
  - Anthropic (Claude) API key
  - Deepseek API key
  - Google Gemini API key

## Installation

### 1. Clone and Setup Project

```bash
cd /path/to/mcp-research-agent
npm install
```

### 2. Install Service Dependencies

```bash
# MCP Server
cd mcp-server
npm install
npm run build

# Backend
cd ../backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` in each service directory:

```bash
# MCP Server configuration
cp .env.example mcp-server/.env

# Backend configuration
cp .env.example backend/.env

# Frontend configuration
cp .env.example frontend/.env
```

Edit each `.env` file with your configuration:

**mcp-server/.env:**
```properties
MCP_PORT=3001

# Choose ONE LLM provider by uncommenting and setting its API key
# The MCP will automatically detect which provider is available

# ===== OpenAI =====
# OPENAI_API_KEY=your-key-here
# OPENAI_MODEL=gpt-3.5-turbo

# ===== Claude (Anthropic) =====
# ANTHROPIC_API_KEY=your-key-here
# CLAUDE_MODEL=claude-3-5-sonnet-20241022

# ===== Deepseek =====
# DEEPSEEK_API_KEY=your-key-here
# DEEPSEEK_MODEL=deepseek-chat

# ===== Gemini =====
# GEMINI_API_KEY=your-key-here
# GEMINI_MODEL=gemini-pro
```

**backend/.env:**
```properties
PORT=3000
MCP_URL=http://localhost:3001
DATABASE_URL=postgresql://user:password@localhost:5432/research_papers
NODE_ENV=development
```

**frontend/.env:**
```properties
VITE_API_URL=http://localhost:3000/api
```

## Running the Services

### Option 1: Run All Services in One Command

```bash
# From the project root
npm start
```

This will start all three services in parallel with proper logging.

### Option 2: Run Each Service in Separate Terminals

**Terminal 1 - MCP Server:**
```bash
cd mcp-server
npm start
# Output: MCP Server listening on port 3001
```

**Terminal 2 - Backend API:**
```bash
cd backend
npm start
# Output: Backend Server running on port 3000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Output: Local: http://localhost:5173
```

### Option 3: Run with Docker

```bash
# Build Docker images
docker-compose build

# Start all services
docker-compose up

# In separate terminal for logs
docker-compose logs -f
```

## API Endpoints

### MCP Server (Port 3001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp/info` | GET | Get MCP server info and available LLM provider |
| `/mcp/summarize` | POST | Summarize and categorize paper text |
| `/mcp/analyze` | POST | Perform detailed analysis on paper |

**POST /mcp/summarize**
```bash
curl -X POST http://localhost:3001/mcp/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "fullText": "Research paper content here...",
    "title": "Paper Title"
  }'
```

Response:
```json
{
  "title": "Paper Title",
  "summary": "Concise summary of the paper...",
  "categories": ["Machine Learning", "NLP"],
  "confidence": 0.95
}
```

### Backend API (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/papers` | GET | List all papers |
| `/api/papers` | POST | Upload new paper |
| `/api/papers/:id` | GET | Get paper details |
| `/api/papers/:id/analyze` | POST | Trigger analysis on paper |
| `/api/analysis/:id` | GET | Get analysis results |

### Frontend (Port 5173)

- **Upload Page**: Upload research papers in PDF format
- **Papers List**: View all uploaded papers
- **Analysis View**: See summarization and categorization results
- **Real-time Status**: Monitor processing progress

## Development Workflow

### Building

```bash
# MCP Server
cd mcp-server && npm run build

# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Testing

```bash
# MCP Server tests
cd mcp-server && npm test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm run test
```

### Watch Mode (for development)

```bash
# MCP Server - auto-rebuild on changes
cd mcp-server && npm run dev

# Backend - auto-rebuild and restart
cd backend && npm run dev

# Frontend - hot module replacement
cd frontend && npm run dev
```

## LLM Provider Configuration

### Using Mock Responses (No API Key Required)

By default, if no LLM API keys are configured, the system will use mock responses. This is perfect for development and testing.

### Using Real LLM Providers

The system automatically detects and uses the first configured provider in this priority:

1. **Claude (Anthropic)** - Free credits available: https://console.anthropic.com
2. **Deepseek** - Very cheap (~$0.14 per 1M tokens): https://platform.deepseek.com
3. **Gemini (Google)** - Free tier available: https://aistudio.google.com
4. **OpenAI** - Paid only: https://platform.openai.com

To enable a provider:

1. Get an API key from the provider
2. Add it to your `mcp-server/.env` file
3. Restart the MCP server

Example (using Gemini):
```properties
GEMINI_API_KEY=AIzaSyB-xxxxxxxxxxxxx
GEMINI_MODEL=gemini-pro
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### CORS Errors

Ensure backend is running and VITE_API_URL in frontend matches backend port (3000).

### LLM API Errors

- Check `.env` file has valid API key format
- Verify API key has sufficient credits/permissions
- Check network connectivity to the LLM provider
- Review logs for specific error messages

### Build Errors

```bash
# Clean build
rm -rf dist
npm run build

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Environment Variables Reference

### MCP Server
- `MCP_PORT` - Server port (default: 3001)
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - OpenAI model name
- `ANTHROPIC_API_KEY` - Claude API key
- `CLAUDE_MODEL` - Claude model name
- `DEEPSEEK_API_KEY` - Deepseek API key
- `DEEPSEEK_MODEL` - Deepseek model name
- `GEMINI_API_KEY` - Google Gemini API key
- `GEMINI_MODEL` - Gemini model name

### Backend
- `PORT` - Server port (default: 3000)
- `MCP_URL` - MCP server URL
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)

### Frontend
- `VITE_API_URL` - Backend API base URL

## Performance Optimization

- **Mock responses**: Use for rapid development (instant responses)
- **Gemini free tier**: Good for testing with real LLM
- **Caching**: Backend caches summarization results
- **Lazy loading**: Frontend lazy-loads paper list

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests and builds
4. Submit pull request

## License

MIT

## Support

For issues and questions, please refer to the detailed documentation:
- See `ARCHITECTURE.md` for technical deep-dive
- See `SETUP_GUIDE.md` for detailed setup instructions
- Check `mcp-server/` for LLM integration details
