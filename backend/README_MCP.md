MCP Summarizer Integration
==========================

This backend module integrates with the MCP server to obtain summaries and category labels for uploaded papers.

Configuration
-------------

- MCP server URL: set `MCP_URL` (default: `http://localhost:3001`)
- If you want the MCP server to call a real LLM, configure the MCP server with `OPENAI_API_KEY` and (optionally) `OPENAI_MODEL`.

Endpoints
---------

- On paper upload (`POST /api/papers/upload`) the backend will call MCP's `/mcp/summarize` endpoint with `{ fullText, title? }` and will merge the returned `summary` and `categories` into the created paper record.

Local demo
----------

1. Start MCP server (mcp-server) — if you set `OPENAI_API_KEY`, the MCP will call OpenAI; otherwise it returns a heuristic mock.
2. Start backend server: `cd backend && npm run dev`
3. Upload a paper via `POST /api/papers/upload` (multipart/form-data `file` field). The response will include the created paper with summary/categories.

Notes
-----
- The backend client uses `MCP_URL` to locate the MCP server. For local demos, run both services on the same machine and leave defaults.
- Unit tests mocking the MCP client are included under `backend/tests/mcpClient.test.ts`.
