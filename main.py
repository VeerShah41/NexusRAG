from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.routes import router

app = FastAPI(
    title="NexusRAG API",
    description="A Retrieval-Augmented Generation (RAG) API for multi-document enterprise search.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Vercel and all domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    origin = request.headers.get("origin")
    if origin:
        print(f"Request from origin: {origin}")
    response = await call_next(request)
    return response

# Register all routes
app.include_router(router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "NexusRAG API is running perfectly!"}

if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
