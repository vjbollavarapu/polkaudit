from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from src.models.analytics import AnalyticsMetric, Forecast, MetricType
from src.models.scoring import GovernanceScore
from src.models.project import Project
from datetime import date, timedelta, datetime
import statistics
import structlog

logger = structlog.get_logger()

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def aggregate_metrics(self, project_id: int):
        """
        Aggregates daily metrics from GovernanceScore for trend analysis.
        Ideally run via cron daily. For MVP, we run on demand.
        """
        logger.info("Aggregating metrics", project_id=project_id)
        
        # Get scores ordered by date
        scores = await self.db.execute(
            select(GovernanceScore)
            .where(GovernanceScore.project_id == project_id)
            .order_by(GovernanceScore.created_at.asc())
        )
        scores = scores.scalars().all()

        # Simplify: One metric per day per type.
        # If multiple scores same day, take latest.
        daily_map = {}
        for score in scores:
            d = score.created_at.date()
            daily_map[d] = score

        for d, score in daily_map.items():
            # Upsert Metrics
            await self._upsert_metric(project_id, MetricType.TRANSPARENCY, d, score.transparency_score)
            await self._upsert_metric(project_id, MetricType.PARTICIPATION, d, score.participation_score)
            await self._upsert_metric(project_id, MetricType.TREASURY, d, score.treasury_score)
            await self._upsert_metric(project_id, MetricType.OVERALL, d, score.overall_score)
        
        await self.db.commit()

    async def _upsert_metric(self, project_id: int, metric_type: str, date_val: date, value: float):
        # Delete existing for idempotency (simple approach)
        await self.db.execute(delete(AnalyticsMetric).where(
            AnalyticsMetric.project_id == project_id,
            AnalyticsMetric.metric_type == metric_type,
            AnalyticsMetric.date == date_val
        ))
        
        metric = AnalyticsMetric(
            project_id=project_id,
            metric_type=metric_type,
            date=date_val,
            value=value
        )
        self.db.add(metric)

    async def generate_forecast(self, project_id: int, days_ahead: int = 30):
        """
        Generates linear forecast for the next 30 days based on aggregated metrics.
        """
        logger.info("Generating forecast", project_id=project_id)
        
        # Clear old forecasts
        await self.db.execute(delete(Forecast).where(Forecast.project_id == project_id))
        
        for m_type in MetricType:
            # Fetch history
            metrics = await self.db.execute(
                select(AnalyticsMetric)
                .where(AnalyticsMetric.project_id == project_id, AnalyticsMetric.metric_type == m_type)
                .order_by(AnalyticsMetric.date.asc())
            )
            history = metrics.scalars().all()
            
            if len(history) < 2:
                logger.warning("Not enough data to forecast", metric=m_type)
                continue

            # Prepare data for regression
            # X = days since start, Y = value
            start_date = history[0].date
            x_vals = [(m.date - start_date).days for m in history]
            y_vals = [m.value for m in history]

            try:
                slope, intercept = statistics.linear_regression(x_vals, y_vals)
            except statistics.StatisticsError:
                 # Fallback if constant
                 slope = 0
                 intercept = statistics.mean(y_vals)

            # Predict Future
            last_date = history[-1].date
            last_x = x_vals[-1]

            for i in range(1, days_ahead + 1):
                future_x = last_x + i
                pred_y = slope * future_x + intercept
                
                # Clamp 0-100
                pred_y = max(0.0, min(100.0, pred_y))

                # Confidence Interval (Simplified: Fixed margin based on standard deviation of residuals if we wanted)
                # For MVP: 5% margin
                margin = 5.0 

                forecast = Forecast(
                    project_id=project_id,
                    metric_type=m_type,
                    forecast_date=last_date + timedelta(days=i),
                    predicted_value=pred_y,
                    confidence_lower=max(0.0, pred_y - margin),
                    confidence_upper=min(100.0, pred_y + margin)
                )
                self.db.add(forecast)
        
        await self.db.commit()

    async def get_trends(self, project_id: int, metric_type: str):
        metrics = await self.db.execute(
            select(AnalyticsMetric)
            .where(AnalyticsMetric.project_id == project_id, AnalyticsMetric.metric_type == metric_type)
            .order_by(AnalyticsMetric.date.asc())
        )
        return metrics.scalars().all()

    async def get_forecasts(self, project_id: int, metric_type: str):
         forecasts = await self.db.execute(
            select(Forecast)
            .where(Forecast.project_id == project_id, Forecast.metric_type == metric_type)
            .order_by(Forecast.forecast_date.asc())
        )
         return forecasts.scalars().all()
