#!/bin/bash

echo "🚀 Starting Social Sentiment Monitor Frontend..."
echo ""

# Navigate to frontend directory
cd social-pulse-monitor

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the dev server
echo ""
echo "✅ Starting Vite dev server..."
echo "📍 Frontend will be available at: http://localhost:5173"
echo ""

npm run dev
