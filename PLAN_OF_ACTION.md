# Plan of Action: AI-Driven Social Sentiment Monitor

## Architecture Overview

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend   │ ◄─SSE──►│     Backend      │ ◄──────►│   SQLite    │
│  (React/Vue) │         │  (FastAPI/Flask) │         │   Database  │
└──────────────┘         └──────────────────┘         └─────────────┘
                                  │
                                  │ API Call
                                  ▼
                         ┌──────────────────┐
                         │  ChatGPT API     │
                         │  (or Hugging Face│
                         │   or Local LLM)  │
                         └──────────────────┘
```

---

## Phase 1: Setup & Foundation (15 mins)

### 1.1 Project Structure
```
sentiment-monitor/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── database.py             # SQLite connection & models
│   ├── sentiment_analyzer.py  # AI sentiment analysis
│   ├── post_processor.py      # Async post processing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── KeywordConfig.jsx
│   │   │   ├── SentimentChart.jsx
│   │   │   └── RecentPosts.jsx
│   └── package.json
└── data/
    └── mock_posts.json         # Mock social media data
```

### 1.2 Initialize Database Schema
```sql
-- Table: keywords (brands/topics to monitor)
CREATE TABLE keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: posts (social media posts)
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

-- Table: sentiment_trends (aggregated hourly data)
CREATE TABLE sentiment_trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hour_timestamp TIMESTAMP NOT NULL,
    keyword VARCHAR(100),
    positive_count INTEGER DEFAULT 0,
    neutral_count INTEGER DEFAULT 0,
    negative_count INTEGER DEFAULT 0
);
```

### 1.3 Tech Stack Setup
- Backend: FastAPI (async support, SSE built-in)
- Database: SQLite with `aiosqlite` for async
- AI: OpenAI API (primary) + Hugging Face (fallback)
- Frontend: React + Recharts + EventSource (SSE)
- Real-time: Server-Sent Events (SSE)

---

## Phase 2: Backend Core (30 mins)

### 2.1 Database Layer (`database.py`)
- [x] SQLite connection setup
- [x] Create tables on startup
- [x] CRUD operations for keywords
- [x] CRUD operations for posts
- [x] Query functions for dashboard stats

### 2.2 Sentiment Analysis (`sentiment_analyzer.py`)

**Option A: OpenAI API (RECOMMENDED - Structured Output)**
```python
async def analyze_sentiment(text: str) -> dict:
    """
    Returns: {
        "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        "confidence": 0.95,
        "reasoning": "brief explanation"
    }
    """
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "system",
            "content": "You are a sentiment analyzer. Return JSON only."
        }, {
            "role": "user",
            "content": f"Analyze sentiment: {text}"
        }],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
```

**Option B: Hugging Face (FREE)**
```python
from transformers import pipeline

sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

async def analyze_sentiment(text: str) -> dict:
    result = sentiment_pipeline(text)[0]
    return {
        "sentiment": result["label"],  # POSITIVE/NEGATIVE
        "confidence": result["score"],
        "reasoning": None
    }
```

### 2.3 Post Processor (`post_processor.py`)
```python
async def process_post_async(post_id: int):
    """
    1. Fetch post from DB
    2. Check if it matches any keyword
    3. If match: run sentiment analysis
    4. Update post in DB
    5. Trigger SSE event
    """
    pass
```

### 2.4 API Endpoints (`main.py`)

**Keyword Management:**
- `POST /api/keywords` - Add keyword
- `GET /api/keywords` - List all keywords
- `DELETE /api/keywords/{id}` - Remove keyword

**Post Ingestion:**
- `POST /api/posts/ingest` - Manually add posts (for testing)
- `POST /api/posts/simulate` - Simulate new posts from mock data

**Dashboard Data:**
- `GET /api/dashboard/stats` - Total mentions, sentiment breakdown
- `GET /api/dashboard/recent` - Last 20 posts
- `GET /api/dashboard/trends` - Time-series sentiment data

**Real-time Updates:**
- `GET /api/events` - SSE endpoint for real-time updates

---

## Phase 3: Asynchronous Processing Flow (20 mins)

### 3.1 Post Processing Pipeline
```
New Post Arrives
      ↓
Save to DB (status: 'pending')
      ↓
Background Task Started (async)
      ↓
Check Keywords Match
      ↓
┌─────┴─────┐
│ No Match  │ → Mark as 'ignored'
└───────────┘
      ↓
│ Match! │
      ↓
Run AI Sentiment Analysis
      ↓
Update DB (status: 'processed', sentiment: 'NEGATIVE', score: 0.87)
      ↓
