import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .store import data_store
from .db import health_check, wal_checkpoint_loop
from .routers import categories, search


def get_real_ip(request: Request) -> str:
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip
    client = request.client.host if request.client else "127.0.0.1"
    return "__internal__" if client in ("127.0.0.1", "::1") else client


limiter = Limiter(key_func=get_real_ip, default_limits=["60/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    data_store.load()
    task = asyncio.create_task(wal_checkpoint_loop())
    yield
    task.cancel()


app = FastAPI(title="캠핑기어 API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bansungju.github.io", "http://localhost:3000", "http://127.0.0.1:5500"],
    allow_methods=["GET"],
    allow_headers=[],
    max_age=86400,
)


@app.middleware("http")
async def no_cache_api(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/health")
async def health():
    result = await health_check()
    status_code = 200 if result["status"] == "ok" else 503
    return JSONResponse(result, status_code=status_code)


app.include_router(categories.router)
app.include_router(search.router)
