#!/bin/bash
# Bash script to start the backend server

echo "🚀 Starting KeyVasthu Backend Server..."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Creating .env file with default values..."
    cat > .env << EOF
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Database Configuration (add your DATABASE_URL here)
# DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ Created .env file. Please add your DATABASE_URL!"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if port 3001 is already in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 3001 is already in use!"
    echo "   The server might already be running."
    echo "   If not, stop the process using port 3001 and try again."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🔧 Starting server on http://localhost:3001"
echo "💡 Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run server