Send SSE Event to Frontend
```

### 3.2 SSE Implementation
```python
# Backend: Stream events
@app.get("/api/events")
async def event_stream():
    async def event_generator():
        while True:
            # Check for new processed posts
            if new_post_available:
                yield f"data: {json.dumps(post_data)}\n\n"
            await asyncio.sleep(1)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# Frontend: Listen to events
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
    const post = JSON.parse(event.data);
    updateDashboard(post);
};
```

---

## Phase 4: Frontend Dashboard (25 mins)

### 4.1 Components to Build

**1. Keyword Configuration Panel**
- Input field to add keywords
- List of active keywords with delete button
- API calls: `POST /api/keywords`, `GET /api/keywords`

**2. Dashboard Stats (Top Cards)**
- Total Mentions (count)
- Sentiment Breakdown (Positive %, Neutral %, Negative %)
- API call: `GET /api/dashboard/stats`

**3. Sentiment Pie Chart**
- Visual breakdown of sentiment distribution
- Use Recharts PieChart component

**4. Recent Posts Table**
- Columns: Text, Sentiment, Timestamp, Source
- Color-coded sentiment badges (green/yellow/red)
- API call: `GET /api/dashboard/recent`

**5. Time-Series Trend Chart**
- Line chart showing sentiment over time (hourly)
- X-axis: Time, Y-axis: Count
- Multiple lines for Positive/Neutral/Negative
- API call: `GET /api/dashboard/trends`

### 4.2 Real-time Updates
- SSE connection on component mount
- Auto-update stats, recent posts, and charts when new data arrives
- Show notification badge for new negative posts

---

## Phase 5: Mock Data & Testing (10 mins)

### 5.1 Mock Post Generator
```python
# Generate realistic social media posts
mock_posts = [
    {
        "text": "Just bought the new iPhone 15! Camera quality is insane 📸",
        "timestamp": "2025-01-17 10:30:00",
        "source": "Twitter"
    },
    {
        "text": "Tesla's autopilot almost crashed my car today. This is unacceptable!",
        "timestamp": "2025-01-17 11:45:00",
        "source": "Twitter"
    },
    # ... more posts
]
```

### 5.2 Simulation Endpoint
- `POST /api/posts/simulate` - Ingest random posts every 2 seconds
- Simulates real-time social media stream
- Perfect for demo

---

## Phase 6: Mandatory Features Checklist

- [ ] **Feature 1: Social Post Ingestion**
  - Mock data loader
  - API endpoint to add posts
  - Store: text, timestamp, source, keyword_matched

- [ ] **Feature 2: AI Sentiment Analysis**
  - OpenAI/Hugging Face integration
  - Classify: Positive/Neutral/Negative
  - Store sentiment label + confidence

- [ ] **Feature 3: Keyword/Brand Tracking**
  - Add/remove keywords via UI
  - Filter posts by keyword match
  - Store matched keyword with post

- [ ] **Feature 4: Sentiment Dashboard**
  - Total mentions counter
  - Sentiment breakdown (pie chart)
  - Recent posts table with labels

- [ ] **Feature 5: Time-Based Trends**
  - Hourly sentiment aggregation
  - Line chart visualization
  - Highlight negative sentiment increases

---

## Phase 7: Advanced Features (If Time Permits)

### 7.1 Negative Sentiment Spike Detection
```python
def detect_spike(recent_negative_count, baseline_avg):
    """
    Alert if negative posts > 2x baseline
    """
    if recent_negative_count > baseline_avg * 2:
        return True, "SPIKE DETECTED"
    return False, "NORMAL"
```

### 7.2 Keyword Extraction (Simple Version)
```python
from collections import Counter
import re

def extract_keywords(negative_posts):
    """
    Find most common words in negative posts
    """
    words = []
    for post in negative_posts:
        words.extend(re.findall(r'\w+', post.text.lower()))
    
    # Remove stopwords and get top 10
    return Counter(words).most_common(10)
```

---

## Development Timeline (2 Hours)

| Time      | Task                                      | Duration |
|-----------|-------------------------------------------|----------|
| 0:00-0:15 | Setup project, database, dependencies     | 15 min   |
| 0:15-0:45 | Backend API + sentiment analyzer          | 30 min   |
| 0:45-1:05 | Async processing + SSE implementation     | 20 min   |
| 1:05-1:30 | Frontend dashboard components             | 25 min   |
| 1:30-1:40 | Mock data + testing                       | 10 min   |
| 1:40-2:00 | Polish, bug fixes, presentation prep      | 20 min   |

---

## Critical Success Factors

1. **Keep It Simple**: Don't over-engineer. SQLite + FastAPI + React is enough.
2. **Use Mock Data**: Don't waste time on Twitter API authentication.
3. **Pre-built UI**: Use a component library (shadcn/ui, Ant Design) to save time.
4. **Test Early**: Run the full flow after each phase.
5. **Have a Backup**: If OpenAI API fails, fall back to Hugging Face.

---

## Presentation Prep

### Demo Flow:
1. Show empty dashboard
2. Add keyword "Tesla"
3. Trigger post simulation
4. Watch real-time updates as posts get analyzed
5. Show sentiment breakdown and trends
6. Highlight a negative sentiment spike

### What to Present:
- Architecture diagram
- Database schema (ER diagram)
- API endpoint documentation
- AI workflow explanation
- Live demo or recorded video

---

## Risk Mitigation

| Risk                          | Mitigation                                  |
|-------------------------------|---------------------------------------------|
| OpenAI API costs money        | Use Hugging Face free tier or local model  |
| Frontend takes too long       | Use Streamlit instead (Python only)         |
| SSE doesn't work              | Fall back to polling (every 5 seconds)      |
| No real social media data     | Use Kaggle Twitter dataset (CSV)            |
| Time runs out                 | Focus on 5 mandatories only, skip advanced  |

---

## Post-Hackathon Improvements (If Continuing)

1. Real Twitter/Reddit API integration
2. User authentication
3. Multi-brand monitoring (separate dashboards)
4. Email/Slack alerts for spikes
5. Export reports as PDF
6. Historical data comparison (week-over-week)
