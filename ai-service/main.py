import os
import pathlib
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import ark
import chain

app = FastAPI(title="晨风精选 - 智能客服与 AIGC 素材生成", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 生成产物统一落在 data/outputs，通过 /static 对外提供（Node 网关再做一次反代）
OUTPUT_DIR = pathlib.Path(os.getenv("AIGC_OUTPUT_DIR", "./data/outputs"))
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(OUTPUT_DIR)), name="static")


class Asset(BaseModel):
    type: str
    status: str
    url: Optional[str] = None
    cover: Optional[str] = None
    provider_task_id: Optional[str] = None
    prompt: Optional[str] = None


class ChatRequest(BaseModel):
    question: str
    # 由 Node 后端校验 JWT 后传入；FAQ 问答可为空，订单查询与素材生成必填
    user_id: Optional[int] = None
    # 商品ID，同样由 Node 后端校验后传入，用于素材生成的商品上下文
    good_id: Optional[int] = None


class ChatResponse(BaseModel):
    answer: str
    intent: str = "faq"
    assets: List[Asset] = Field(default_factory=list)


class PosterRequest(BaseModel):
    good_id: int
    style: str = "简约"
    scene: str = "促销"
    user_id: Optional[int] = None


class VideoRequest(BaseModel):
    good_id: int
    style: str = "简约"
    duration: int = 5
    user_id: Optional[int] = None


class MaterialResponse(BaseModel):
    url: Optional[str] = None
    prompt: Optional[str] = None
    caption: Optional[str] = None
    provider_task_id: Optional[str] = None


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """智能客服问答接口（整段返回），AIGC 意图会附带素材结果。"""
    result = chain.ask(req.question, req.user_id, req.good_id)
    return ChatResponse(
        answer=result["answer"],
        intent=result["intent"],
        assets=[Asset(**item) for item in result.get("assets", [])],
    )


@app.post("/aigc/poster", response_model=MaterialResponse)
def aigc_poster(req: PosterRequest):
    """商品海报生成（同步）：详情页与素材库重生成入口。"""
    try:
        result = chain.generate_poster(req.good_id, req.style, req.scene)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except ark.ArkError as error:
        raise HTTPException(status_code=502, detail=str(error))
    return MaterialResponse(**result)


@app.post("/aigc/video", response_model=MaterialResponse)
def aigc_video(req: VideoRequest):
    """商品短视频生成（异步建任务）：返回方舟任务ID，由 Node 轮询。"""
    try:
        result = chain.generate_video_task(req.good_id, req.style, req.duration)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except ark.ArkError as error:
        raise HTTPException(status_code=502, detail=str(error))
    return MaterialResponse(**result)


@app.get("/aigc/task/{task_id}")
def aigc_task(task_id: str):
    """查询视频任务状态，成功时会自动把视频转存到本地。"""
    try:
        return ark.query_video(task_id)
    except ark.ArkError as error:
        raise HTTPException(status_code=502, detail=str(error))


@app.get("/health")
def health():
    return {"status": "ok", "aigc_enabled": ark.is_enabled()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
