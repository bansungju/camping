import asyncio, os, time
import aiosqlite

DB_PATH = os.environ.get(
    "CAMPING_DB",
    os.path.join(os.path.dirname(__file__), "..", "camping_tents500.db")
)
DB_SEMAPHORE = asyncio.Semaphore(10)


async def query_db(sql: str, params=()):
    from fastapi import HTTPException
    try:
        async def _run():
            async with DB_SEMAPHORE:
                async with aiosqlite.connect(f"file:{DB_PATH}?mode=ro", uri=True) as db:
                    db.row_factory = aiosqlite.Row
                    async with db.execute(sql, params) as cur:
                        return await cur.fetchall()
        return await asyncio.wait_for(_run(), timeout=8.0)
    except asyncio.TimeoutError:
        raise HTTPException(503, "서버 과부하. 잠시 후 재시도해 주세요.")


async def health_check() -> dict:
    async def _check():
        async with aiosqlite.connect(f"file:{DB_PATH}?mode=ro", uri=True) as db:
            rows = await db.execute_fetchall(
                "SELECT COUNT(*) FROM products WHERE curation_status='verified'"
            )
            return rows[0][0]
    try:
        count = await asyncio.wait_for(_check(), timeout=0.5)
        return {"status": "ok", "products": count, "ts": int(time.time())}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


async def wal_checkpoint_loop():
    # H-125: 백엔드는 DB의 read-only 소비자다(다른 모든 연결이 file:...?mode=ro). 체크포인트는 main DB
    #   파일에 쓰기가 필요해 read-only로는 수행 불가하고, 여기서만 read-write로 열면 파이프라인(유일한
    #   writer)의 쓰기와 SHARED 락이 충돌해 WAL 손상 위험이 있다. 체크포인트는 WAL의 writer인 파이프라인이
    #   담당(SQLite WAL auto-checkpoint 포함)하고, 백엔드는 WAL 크기 모니터링만 한다 — DB 연결 불필요.
    while True:
        await asyncio.sleep(300)
        try:
            wal = DB_PATH + "-wal"
            if os.path.exists(wal) and os.path.getsize(wal) > 100 * 1024 * 1024:
                print(f"[WARN] WAL {os.path.getsize(wal)//1024//1024}MB — 파이프라인 체크포인트 확인 필요")
        except Exception as e:
            print(f"[WAL] {e}")
