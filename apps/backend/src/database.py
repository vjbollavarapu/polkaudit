from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings
from .db_url import asyncpg_connect_args

# Create async engine
engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    future=True,
    connect_args=asyncpg_connect_args(settings.DATABASE_URL),
)

# Create session factory
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
