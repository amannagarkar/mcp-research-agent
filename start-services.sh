#!/bin/bash

cd "$(dirname "$0")"

echo "🚀 Starting MCP Research Paper Management System..."
echo ""

# Start Backend
echo "📦 Starting Backend API on port 3000..."
cd backend && npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start MCP Server
echo "🔗 Starting MCP Server on port 3001..."
cd ../mcp-server && npm run dev > ../logs/mcp-server.log 2>&1 &
MCP_PID=$!
echo "   MCP Server PID: $MCP_PID"

# Wait for MCP server to start
sleep 3

# Start Frontend
echo "⚛️  Starting React Frontend on port 5173..."
cd ../frontend && npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ All services started!"
echo ""
echo "📚 Access the application:"
echo "   Frontend:     http://localhost:5173"
echo "   Backend API:  http://localhost:3000"
echo "   MCP Server:   http://localhost:3001"
echo ""
echo "📋 Logs:"
echo "   Backend:   ./logs/backend.log"
echo "   MCP:       ./logs/mcp-server.log"
echo "   Frontend:  ./logs/frontend.log"
echo ""
echo "🛑 To stop all services, run: killall node"

# Keep script running
wait
