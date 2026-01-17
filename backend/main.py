from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import asyncio
import json
import random

from database import (
    init_db,
    add_keyword,
    get_keywords,
    delete_keyword,
    create_post,
    get_recent_posts,
    get_dashboard_stats,
    get_hourly_trends
)
from post_processor import (
    process_post_and_notify,
    process_pending_posts_background,
    processed_posts_queue
)

# Initialize FastAPI app
app = FastAPI(title="Social Sentiment Monitor API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class KeywordCreate(BaseModel):
    keyword: str

class PostCreate(BaseModel):
    text: str
    timestamp: str
    source: str

class PostsSimulate(BaseModel):
    count: int = 10
    interval: int = 2  # seconds between posts

# Global flag to track if background processor is running
background_processor_started = False

@app.on_event("startup")
async def startup_event():
    """Initialize database and start background processor on startup"""
    global background_processor_started

    print("Initializing database...")
    await init_db()
    print("Database initialized!")

    # Start background post processor
    if not background_processor_started:
        asyncio.create_task(process_pending_posts_background())
        background_processor_started = True
        print("Background post processor started!")

# ============== KEYWORD MANAGEMENT ENDPOINTS ==============

@app.post("/api/keywords", status_code=201)
async def create_keyword(keyword_data: KeywordCreate):
    """Add a new keyword to track"""
    try:
        keyword_id = await add_keyword(keyword_data.keyword)
        return {
            "status": "success",
            "keyword_id": keyword_id,
            "keyword": keyword_data.keyword
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/keywords")
async def list_keywords():
    """Get all keywords"""
    keywords = await get_keywords()
    return {"keywords": keywords}

@app.delete("/api/keywords/{keyword_id}")
async def remove_keyword(keyword_id: int):
    """Delete a keyword"""
    success = await delete_keyword(keyword_id)
    if success:
        return {"status": "success", "message": "Keyword deleted"}
    raise HTTPException(status_code=404, detail="Keyword not found")

# ============== POST INGESTION ENDPOINTS ==============

@app.post("/api/posts/ingest", status_code=201)
async def ingest_post(post: PostCreate, background_tasks: BackgroundTasks):
    """Ingest a single post and queue it for processing"""
    try:
        # Create post in database
        post_id = await create_post(
            text=post.text,
            timestamp=post.timestamp,
            source=post.source
        )

        # Process the post in the background
        background_tasks.add_task(process_post_and_notify, post_id)

        return {
            "status": "queued",
            "post_id": post_id,
            "message": "Post queued for processing"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/posts/bulk-ingest", status_code=201)
async def bulk_ingest_posts(posts: List[PostCreate], background_tasks: BackgroundTasks):
    """Ingest multiple posts at once"""
    try:
        post_ids = []
        for post in posts:
            post_id = await create_post(
                text=post.text,
                timestamp=post.timestamp,
                source=post.source
            )
            post_ids.append(post_id)
            background_tasks.add_task(process_post_and_notify, post_id)

        return {
            "status": "queued",
            "post_ids": post_ids,
            "count": len(post_ids)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============== MOCK DATA SIMULATION ==============

# Sample posts for simulation
SAMPLE_POSTS = [
    {"text": "Just bought the new iPhone 15! Camera quality is insane 📸", "source": "Twitter"},
    {"text": "Tesla's autopilot almost crashed my car today. This is unacceptable!", "source": "Twitter"},
    {"text": "Amazing customer service from Apple Store! They replaced my device immediately.", "source": "Twitter"},
    {"text": "Terrible experience with Tesla service center. Waited 3 hours for nothing.", "source": "Reddit"},
    {"text": "The new MacBook Pro is a game changer for developers!", "source": "Twitter"},
    {"text": "Tesla battery is draining way too fast. Very disappointed.", "source": "Twitter"},
    {"text": "Apple's new iOS update fixed all my issues. Love it!", "source": "Reddit"},
    {"text": "Tesla charging network is the best thing about owning this car.", "source": "Twitter"},
    {"text": "My iPhone keeps freezing. Worst phone I've ever had.", "source": "Twitter"},
    {"text": "Tesla Model 3 is the most fun car I've ever driven!", "source": "Reddit"},
    {"text": "Apple Watch saved my life by detecting irregular heartbeat!", "source": "Twitter"},
    {"text": "Tesla software update broke my car's infotainment system.", "source": "Twitter"},
    {"text": "The Apple ecosystem just works. Everything syncs perfectly.", "source": "Reddit"},
    {"text": "Tesla quality control is terrible. Panel gaps everywhere.", "source": "Twitter"},
    {"text": "AirPods Pro are worth every penny. Best noise cancellation!", "source": "Twitter"},
    {"text": "Got stuck in a Tesla with dead battery. Support was useless.", "source": "Reddit"},
    {"text": "iPhone battery lasts all day with heavy use. Impressed!", "source": "Twitter"},
    {"text": "Tesla paint is chipping after just 6 months. Unbelievable.", "source": "Twitter"},
    {"text": "Apple TV+ has some amazing shows. Highly recommend!", "source": "Reddit"},
    {"text": "Tesla autopilot is revolutionary. Can't imagine driving without it.", "source": "Twitter"},
]

# Global simulation control
simulation_running = False

@app.post("/api/posts/simulate")
async def simulate_posts(config: PostsSimulate, background_tasks: BackgroundTasks):
    """Start simulating posts (for demo purposes)"""
    global simulation_running

    if simulation_running:
        return {"status": "already_running", "message": "Simulation already in progress"}

    async def run_simulation():
        global simulation_running
        simulation_running = True

        try:
            for i in range(config.count):
                # Pick random post
                sample = random.choice(SAMPLE_POSTS)

                # Create post with current timestamp
                post_id = await create_post(
                    text=sample["text"],
                    timestamp=datetime.now().isoformat(),
                    source=sample["source"]
                )

                # Process immediately
                await process_post_and_notify(post_id)

                # Wait before next post
                await asyncio.sleep(config.interval)

        finally:
            simulation_running = False

    # Start simulation in background
    asyncio.create_task(run_simulation())

    return {
        "status": "started",
        "message": f"Simulating {config.count} posts with {config.interval}s interval"
    }

@app.get("/api/posts/simulate/status")
async def get_simulation_status():
    """Check if simulation is running"""
    return {"running": simulation_running}

# ============== DASHBOARD ENDPOINTS ==============

@app.get("/api/dashboard/stats")
async def get_stats():
    """Get dashboard statistics"""
    stats = await get_dashboard_stats()
    return stats

@app.get("/api/dashboard/recent")
async def get_recent():
    """Get recent processed posts"""
    posts = await get_recent_posts(limit=20)
    return {"posts": posts}

@app.get("/api/dashboard/trends")
async def get_trends(hours: int = 24):
    """Get hourly sentiment trends"""
    trends = await get_hourly_trends(hours=hours)
    return {"trends": trends}

# ============== REAL-TIME SSE ENDPOINT ==============

@app.get("/api/events")
async def event_stream():
    """
    Server-Sent Events (SSE) endpoint for real-time updates
    Streams newly processed posts to connected clients
    """
    async def generate_events():
        try:
            while True:
                # Wait for new processed posts
                try:
                    # Use wait_for with timeout to keep connection alive
                    post_data = await asyncio.wait_for(
                        processed_posts_queue.get(),
                        timeout=30.0
                    )

                    # Send the post data as SSE event
                    yield f"data: {json.dumps(post_data)}\n\n"

                except asyncio.TimeoutError:
                    # Send heartbeat to keep connection alive
                    yield f": heartbeat\n\n"

        except asyncio.CancelledError:
            print("SSE connection closed by client")

    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# ============== HEALTH CHECK ==============

@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "healthy",
        "message": "Social Sentiment Monitor API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    keywords = await get_keywords()
    stats = await get_dashboard_stats()

    return {
        "status": "healthy",
        "database": "connected",
        "keywords_count": len(keywords),
        "total_posts": stats["total_mentions"],
        "background_processor": "running" if background_processor_started else "stopped"
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
