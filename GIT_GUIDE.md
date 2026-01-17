# Git Guide

## Repository Setup ✅

The git remote has been configured for:
- **Repository**: https://github.com/dgdevanshi/social-pulse-monitor.git
- **Remote name**: origin

## Project Structure

You have two git repositories:

1. **Main Project** (`/codeclash/`)
   - Contains: backend, data, documentation
   - Remote: https://github.com/dgdevanshi/social-pulse-monitor.git

2. **Frontend** (`/codeclash/social-pulse-monitor/`)
   - Contains: React frontend
   - Remote: https://github.com/dgdevanshi/social-pulse-monitor.git

## Quick Commit & Push

### Option 1: Push Everything Together

```bash
cd /Users/shashwat/Desktop/projects/codeclash

# Add all files
git add .

# Commit
git commit -m "feat: complete AI sentiment monitor with Hugging Face

- Implement FastAPI backend with SQLite
- Add Hugging Face DistilBERT sentiment analysis
- Create real-time SSE updates
- Build React dashboard with shadcn/ui
- Add keyword tracking and management
- Implement hourly sentiment trends
- Create comprehensive documentation
- Add startup scripts and installation guides

All 5 mandatory features implemented ✅"

# Push to main branch
git push -u origin main
```

### Option 2: Push Frontend Separately

If you want to keep frontend in a separate repo:

```bash
# Push main project (backend + docs)
cd /Users/shashwat/Desktop/projects/codeclash
git add backend/ data/ *.md *.sh .gitignore
git commit -m "feat: add backend, data, and documentation"
git push -u origin main

# Push frontend separately
cd social-pulse-monitor
git add .
git commit -m "feat: connect frontend to backend API with SSE"
git push -u origin frontend
```

## Recommended: Single Repository Approach

Since this is a full-stack project, I recommend keeping everything together:

```bash
cd /Users/shashwat/Desktop/projects/codeclash

# Stage all changes
git add .

# Check what will be committed
git status

# Commit with detailed message
git commit -m "feat: implement AI-powered social sentiment monitor

Backend:
- FastAPI server with async operations
- SQLite database with aiosqlite
- Hugging Face DistilBERT sentiment analysis
- Real-time SSE streaming
- Background post processing
- Keyword tracking system

Frontend:
- React 18 + TypeScript
- shadcn/ui components
- Real-time dashboard updates
- Recharts visualizations
- SSE integration

Features:
✅ Social post ingestion
✅ AI sentiment analysis (Hugging Face)
✅ Keyword/brand tracking
✅ Sentiment dashboard
✅ Time-based trends
✅ Real-time updates via SSE

Documentation:
- Comprehensive README
- Quick start guide
- Installation instructions
- Project summary
- Startup scripts"

# Push to GitHub
git push -u origin main
```

## If Repository Already Has Content

If the GitHub repo already has files:

```bash
# Fetch and merge
git pull origin main --allow-unrelated-histories

# Resolve any conflicts if needed
git add .
git commit -m "merge: integrate new implementation"

# Push
git push origin main
```

## Create a New Branch

For development work:

```bash
# Create and switch to new branch
git checkout -b feature/sentiment-analysis

# Make changes, then commit
git add .
git commit -m "feat: add feature"

# Push branch
git push -u origin feature/sentiment-analysis
```

## Useful Git Commands

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- .

# Update from remote
git pull origin main
```

## .gitignore Already Set Up ✅

The following are excluded from git:
- `venv/` - Python virtual environment
- `node_modules/` - Node dependencies
- `*.db` - SQLite database files
- `.env` - Environment variables
- `__pycache__/` - Python cache
- `.DS_Store` - macOS files

## Pre-Push Checklist

- [ ] All code is working locally
- [ ] README.md is up to date
- [ ] .gitignore excludes sensitive/large files
- [ ] No API keys or secrets in code
- [ ] Database files are excluded
- [ ] Virtual environment is excluded

## Sample Git Workflow

```bash
# 1. Check current status
git status

# 2. Add specific files or all changes
git add backend/
git add social-pulse-monitor/
git add *.md
# Or simply: git add .

# 3. Commit with message
git commit -m "feat: your changes here"

# 4. Push to GitHub
git push origin main

# 5. Verify on GitHub
# Visit: https://github.com/dgdevanshi/social-pulse-monitor
```

## Troubleshooting

### "Updates were rejected"
```bash
git pull origin main --rebase
git push origin main
```

### "Failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### Large files error
```bash
# Check file sizes
git ls-files -s | awk '{print $4, $2}' | sort -n

# Remove large files from git
git rm --cached path/to/large/file
git commit --amend
```

---

**Remote configured successfully!** ✅
**Repository**: https://github.com/dgdevanshi/social-pulse-monitor.git

You're ready to push! 🚀
