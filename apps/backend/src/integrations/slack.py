from .base import BasePlugin
from typing import Dict, Any
import httpx
import structlog

logger = structlog.get_logger()

class SlackPlugin(BasePlugin):
    async def notify(self, message: str, context: Dict[str, Any] = None) -> bool:
        webhook_url = self.config.get("webhook_url")
        if not webhook_url:
            logger.error("Slack webhook URL missing")
            return False

        payload = {"text": message}
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(webhook_url, json=payload)
                resp.raise_for_status()
                return True
        except Exception as e:
            logger.error("Failed to send to Slack", error=str(e))
            return False
