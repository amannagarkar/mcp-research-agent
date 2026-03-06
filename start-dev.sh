#!/bin/bash

# Development startup script
# Run all services in one command

echo "Starting MCP Research Paper Agent..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create uploads directory if it doesn't exist
mkdir -p ./backend/uploads

# Start PostgreSQL in Docker if not running
if ! docker ps | grep -q research-papers-db; then
    echo -e "${BLUE}Starting PostgreSQL database...${NC}"
    docker run --name research-papers-db \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=research_papers \
        -p 5432:5432 \
        -d postgres:15-alpine
    
    sleep 5
    echo -e "${GREEN}Database started${NC}"
fi

echo ""
echo -e "${BLUE}Starting services...${NC}"
echo "Open new terminals and run:"
echo ""
echo -e "${GREEN}Terminal 1 - Backend:${NC}"
echo "cd backend && npm install && npm run dev"
echo ""
echo -e "${GREEN}Terminal 2 - MCP Server:${NC}"
echo "cd mcp-server && npm install && npm run dev"
echo ""
echo -e "${GREEN}Terminal 3 - Frontend:${NC}"
echo "cd frontend && npm install && npm run dev"
echo ""
echo "Then access the application at: http://localhost:5173"
echo ""
