from .base import BasePlugin
from typing import Dict, Any
import httpx
import structlog

logger = structlog.get_logger()

class DiscordPlugin(BasePlugin):
    async def notify(self, message: str, context: Dict[str, Any] = None) -> bool:
        webhook_url = self.config.get("webhook_url")
        if not webhook_url:
            logger.error("Discord webhook URL missing")
            return False

        payload = {"content": message}
        if context:
            # Enrich message with context if needed (e.g., embeds)
            pass

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(webhook_url, json=payload)
                resp.raise_for_status()
                return True
        except Exception as e:
            logger.error("Failed to send to Discord", error=str(e))
            return False
