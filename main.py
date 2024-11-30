from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from src.search_orchestrator import SearchOrchestrator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check for required environment variables
if not os.getenv('GROQ_API_KEY'):
    raise ValueError("GROQ_API_KEY is not set in .env file")

app = FastAPI(title="DocsGPT API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize search orchestrator
search_orchestrator = SearchOrchestrator()

class SearchRequest(BaseModel):
    query: str

@app.post("/api/search")
async def search(request: SearchRequest):
    """
    Search endpoint that processes queries and returns relevant documentation
    """
    try:
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        # Perform search
        results = await search_orchestrator.search(request.query)
        
        if not results:
            return {
                "results": [{
                    "title": "No Results",
                    "explanation": "No relevant documentation found. Try being more specific or rephrasing your query.",
                    "sources": []
                }]
            }
        
        return {"results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}
