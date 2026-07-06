#!/usr/bin/env python3
"""DB helpers for governance check / demo backfill scripts."""

from __future__ import annotations

import asyncio
import os
import re
import sys
from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def load_indexer_env() -> None:
    root = repo_root()
    load_dotenv(root / "apps" / "indexer" / ".env")
    load_dotenv(root / "apps" / "backend" / ".env")


def pg_dsn() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        print("ERROR: DATABASE_URL not set (apps/indexer/.env)", file=sys.stderr)
        sys.exit(1)
    url = url.replace("postgresql+asyncpg://", "postgresql://")
    url = re.sub(r"[?&]channel_binding=[^&]*", "", url)
    url = re.sub(r"[?&]sslmode=[^&]*", "", url)
    return url.rstrip("?&")


async def fetch_counts() -> dict[str, int]:
    import asyncpg

    conn = await asyncpg.connect(pg_dsn(), statement_cache_size=0)
    try:
        row = await conn.fetchrow(
            """
            SELECT
              (SELECT COUNT(*)::bigint FROM extrinsics) AS extrinsics,
              (SELECT COUNT(*)::bigint FROM proposals) AS proposals,
              (SELECT COUNT(*)::bigint FROM votes) AS votes,
              (SELECT COUNT(*)::bigint FROM treasury_spends) AS treasury_spends,
              (SELECT COUNT(*)::bigint FROM blocks) AS blocks,
              (SELECT COALESCE(MAX(block_number), 0)::bigint FROM processed_blocks) AS last_block
            """
        )
        return {k: int(row[k]) for k in row.keys()}
    finally:
        await conn.close()


async def reset_indexer_tables() -> None:
    import asyncpg

    conn = await asyncpg.connect(pg_dsn(), statement_cache_size=0)
    try:
        await conn.execute(
            """
            TRUNCATE TABLE
              votes,
              treasury_spends,
              proposals,
              extrinsics,
              blocks,
              processed_blocks,
              dead_letter_queue
            RESTART IDENTITY CASCADE
            """
        )
    finally:
        await conn.close()


def print_counts(counts: dict[str, int]) -> None:
    print("Database counts (indexer tables):")
    print(f"  blocks:           {counts['blocks']}")
    print(f"  extrinsics:       {counts['extrinsics']}")
    print(f"  proposals:        {counts['proposals']}")
    print(f"  votes:            {counts['votes']}")
    print(f"  treasury_spends:  {counts['treasury_spends']}")
    print(f"  last_block:       {counts['last_block']}")
