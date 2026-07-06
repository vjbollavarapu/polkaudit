import aiosmtplib
import httpx
from email.message import EmailMessage
from src.models.alert import ChannelType, NotificationChannel
import structlog
import json

logger = structlog.get_logger()

class NotificationService:
    async def send_notification(self, channel: NotificationChannel, subject: str, message: str) -> bool:
        try:
            if channel.type == ChannelType.EMAIL:
                return await self._send_email(channel.config, subject, message)
            elif channel.type == ChannelType.WEBHOOK:
                return await self._send_webhook(channel.config, subject, message)
            elif channel.type == ChannelType.TELEGRAM:
                # Placeholder for Telegram
                logger.warning("Telegram not implemented")
                return False
            return False
        except Exception as e:
            logger.error("Notification failed", error=str(e), channel=channel.name)
            return False

    async def _send_email(self, config: dict, subject: str, body: str) -> bool:
        try:
            msg = EmailMessage()
            msg["From"] = config.get("sender", "alerts@polkaudit.com")
            msg["To"] = config.get("recipient")
            msg["Subject"] = subject
            msg.set_content(body)

            await aiosmtplib.send(
                msg,
                hostname=config.get("smtp_host", "localhost"),
                port=config.get("smtp_port", 1025),
                use_tls=False # For dev/mailhog
            )
            return True
        except Exception as e:
            logger.error("Email send failed", error=str(e))
            raise e

    async def _send_webhook(self, config: dict, subject: str, body: str) -> bool:
        try:
            url = config.get("url")
            payload = {
                "subject": subject,
                "message": body,
                "timestamp": str(config.get("timestamp", ""))
            }
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json=payload, timeout=5.0)
                resp.raise_for_status()
            return True
        except Exception as e:
            logger.error("Webhook send failed", error=str(e))
            raise e
