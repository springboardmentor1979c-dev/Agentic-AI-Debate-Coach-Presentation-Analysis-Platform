"""
Redis cache service — session caching, leaderboards, rate-limit counters.
Falls back to in-memory dict when Redis is unavailable.
"""
import json
from config import REDIS_URL, CACHE_TTL_SECONDS

_redis_client = None
_memory_cache: dict = {}


def _get_client():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        import redis
        client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        _redis_client = client
        return _redis_client
    except Exception:
        return None


def cache_set(key: str, value: dict, ttl: int = CACHE_TTL_SECONDS):
    client = _get_client()
    serialized = json.dumps(value)
    if client:
        client.setex(key, ttl, serialized)
    else:
        _memory_cache[key] = serialized


def cache_get(key: str) -> dict | None:
    client = _get_client()
    raw = client.get(key) if client else _memory_cache.get(key)
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            return None
    return None


def cache_delete(key: str):
    client = _get_client()
    if client:
        client.delete(key)
    else:
        _memory_cache.pop(key, None)


def cache_invalidate_user(user_id: int):
    """Invalidate all cache keys for a user."""
    for prefix in ["dashboard", "profile", "coaching"]:
        cache_delete(f"{prefix}:{user_id}")


def leaderboard_update(user_id: int, score: float):
    """Update leaderboard sorted set in Redis."""
    client = _get_client()
    if client:
        try:
            client.zadd("leaderboard:debate", {str(user_id): score})
        except Exception:
            pass


def leaderboard_get(top_n: int = 10) -> list[dict]:
    """Get top N users from leaderboard."""
    client = _get_client()
    if client:
        try:
            entries = client.zrevrange("leaderboard:debate", 0, top_n - 1, withscores=True)
            return [{"user_id": int(uid), "score": score} for uid, score in entries]
        except Exception:
            pass
    return []
