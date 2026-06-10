import re
from fastapi import APIRouter, HTTPException
from ..store import data_store

router = APIRouter(prefix="/api")
SLUG_RE = re.compile(r"^[a-z0-9-]+$")


@router.get("/manifest")
async def manifest():
    return data_store.manifest


@router.get("/category/{slug}")
async def category(slug: str):
    if not SLUG_RE.match(slug):
        raise HTTPException(400, "잘못된 slug")
    data = data_store.categories.get(slug)
    if data is None:
        raise HTTPException(404, "카테고리 없음")
    return data
