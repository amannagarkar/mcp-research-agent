#!/bin/bash

# Install dependencies for all services
echo "Installing dependencies..."

cd backend
npm install
cd ..

cd mcp-server
npm install
cd ..

cd frontend
npm install
cd ..

echo "Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL database"
echo "2. Create .env files in backend, mcp-server, and frontend"
echo "3. Run: npm run dev in each directory"
echo ""
echo "Or use Docker:"
echo "docker-compose up -d"
