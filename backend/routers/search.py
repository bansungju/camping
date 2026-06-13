from functools import lru_cache

from fastapi import APIRouter, Query

from ..store import data_store

router = APIRouter(prefix="/api")

MAX_RESULTS = 30
MIN_QUERY_LEN = 2   # M-438: 1자 쿼리 반복으로 전체 인덱스 선형스캔 → 이벤트루프 포화(DoS) 방지


@lru_cache(maxsize=512)
def _search_cached(keyword: str):
    """키워드별 검색 결과 캐시. M-438: 동일 쿼리 반복 시 선형스캔을 반복하지 않도록 LRU 캐시.
    search_index는 프로세스 기동 시 1회 로드되므로 캐시는 그 수명 동안 유효."""
    results = [
        item for item in data_store.search_index
        if keyword in item.get("b", "").lower()
        or keyword in item.get("m", "").lower()
        or keyword in item.get("c", "").lower()
    ]
    return results[:MAX_RESULTS]


@router.get("/search")
async def search(q: str = Query("", max_length=100)):
    q = q.strip()
    # M-438: 최소 길이 미만(빈/1자)은 스캔 없이 즉시 반환 — 단문 쿼리 CPU DoS 차단.
    if len(q) < MIN_QUERY_LEN:
        return []
    return _search_cached(q.lower())
