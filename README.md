# AI-Driven Real-Time Social Sentiment Monitor

A real-time sentiment analysis system that monitors social media posts, detects trends, and provides actionable insights using AI-powered sentiment analysis.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)

## 🎯 Features

### Mandatory Features (All Implemented ✅)

1. **Social Post Ingestion** - Accept and store social media posts with metadata
2. **AI-Based Sentiment Analysis** - Classify posts as Positive, Neutral, or Negative using Hugging Face Transformers
3. **Keyword/Brand Tracking** - Monitor specific keywords and brands
4. **Sentiment Dashboard** - Real-time visualization of sentiment distribution and statistics
5. **Time-Based Trends** - Hourly sentiment trends with spike detection

### Technical Highlights

- ⚡ **Real-time Updates**: Server-Sent Events (SSE) for live dashboard updates
- 🤖 **AI-Powered**: Hugging Face DistilBERT model for accurate sentiment analysis
- 🔄 **Async Processing**: Non-blocking background processing of posts
- 📊 **Beautiful Dashboard**: Modern UI with shadcn/ui and Recharts
- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile

## 🏗️ Architecture

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend   │ ◄─SSE──►│     Backend      │ ◄──────►│   SQLite    │
│  (React/TS)  │         │  (FastAPI/Python)│         │   Database  │
└──────────────┘         └──────────────────┘         └─────────────┘
                                  │
                                  │ API Call
                                  ▼
                         ┌──────────────────┐
                         │  Hugging Face    │
                         │  DistilBERT      │
                         │  Sentiment Model │
                         └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+ (for backend)
- Node.js 18+ (for frontend)
- 2GB RAM minimum (for AI model)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will:
- Initialize the SQLite database
- Download the Hugging Face sentiment model (~500MB, first run only)
- Start the API server on `http://localhost:8000`

**API Documentation**: http://localhost:8000/docs

### Frontend Setup

```bash
# Navigate to frontend directory
cd social-pulse-monitor

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Usage Guide

### Step 1: Add Keywords to Track

1. Open the dashboard at `http://localhost:5173`
2. In the "Keyword Manager" section, enter keywords to track (e.g., "Tesla", "iPhone", "Apple")
3. Click "Add" to start tracking

### Step 2: Ingest Posts

**Option A: Use the Simulation API (Recommended for Demo)**

```bash
curl -X POST "http://localhost:8000/api/posts/simulate" \
  -H "Content-Type: application/json" \
  -d '{"count": 20, "interval": 2}'
```

This will simulate 20 posts being ingested over 40 seconds (1 post every 2 seconds).

**Option B: Manually Ingest Posts**

```bash
curl -X POST "http://localhost:8000/api/posts/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Just bought the new iPhone! Camera quality is amazing!",
    "timestamp": "2025-01-17T10:30:00",
    "source": "Twitter"
  }'
```

**Option C: Bulk Import from JSON**

```python
import requests
import json

with open('../data/mock_posts.json', 'r') as f:
    posts = json.load(f)

for post in posts:
    requests.post('http://localhost:8000/api/posts/ingest', json=post)
```

### Step 3: Watch Real-Time Updates

- The dashboard will automatically update as posts are processed
- Watch the sentiment distribution change in real-time
- See new posts appear in the feed with sentiment badges
- Track hourly trends on the chart

## 🎮 API Endpoints

### Keyword Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/keywords` | Add a new keyword |
| GET | `/api/keywords` | List all keywords |
| DELETE | `/api/keywords/{id}` | Remove a keyword |

