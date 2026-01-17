import aiosqlite
from datetime import datetime
from typing import Optional, List, Dict
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "sentiment_monitor.db")

async def get_db():
    """Get database connection"""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    return db

async def init_db():
    """Initialize database with schema"""
    db = await get_db()
    try:
        # Create keywords table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS keywords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create posts table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                source VARCHAR(50) NOT NULL,
                keyword_matched VARCHAR(100),
                sentiment_label VARCHAR(20),
                sentiment_score FLOAT,
                processing_status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create indexes for posts
        await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_sentiment ON posts(sentiment_label)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_keyword ON posts(keyword_matched)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(processing_status)")

        # Create sentiment_trends table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sentiment_trends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hour_timestamp TIMESTAMP NOT NULL,
                keyword VARCHAR(100),
                positive_count INTEGER DEFAULT 0,
                neutral_count INTEGER DEFAULT 0,
                negative_count INTEGER DEFAULT 0,
                UNIQUE(hour_timestamp, keyword)
            )
        """)

        await db.commit()
    finally:
        await db.close()

# Keyword operations
async def add_keyword(keyword: str) -> int:
    """Add a new keyword to track"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "INSERT INTO keywords (keyword) VALUES (?)",
            (keyword.lower(),)
        )
        await db.commit()
        return cursor.lastrowid
    finally:
        await db.close()

async def get_keywords() -> List[Dict]:
    """Get all keywords"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM keywords ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()

async def delete_keyword(keyword_id: int) -> bool:
    """Delete a keyword"""
    db = await get_db()
    try:
        await db.execute("DELETE FROM keywords WHERE id = ?", (keyword_id,))
        await db.commit()
        return True
    finally:
        await db.close()

# Post operations
async def create_post(text: str, timestamp: str, source: str) -> int:
    """Create a new post"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "INSERT INTO posts (text, timestamp, source) VALUES (?, ?, ?)",
            (text, timestamp, source)
        )
        await db.commit()
        return cursor.lastrowid
    finally:
        await db.close()

async def get_post(post_id: int) -> Optional[Dict]:
    """Get a single post by ID"""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM posts WHERE id = ?", (post_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None
    finally:
        await db.close()

async def update_post_sentiment(
    post_id: int,
    sentiment_label: str,
    sentiment_score: float,
    keyword_matched: Optional[str] = None
):
    """Update post with sentiment analysis results"""
    db = await get_db()
    try:
        await db.execute(
            """UPDATE posts
               SET sentiment_label = ?,
                   sentiment_score = ?,
                   keyword_matched = ?,
                   processing_status = 'processed'
               WHERE id = ?""",
            (sentiment_label, sentiment_score, keyword_matched, post_id)
        )
        await db.commit()
    finally:
        await db.close()

async def mark_post_ignored(post_id: int):
    """Mark post as ignored (no keyword match)"""
    db = await get_db()
    try:
        await db.execute(
            "UPDATE posts SET processing_status = 'ignored' WHERE id = ?",
            (post_id,)
        )
        await db.commit()
    finally:
        await db.close()

async def get_pending_posts() -> List[Dict]:
    """Get all pending posts"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM posts WHERE processing_status = 'pending' ORDER BY created_at ASC"
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()

async def get_recent_posts(limit: int = 20) -> List[Dict]:
    """Get recent processed posts"""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT * FROM posts
               WHERE processing_status = 'processed'
               ORDER BY timestamp DESC
               LIMIT ?""",
            (limit,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()

async def get_newly_processed_posts(since_id: int = 0) -> List[Dict]:
    """Get newly processed posts since a given ID"""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT * FROM posts
               WHERE processing_status = 'processed' AND id > ?
               ORDER BY id ASC""",
            (since_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()

# Dashboard statistics
async def get_dashboard_stats() -> Dict:
    """Get dashboard statistics"""
    db = await get_db()
    try:
        # Total mentions
        cursor = await db.execute(
            "SELECT COUNT(*) as total FROM posts WHERE processing_status = 'processed'"
        )
        total_row = await cursor.fetchone()
        total_mentions = total_row['total']

        # Sentiment breakdown
        cursor = await db.execute(
            """SELECT sentiment_label, COUNT(*) as count
               FROM posts
               WHERE processing_status = 'processed'
               GROUP BY sentiment_label"""
        )
        sentiment_rows = await cursor.fetchall()

        sentiment_breakdown = {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        }

        for row in sentiment_rows:
            if row['sentiment_label']:
                label = row['sentiment_label'].lower()
                sentiment_breakdown[label] = row['count']

        return {
            "total_mentions": total_mentions,
            "sentiment_breakdown": sentiment_breakdown
        }
    finally:
        await db.close()

async def get_hourly_trends(hours: int = 24) -> List[Dict]:
    """Get hourly sentiment trends"""
    db = await get_db()
    try:
        cursor = await db.execute(
            """SELECT
                   strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
                   SUM(CASE WHEN sentiment_label = 'POSITIVE' THEN 1 ELSE 0 END) as positive,
                   SUM(CASE WHEN sentiment_label = 'NEUTRAL' THEN 1 ELSE 0 END) as neutral,
                   SUM(CASE WHEN sentiment_label = 'NEGATIVE' THEN 1 ELSE 0 END) as negative
               FROM posts
               WHERE processing_status = 'processed'
                 AND timestamp >= datetime('now', '-' || ? || ' hours')
               GROUP BY hour
               ORDER BY hour ASC""",
            (hours,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        await db.close()
