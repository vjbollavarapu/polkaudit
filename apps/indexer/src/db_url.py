"""Normalize DATABASE_URL for async SQLAlchemy + asyncpg (Neon-compatible)."""

import re


def normalize_async_database_url(url: str) -> str:
    normalized = url.strip()
    if normalized.startswith("postgresql://"):
        normalized = "postgresql+asyncpg://" + normalized[len("postgresql://") :]
    normalized = re.sub(r"[?&]channel_binding=[^&]*", "", normalized)
    normalized = re.sub(r"[?&]sslmode=[^&]*", "", normalized)
    normalized = normalized.rstrip("?&")
    return normalized


def asyncpg_connect_args(url: str) -> dict:
    args: dict = {"statement_cache_size": 0}
    if "neon.tech" in url or "sslmode=require" in url:
        args["ssl"] = "require"
    return args
