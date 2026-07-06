from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.integration import Plugin, Integration
from src.integrations.base import BasePlugin
from src.integrations.discord import DiscordPlugin
from src.integrations.slack import SlackPlugin
import structlog
from typing import Dict, Any, Type

logger = structlog.get_logger()

PLUGIN_REGISTRY: Dict[str, Type[BasePlugin]] = {
    "discord": DiscordPlugin,
    "slack": SlackPlugin
}

class IntegrationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register_default_plugins(self):
        """Ensures default plugins exist in DB."""
        defaults = [
            {"name": "Discord", "slug": "discord", "description": "Send notifications to Discord channels", "capabilities": ["notify"]},
            {"name": "Slack", "slug": "slack", "description": "Send notifications to Slack channels", "capabilities": ["notify"]}
        ]
        
        for p_def in defaults:
            result = await self.db.execute(select(Plugin).where(Plugin.slug == p_def["slug"]))
            existing = result.scalars().first()
            if not existing:
                plugin = Plugin(**p_def)
                self.db.add(plugin)
                logger.info("Registered plugin", slug=p_def["slug"])
        await self.db.commit()

    async def configure_integration(self, project_id: int, plugin_slug: str, config: Dict[str, Any]) -> Integration:
        # Get Plugin ID
        result = await self.db.execute(select(Plugin).where(Plugin.slug == plugin_slug))
        plugin = result.scalars().first()
        if not plugin:
            raise ValueError(f"Plugin {plugin_slug} not found")

        # Create/Update Integration
        # Check if exists for this project/plugin combo? Or allow multiple? 
        # For simplicity, allow one instance per plugin per project for now.
        result = await self.db.execute(select(Integration).where(
            Integration.project_id == project_id,
            Integration.plugin_id == plugin.id
        ))
        integration = result.scalars().first()
        
        if integration:
            integration.config = config
        else:
            integration = Integration(
                project_id=project_id,
                plugin_id=plugin.id,
                config=config,
                credentials={}
            )
            self.db.add(integration)
        
        await self.db.commit()
        await self.db.refresh(integration)
        return integration

    async def get_active_integrations(self, project_id: int):
        # Join Integration + Plugin
        result = await self.db.execute(
            select(Integration, Plugin)
            .join(Plugin, Integration.plugin_id == Plugin.id)
            .where(Integration.project_id == project_id, Integration.is_active == True)
        )
        return result.all() # list of (Integration, Plugin) tuples

    async def dispatch_notify(self, project_id: int, message: str, context: Dict[str, Any] = None):
        """Dispatches message to all active notification integrations for the project."""
        integrations = await self.get_active_integrations(project_id)
        
        for integration, plugin_info in integrations:
            if "notify" in plugin_info.capabilities:
                plugin_cls = PLUGIN_REGISTRY.get(plugin_info.slug)
                if plugin_cls:
                    try:
                        plugin_instance = plugin_cls(config=integration.config, credentials=integration.credentials)
                        success = await plugin_instance.notify(message, context)
                        logger.info("Dispatched notification", plugin=plugin_info.slug, success=success)
                    except Exception as e:
                        logger.error("Dispatch failed", plugin=plugin_info.slug, error=str(e))
