import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import chain

app = FastAPI(title="晨风精选 - 智能客服", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    # 由 Node 后端校验 JWT 后传入；FAQ 问答可为空，订单查询必填
    user_id: Optional[int] = None


class ChatResponse(BaseModel):
    answer: str


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """智能客服问答接口（整段返回）。"""
    answer = chain.ask(req.question, req.user_id)
    return ChatResponse(answer=answer)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
