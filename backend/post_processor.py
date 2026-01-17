import asyncio
from typing import Optional, List
from database import (
    get_post,
    get_keywords,
    update_post_sentiment,
    mark_post_ignored,
    get_pending_posts
)
from sentiment_analyzer import analyze_sentiment

def matches_any_keyword(text: str, keywords: List[str]) -> Optional[str]:
    """
    Check if text contains any of the keywords

    Args:
        text: The text to search in
        keywords: List of keywords to search for

    Returns:
        The matched keyword, or None if no match
    """
    text_lower = text.lower()
    for keyword in keywords:
        if keyword.lower() in text_lower:
            return keyword
    return None

async def process_single_post(post_id: int) -> dict:
    """
    Process a single post:
    1. Fetch post from database
    2. Check if it matches any keyword
    3. If match: run sentiment analysis
    4. Update post in database

    Returns:
        dict: Processing result with status and data
    """
    try:
        # Get the post
        post = await get_post(post_id)
        if not post:
            return {"status": "error", "message": "Post not found"}

        # Get active keywords
        keyword_rows = await get_keywords()
        keywords = [row['keyword'] for row in keyword_rows]

        if not keywords:
            # No keywords configured, mark as ignored
            await mark_post_ignored(post_id)
            return {
                "status": "ignored",
                "message": "No keywords configured",
                "post_id": post_id
            }

        # Check for keyword match
        matched_keyword = matches_any_keyword(post['text'], keywords)

        if not matched_keyword:
            # No keyword match, ignore this post
            await mark_post_ignored(post_id)
            return {
                "status": "ignored",
                "message": "No keyword match",
                "post_id": post_id
            }

        # Keyword matched! Run sentiment analysis
        sentiment_result = await analyze_sentiment(post['text'])

        # Update post with results
        await update_post_sentiment(
            post_id=post_id,
            sentiment_label=sentiment_result['sentiment'],
            sentiment_score=sentiment_result['confidence'],
            keyword_matched=matched_keyword
        )

        # Return the processed post data
        return {
            "status": "processed",
            "post_id": post_id,
            "text": post['text'],
            "timestamp": post['timestamp'],
            "source": post['source'],
            "keyword_matched": matched_keyword,
            "sentiment": sentiment_result['sentiment'],
            "confidence": sentiment_result['confidence']
        }

    except Exception as e:
        print(f"Error processing post {post_id}: {e}")
        return {
            "status": "error",
            "message": str(e),
            "post_id": post_id
        }

async def process_pending_posts_background():
    """
    Background task that continuously processes pending posts
    This runs in the background and checks for new posts every 2 seconds
    """
    print("Starting background post processor...")

    while True:
        try:
            # Get all pending posts
            pending = await get_pending_posts()

            if pending:
                print(f"Processing {len(pending)} pending posts...")
                for post in pending:
                    result = await process_single_post(post['id'])
                    if result['status'] == 'processed':
                        print(f"✓ Processed post {post['id']}: {result['sentiment']}")
                    elif result['status'] == 'ignored':
                        print(f"○ Ignored post {post['id']}: {result['message']}")

            # Wait before checking again
            await asyncio.sleep(2)

        except Exception as e:
            print(f"Error in background processor: {e}")
            await asyncio.sleep(5)  # Wait longer on error

# Queue for storing newly processed posts (for SSE)
processed_posts_queue = asyncio.Queue()

async def process_post_and_notify(post_id: int) -> dict:
    """
    Process a post and add to notification queue for SSE

    Args:
        post_id: ID of the post to process

    Returns:
        Processing result
    """
    result = await process_single_post(post_id)

    # If successfully processed, add to notification queue
    if result['status'] == 'processed':
        await processed_posts_queue.put(result)

    return result
