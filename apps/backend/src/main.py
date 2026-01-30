from fastapi import FastAPI

app = FastAPI(title="PolkaAudit Backend")

@app.get("/")
async def root():
    return {"message": "Welcome to PolkaAudit Backend"}

@app.get("/health")
async def health():
    return {"status": "ok"}
