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
    while True:
        await asyncio.sleep(300)
        try:
            async with aiosqlite.connect(DB_PATH) as db:
                await db.execute("PRAGMA wal_checkpoint(PASSIVE)")
            wal = DB_PATH + "-wal"
            if os.path.exists(wal) and os.path.getsize(wal) > 100 * 1024 * 1024:
                print(f"[WARN] WAL {os.path.getsize(wal)//1024//1024}MB")
        except Exception as e:
            print(f"[WAL] {e}")
