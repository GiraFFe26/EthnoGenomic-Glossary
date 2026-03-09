from typing import List, Optional

from redis import Redis

SUGGESTIONS_KEY = "search:suggestions"


def bump_query(redis_client: Optional[Redis], query: Optional[str]) -> None:
    if not redis_client or not query:
        return
    if len(query.strip()) < 2:
        return
    try:
        redis_client.zincrby(SUGGESTIONS_KEY, 1, query.lower())
    except Exception:
        return


def get_top_queries(redis_client: Optional[Redis], limit: int = 10) -> List[str]:
    if not redis_client:
        return []
    try:
        res = redis_client.zrevrange(SUGGESTIONS_KEY, 0, limit - 1)
        return res
    except Exception:
        return []
