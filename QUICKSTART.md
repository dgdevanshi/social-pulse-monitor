# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Backend (Terminal 1)

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only, ~2-3 minutes)
pip install -r requirements.txt

# Start the server
python main.py
```

**Expected output:**
```
Initializing database...
Database initialized!
Background post processor started!
Loading Hugging Face sentiment analysis model...
Model loaded successfully!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The first run will download the AI model (~500MB). This only happens once.

### Step 2: Start the Frontend (Terminal 2)

```bash
cd social-pulse-monitor

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Use the Application

1. **Open your browser**: http://localhost:5173

2. **Add keywords to track**:
   - In the "Keyword Manager" panel
   - Enter "Tesla" and click Add
   - Enter "iPhone" and click Add

3. **Start the simulation** (in a new terminal):
   ```bash
   curl -X POST "http://localhost:8000/api/posts/simulate" \
     -H "Content-Type: application/json" \
     -d '{"count": 20, "interval": 2}'
   ```

4. **Watch the magic happen**:
   - Posts appear in real-time
   - AI analyzes sentiment automatically
   - Charts update live
   - Dashboard shows statistics

## 🎯 What to Expect

### Timeline
- **0 seconds**: Simulation starts
- **2 seconds**: First post appears
- **5-7 seconds**: AI finishes analyzing first post
- **7 seconds**: Dashboard updates with sentiment
- **40 seconds**: All 20 posts processed

### Real-Time Features You'll See
- ✅ Live post feed updates
- ✅ Sentiment badges (green/yellow/red)
- ✅ Statistics updating automatically
- ✅ Pie chart showing distribution
- ✅ Line chart showing trends
- ✅ "Live" indicator in bottom right

## 🧪 API Examples

### Add a keyword manually
```bash
curl -X POST "http://localhost:8000/api/keywords" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "Apple"}'
```

### Ingest a custom post
```bash
curl -X POST "http://localhost:8000/api/posts/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This product is amazing! Best purchase ever!",
    "timestamp": "2025-01-17T12:00:00",
    "source": "Twitter"
  }'
```

### Check system health
```bash
curl http://localhost:8000/health
```

### View API documentation
Open: http://localhost:8000/docs

## 🐛 Troubleshooting

### "Port 8000 already in use"
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
```

### "Module not found"
```bash
# Make sure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend can't connect to backend
- Check backend is running: `curl http://localhost:8000/health`
- Verify `.env` file exists in `social-pulse-monitor/` folder
- Check it contains: `VITE_API_URL=http://localhost:8000`

### No posts appearing
1. Make sure you've added at least one keyword
2. Check that the simulation is running: `curl http://localhost:8000/api/posts/simulate/status`
3. Look at browser console (F12) for errors

## 📊 Demo Script

Perfect for presentations:

```bash
# Terminal 1: Start backend
cd backend && source venv/bin/activate && python main.py

# Terminal 2: Start frontend
cd social-pulse-monitor && npm run dev

# Terminal 3: Demo commands
# Add keywords
curl -X POST http://localhost:8000/api/keywords -H "Content-Type: application/json" -d '{"keyword":"Tesla"}'
curl -X POST http://localhost:8000/api/keywords -H "Content-Type: application/json" -d '{"keyword":"iPhone"}'

# Start simulation
curl -X POST http://localhost:8000/api/posts/simulate -H "Content-Type: application/json" -d '{"count":30,"interval":3}'

# Watch the dashboard update in real-time! 🎉
```

## 🎓 Next Steps

- Read the full [README.md](README.md) for architecture details
- Check [REQUIREMENTS_AND_SCOPE.md](REQUIREMENTS_AND_SCOPE.md) for feature specifications
- See [PLAN_OF_ACTION.md](PLAN_OF_ACTION.md) for implementation details

---

**Ready to go!** Open http://localhost:5173 and start monitoring sentiment! 🚀
