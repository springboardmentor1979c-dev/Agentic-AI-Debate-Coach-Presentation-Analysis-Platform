"""
Redis cache service — session caching, leaderboards, rate-limit counters.
Falls back seamlessly to fast in-memory storage when Redis is unavailable.
"""
import json
import time
from typing import Optional, Dict, List, Any
from config import REDIS_URL, CACHE_TTL_SECONDS

_redis_client = None
_redis_checked = False
_memory_cache: Dict[str, tuple[str, float]] = {}  # key -> (serialized_json, expire_at)
_memory_leaderboard: Dict[str, float] = {}  # user_id -> score


def _get_client():
    global _redis_client, _redis_checked
    if _redis_checked:
        return _redis_client
    try:
        import redis
        client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=0.1)
        client.ping()
        _redis_client = client
    except Exception:
        _redis_client = None
    finally:
        _redis_checked = True
    return _redis_client


def cache_set(key: str, value: Any, ttl: int = CACHE_TTL_SECONDS):
    client = _get_client()
    serialized = json.dumps(value)
    if client:
        try:
            client.setex(key, ttl, serialized)
            return
        except Exception:
            pass
    # In-memory fallback
    expire_at = time.time() + ttl
    _memory_cache[key] = (serialized, expire_at)


def cache_get(key: str) -> Optional[dict]:
    client = _get_client()
    if client:
        try:
            raw = client.get(key)
            if raw:
                return json.loads(raw)
        except Exception:
            pass

    # In-memory fallback with TTL check
    entry = _memory_cache.get(key)
    if entry:
        serialized, expire_at = entry
        if time.time() < expire_at:
            try:
                return json.loads(serialized)
            except Exception:
                return None
        else:
            _memory_cache.pop(key, None)
    return None


def cache_delete(key: str):
    client = _get_client()
    if client:
        try:
            client.delete(key)
        except Exception:
            pass
    _memory_cache.pop(key, None)


def cache_invalidate_user(user_id: int):
    """Invalidate all cache keys for a user."""
    for prefix in ["dashboard", "profile", "coaching"]:
        cache_delete(f"{prefix}:{user_id}")


def leaderboard_update(user_id: int, score: float):
    """Update leaderboard sorted set in Redis with in-memory fallback."""
    client = _get_client()
    if client:
        try:
            client.zadd("leaderboard:debate", {str(user_id): score})
            return
        except Exception:
            pass
    # In-memory fallback
    _memory_leaderboard[str(user_id)] = max(_memory_leaderboard.get(str(user_id), 0.0), score)


def leaderboard_get(top_n: int = 10) -> List[Dict[str, Any]]:
    """Get top N users from leaderboard."""
    client = _get_client()
    if client:
        try:
            entries = client.zrevrange("leaderboard:debate", 0, top_n - 1, withscores=True)
            if entries:
                return [{"user_id": int(uid), "score": score} for uid, score in entries]
        except Exception:
            pass
    # In-memory fallback
    sorted_items = sorted(_memory_leaderboard.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return [{"user_id": int(uid), "score": score} for uid, score in sorted_items]

