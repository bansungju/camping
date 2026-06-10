from fastapi import APIRouter, Query, HTTPException
from ..store import data_store

router = APIRouter(prefix="/api")

MAX_RESULTS = 30


@router.get("/search")
async def search(q: str = Query("", max_length=100)):
    q = q.strip()
    if not q:
        return []
    keyword = q.lower()
    results = [
        item for item in data_store.search_index
        if keyword in item.get("b", "").lower()
        or keyword in item.get("m", "").lower()
        or keyword in item.get("c", "").lower()
    ]
    return results[:MAX_RESULTS]
