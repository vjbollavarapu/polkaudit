from fastapi import Request, HTTPException
from slowapi import Limiter,_rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

def rate_limit_public(request: Request):
    """
    Dependency to enforce strict rate limits on public endpoints.
    Actual decoration happens in the router via @limiter.limit
    This just serves as a marker or place for custom logic if needed.
    """
    pass
