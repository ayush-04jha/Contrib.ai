from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from search_agent import search_and_answer
from schemas import ChatRequest, ChatResponse
import os

app = FastAPI()

client_url = os.getenv("CLIENT_URL", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[client_url] if client_url != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
def chat(data: ChatRequest) -> ChatResponse:
   response = search_and_answer(data.querry, data.repo_id)
   return ChatResponse(answer=response.answer)


