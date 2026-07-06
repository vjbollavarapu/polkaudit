# PolkAudit Indexer — Cloud Run (min-instances worker + /health on PORT)
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -c "from substrateinterface import SubstrateInterface; assert hasattr(SubstrateInterface, 'decode_scale')"

COPY src ./src

# Cloud Run requires the container to listen on $PORT
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:' + __import__('os').environ.get('PORT','8080') + '/health')" || exit 1

CMD ["python", "-m", "src.main"]
