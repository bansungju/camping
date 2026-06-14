import asyncio
import ipaddress
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .store import data_store
from .db import health_check, wal_checkpoint_loop
from .routers import categories, search


# M-493: Cloudflare 공식 IP 대역. 소켓 IP가 이 대역일 때만 CF-Connecting-IP를 신뢰한다
#   (CF 프록시 뒤가 아니면 헤더는 위조 가능 → rate-limit 키 회피에 악용). CF 뒤가 아니면 소켓 IP 사용.
_CF_RANGES = [ipaddress.ip_network(c) for c in (
    "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
    "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20",
    "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
    "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
    "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32",
    "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32",
)]


def _is_cloudflare(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return any(addr in net for net in _CF_RANGES)


def get_real_ip(request: Request) -> str:
    client = request.client.host if request.client else "127.0.0.1"
    # M-493: 소켓 IP가 Cloudflare 대역일 때만 CF-Connecting-IP 신뢰(헤더 스푸핑으로 rate-limit 회피 차단).
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip and _is_cloudflare(client):
        return cf_ip
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
# M-567: SlowAPIMiddleware가 없으면 Limiter(default_limits)가 inert라 모든 라우트가 무제한이었다 →
#   미들웨어를 추가해 default_limits("60/minute")를 전 라우트에 전역 적용.
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    # M-433: 정식 서빙은 apex(gear-forest.com), www는 301→apex. apex 누락 시 실서빙에서 CORS 차단됨.
    allow_origins=["https://gear-forest.com", "https://www.gear-forest.com", "https://bansungju.github.io", "http://localhost:3000", "http://127.0.0.1:5500"],
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
