#!/bin/bash

echo "🚀 Starting Social Sentiment Monitor Backend..."
echo ""

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if [ ! -f "venv/bin/uvicorn" ]; then
    echo "📥 Installing dependencies (this may take a few minutes)..."
    pip install -r requirements.txt
fi

# Start the server
echo ""
echo "✅ Starting FastAPI server..."
echo "📍 API will be available at: http://localhost:8000"
echo "📚 API docs at: http://localhost:8000/docs"
echo ""

python main.py