### Post Ingestion

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/ingest` | Add a single post |
| POST | `/api/posts/bulk-ingest` | Add multiple posts |
| POST | `/api/posts/simulate` | Start simulation |

### Dashboard Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get statistics |
| GET | `/api/dashboard/recent` | Get recent posts |
| GET | `/api/dashboard/trends` | Get hourly trends |

### Real-Time

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | SSE endpoint for live updates |

## 🧠 AI Sentiment Analysis

### Model Details

- **Model**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Provider**: Hugging Face Transformers
- **Type**: Pre-trained sentiment classification
- **Accuracy**: ~92% on SST-2 benchmark
- **Speed**: ~5 seconds per post (CPU), <1 second (GPU)

### Sentiment Classification

- **Positive**: Confidence > 0.75 with POSITIVE label
- **Negative**: Confidence > 0.75 with NEGATIVE label
- **Neutral**: Confidence < 0.75 (low confidence)

### Why Hugging Face?

✅ **Free** - No API costs
✅ **Private** - Runs locally, no data sent to third parties
✅ **Accurate** - State-of-the-art transformer model
✅ **Fast Enough** - Acceptable for real-time demo

## 📊 Database Schema

### Keywords Table
```sql
CREATE TABLE keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(50) NOT NULL,
    keyword_matched VARCHAR(100),
    sentiment_label VARCHAR(20),
    sentiment_score FLOAT,
    processing_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Language**: Python 3.10+
- **Database**: SQLite 3.x
- **AI/ML**: Hugging Face Transformers + PyTorch
- **Async**: asyncio, aiosqlite

### Frontend
- **Framework**: React 18.3 + TypeScript
- **Build Tool**: Vite 5.x
- **UI Library**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts 2.x
- **Real-time**: EventSource API (SSE)
- **State**: React Hooks + TanStack Query

## 🧪 Testing

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Add keyword
curl -X POST http://localhost:8000/api/keywords \
  -H "Content-Type: application/json" \
  -d '{"keyword": "Tesla"}'

# Get stats
curl http://localhost:8000/api/dashboard/stats
```

### Test Sentiment Analyzer

```bash
cd backend
python sentiment_analyzer.py
```

This will run test cases with various sentiments.

## 📁 Project Structure

```
codeclash/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── database.py             # Database operations
│   ├── sentiment_analyzer.py  # AI sentiment analysis
│   ├── post_processor.py      # Async post processing
│   ├── requirements.txt       # Python dependencies
│   └── sentiment_monitor.db   # SQLite database (auto-created)
├── social-pulse-monitor/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── data/
│   └── mock_posts.json        # Sample social media data
├── REQUIREMENTS_AND_SCOPE.md  # Detailed requirements
├── PLAN_OF_ACTION.md          # Implementation plan
└── README.md                  # This file
```

## 🎯 Demo Flow

1. **Open Dashboard**: Navigate to `http://localhost:5173`
2. **Add Keywords**: Add "Tesla" and "iPhone" as keywords
3. **Start Simulation**: Run the simulation API command
4. **Watch Magic Happen**:
   - Posts appear in real-time
   - Sentiment analysis happens automatically
   - Charts update live
   - Alerts trigger for negative spikes

## 🚀 Performance

- **AI Processing**: ~5 seconds per post (CPU)
- **Database**: SQLite handles 1000+ posts easily
- **Real-time**: SSE provides <100ms update latency
- **Frontend**: React optimizations keep UI smooth

## 🔒 Security Notes

- CORS is currently set to allow all origins (`*`) for development
- In production, update CORS settings in `backend/main.py`
- No authentication implemented (out of scope)
- SQLite database is local file-based

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.10+ is installed
- Check if port 8000 is available
- Verify all dependencies are installed

### Model download fails
- Requires ~500MB disk space
- Needs internet connection on first run
- Model is cached in `~/.cache/huggingface/`

### Frontend can't connect
- Check backend is running on port 8000
- Verify `.env` file has correct API URL
- Check browser console for CORS errors

### SSE not working
- Refresh the page
- Check browser supports EventSource API
- Verify backend `/api/events` endpoint is accessible

## 📝 Future Enhancements

- [ ] Multi-user authentication
- [ ] Twitter/Reddit API integration
- [ ] Email/Slack alerts for spikes
- [ ] Historical data comparison
- [ ] Export reports to PDF/CSV
- [ ] Multi-language sentiment analysis
- [ ] Advanced NLP (entity recognition)

## 📄 License

This project is created for the CodeClash hackathon.

## 👥 Team

Built with ❤️ using Claude Code

---

**Happy Sentiment Monitoring! 🚀**
