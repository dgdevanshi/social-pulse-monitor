# Installation Guide

## System Requirements

- **Python**: 3.10, 3.11, or 3.12 (recommended)
- **Node.js**: 18+
- **RAM**: 2GB minimum
- **Disk Space**: 1GB (for AI model)
- **OS**: macOS, Linux, or Windows

## Step-by-Step Installation

### 1. Backend Setup

```bash
cd backend
```

#### Create Virtual Environment

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

#### Install Dependencies

This will take 2-5 minutes depending on your internet connection.

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**What gets installed:**
- FastAPI web framework (~10MB)
- PyTorch for AI (~200MB)
- Hugging Face Transformers (~50MB)
- SQLite async library
- Other utilities

**Note**: The AI model (~500MB) downloads automatically on first run, not during installation.

#### Verify Installation

```bash
python -c "import fastapi, transformers, torch; print('✅ All dependencies installed!')"
```

### 2. Frontend Setup

```bash
cd ../social-pulse-monitor
```

#### Install Dependencies

```bash
npm install
```

This installs:
- React and TypeScript
- Vite build tool
- shadcn/ui components
- Recharts for visualization
- TailwindCSS for styling

**Time**: 1-2 minutes

#### Verify Installation

```bash
npm run build:dev
```

Should complete without errors.

### 3. Test the Setup

#### Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

**Expected output:**
```
Initializing database...
Database initialized!
Background post processor started!
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**First Run Only**: You'll see:
```
Loading Hugging Face sentiment analysis model...
Downloading: 100%|████████████████████| 500MB/500MB
Model loaded successfully!
```

This takes 2-3 minutes and only happens once.

#### Start Frontend (Terminal 2)

```bash
cd social-pulse-monitor
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### Verify Everything Works

```bash
# Test backend health
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","database":"connected",...}
```

Open browser to: http://localhost:5173

You should see the dashboard!

## Troubleshooting

### Python Version Issues

If you have Python 3.13+, pydantic may have issues. Solutions:

**Option 1: Use Python 3.12**
```bash
# Install pyenv to manage Python versions
brew install pyenv  # macOS
# or: sudo apt install pyenv  # Linux

pyenv install 3.12.0
pyenv local 3.12.0
python -m venv venv
```

**Option 2: Use pre-built wheels**
```bash
pip install --upgrade pip
pip install pydantic --only-binary=:all:
pip install -r requirements.txt
```

### PyTorch Installation

If torch fails to install:

**CPU Only (faster, smaller):**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

**Mac with Apple Silicon:**
```bash
pip install torch torchvision torchaudio
pip install -r requirements.txt
```

### Port Already in Use

**Backend (port 8000):**
```bash
# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (port 5173):**
```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Model Download Fails

If the AI model download fails:

1. **Check internet connection**
2. **Clear cache and retry:**
   ```bash
   rm -rf ~/.cache/huggingface
   python main.py
   ```
3. **Manual download:**
   ```python
   from transformers import pipeline
   pipeline("sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english")
   ```

### Frontend Build Issues

**Clear node_modules:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Clear Vite cache:**
```bash
rm -rf node_modules/.vite
npm run dev
```

### Database Permission Issues

```bash
cd backend
chmod 755 .
rm -f sentiment_monitor.db  # Remove if corrupted
python main.py  # Will recreate
```

## Alternative: Docker Installation (Optional)

If you prefer Docker:

```bash
# Backend
cd backend
docker build -t sentiment-backend .
docker run -p 8000:8000 sentiment-backend

# Frontend
cd social-pulse-monitor
docker build -t sentiment-frontend .
docker run -p 5173:5173 sentiment-frontend
```

**Note**: Dockerfile not included, but can be added if needed.

## Minimal Installation (Without AI)

For testing without the AI model:

```bash
# Install only FastAPI
pip install fastapi uvicorn aiosqlite python-dotenv

# Comment out AI in main.py
# Use mock sentiment instead
```

## Installation Checklist

- [ ] Python 3.10-3.12 installed
- [ ] Node.js 18+ installed
- [ ] Virtual environment created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:8000/docs
- [ ] Can access http://localhost:5173
- [ ] Health check returns success

## Next Steps

Once installation is complete:

1. Read [QUICKSTART.md](QUICKSTART.md) for usage
2. Check [README.md](README.md) for full documentation
3. Run the demo simulation
4. Start building!

## Getting Help

**Common issues:**
- Check Python version: `python --version`
- Check Node version: `node --version`
- Check pip version: `pip --version`
- Review error logs carefully

**Still stuck?**
- Check GitHub issues
- Review installation logs
- Try the alternative installation methods above

---

**Happy coding!** 🚀
