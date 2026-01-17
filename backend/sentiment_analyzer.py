from transformers import pipeline
from typing import Dict
import asyncio
from functools import lru_cache

# Global sentiment pipeline (initialized once)
_sentiment_pipeline = None

def get_sentiment_pipeline():
    """Get or initialize the sentiment analysis pipeline"""
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        print("Loading Hugging Face sentiment analysis model...")
        # Using DistilBERT fine-tuned on SST-2 (sentiment analysis)
        # This is a lightweight, fast model perfect for real-time analysis
        _sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            device=-1  # Use CPU (-1), change to 0 for GPU
        )
        print("Model loaded successfully!")
    return _sentiment_pipeline

def map_sentiment_label(label: str) -> str:
    """
    Map Hugging Face labels to our standard format
    DistilBERT SST-2 returns: POSITIVE or NEGATIVE
    We need: POSITIVE, NEUTRAL, or NEGATIVE
    """
    label_upper = label.upper()

    if label_upper == "POSITIVE":
        return "POSITIVE"
    elif label_upper == "NEGATIVE":
        return "NEGATIVE"
    else:
        return "NEUTRAL"

def determine_sentiment_with_neutral(label: str, score: float) -> tuple:
    """
    Add neutral sentiment detection based on confidence threshold
    If confidence is low (< 0.75), classify as NEUTRAL
    """
    if score < 0.75:
        return "NEUTRAL", score
    return map_sentiment_label(label), score

async def analyze_sentiment(text: str) -> Dict[str, any]:
    """
    Analyze sentiment of text using Hugging Face model

    Args:
        text: The text to analyze

    Returns:
        dict: {
            "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "confidence": float (0.0 to 1.0),
            "raw_label": str (original model output)
        }
    """
    try:
        # Run the pipeline in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        pipeline_func = get_sentiment_pipeline()

        # Truncate very long texts to avoid performance issues
        max_length = 512
        text_truncated = text[:max_length] if len(text) > max_length else text

        result = await loop.run_in_executor(
            None,
            lambda: pipeline_func(text_truncated)[0]
        )

        raw_label = result["label"]
        raw_score = result["score"]

        # Apply neutral threshold logic
        final_label, final_score = determine_sentiment_with_neutral(raw_label, raw_score)

        return {
            "sentiment": final_label,
            "confidence": round(final_score, 4),
            "raw_label": raw_label
        }

    except Exception as e:
        print(f"Error analyzing sentiment: {e}")
        # Fallback to neutral on error
        return {
            "sentiment": "NEUTRAL",
            "confidence": 0.5,
            "raw_label": "ERROR"
        }

async def analyze_sentiment_batch(texts: list) -> list:
    """
    Analyze sentiment for multiple texts in batch (more efficient)

    Args:
        texts: List of text strings to analyze

    Returns:
        list: List of sentiment dictionaries
    """
    try:
        loop = asyncio.get_event_loop()
        pipeline_func = get_sentiment_pipeline()

        # Truncate texts
        max_length = 512
        texts_truncated = [
            text[:max_length] if len(text) > max_length else text
            for text in texts
        ]

        # Run batch prediction
        results = await loop.run_in_executor(
            None,
            lambda: pipeline_func(texts_truncated)
        )

        # Process results
        analyzed = []
        for result in results:
            raw_label = result["label"]
            raw_score = result["score"]
            final_label, final_score = determine_sentiment_with_neutral(raw_label, raw_score)

            analyzed.append({
                "sentiment": final_label,
                "confidence": round(final_score, 4),
                "raw_label": raw_label
            })

        return analyzed

    except Exception as e:
        print(f"Error in batch analysis: {e}")
        # Return neutral for all on error
        return [
            {"sentiment": "NEUTRAL", "confidence": 0.5, "raw_label": "ERROR"}
            for _ in texts
        ]

# Utility function for testing
if __name__ == "__main__":
    import asyncio

    async def test():
        print("Testing sentiment analyzer...")

        test_texts = [
            "I love this product! It's amazing!",
            "This is terrible. Worst experience ever.",
            "It's okay, nothing special.",
            "The customer service was helpful and friendly!",
            "My package arrived damaged and broken."
        ]

        for text in test_texts:
            result = await analyze_sentiment(text)
            print(f"\nText: {text}")
            print(f"Sentiment: {result['sentiment']}")
            print(f"Confidence: {result['confidence']}")

    asyncio.run(test())
