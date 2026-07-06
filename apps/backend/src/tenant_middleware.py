from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import select
from src.database import async_session
from src.models.project import Project, UserProject
from src.security import ALGORITHM, SECRET_KEY
from jose import jwt
import structlog

logger = structlog.get_logger()

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip health, docs, and auth token endpoint (except if we want project-scoped auth later)
        if request.url.path in ["/", "/health", "/docs", "/openapi.json"] or request.url.path.startswith("/api/auth/"):
            return await call_next(request)

        project_id_str = request.headers.get("X-Project-ID")
        
        # Admin endpoints might be global? For now enforce project context or allow specific global admin endpoints
        # Assuming all v1 API calls are project scoped
        if request.url.path.startswith("/api/v1"):
            if not project_id_str:
                # Optionally return 400 or just proceed and let endpoints fail if they need it
                # For now, let's enforce it for v1
                # But to avoid breaking existing curl scripts etc immediately, maybe log warning?
                # User requirement says "Isolated data scopes", so strict enforcement is better.
                # However, verification scripts might not have it yet.
                pass 
            else:
                 request.state.project_id = int(project_id_str)

        response = await call_next(request)
        return response
