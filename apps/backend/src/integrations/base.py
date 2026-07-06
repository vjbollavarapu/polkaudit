from abc import ABC, abstractmethod
from typing import Any, Dict

class BasePlugin(ABC):
    def __init__(self, config: Dict[str, Any], credentials: Dict[str, Any] = None):
        self.config = config
        self.credentials = credentials or {}

    @abstractmethod
    async def notify(self, message: str, context: Dict[str, Any] = None) -> bool:
        """Sends a notification to the integrated platform."""
        pass

    async def sync(self) -> Dict[str, Any]:
        """Optional: Syncs data from external platform."""
        return {}
