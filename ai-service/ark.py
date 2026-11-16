"""火山方舟（Ark）AIGC 能力封装：文生图（Seedream）+ 文生视频（Seedance）。

设计要点：
1. httpx 采用延迟导入，未安装依赖时只影响 AIGC 功能，不影响客服问答主链路。
2. 方舟返回的产物 URL 仅 24 小时有效，视频 URL 还有下载次数限制，
   因此这里统一下载转存到本地 data/outputs，对外只暴露 /static 下的相对路径。
3. 视频是异步任务：create_video 拿任务ID，query_video 轮询并转存。
"""

import datetime
import os
import pathlib
import uuid
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

ARK_BASE_URL = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
ARK_IMAGE_MODEL = os.getenv("ARK_IMAGE_MODEL", "doubao-seedream-4-0-250828")
ARK_VIDEO_MODEL = os.getenv("ARK_VIDEO_MODEL", "doubao-seedance-1-0-pro-250528")
OUTPUT_DIR = pathlib.Path(os.getenv("AIGC_OUTPUT_DIR", "./data/outputs"))

# 单次请求超时：生图较慢，给到 3 分钟
IMAGE_TIMEOUT = 180
TASK_TIMEOUT = 60
DOWNLOAD_TIMEOUT = 300


class ArkError(RuntimeError):
    """AIGC 调用异常，交由上层降级为友好提示。"""


def is_enabled() -> bool:
    """未配置密钥时上层应直接返回提示，避免无谓的网络请求。"""
    return bool(os.getenv("ARK_API_KEY"))


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {os.getenv('ARK_API_KEY', '')}",
        "Content-Type": "application/json",
    }


def _post(path: str, payload: dict, timeout: int):
    import httpx

    with httpx.Client(timeout=timeout) as client:
        resp = client.post(f"{ARK_BASE_URL}{path}", headers=_headers(), json=payload)
    try:
        data = resp.json()
    except Exception as error:
        raise ArkError(f"方舟返回非 JSON 响应：{error}") from error
    if resp.status_code != 200:
        detail = data.get("error") or data
        raise ArkError(f"方舟接口异常（{resp.status_code}）：{detail}")
    return data


def _get(path: str, timeout: int = TASK_TIMEOUT):
    import httpx

    with httpx.Client(timeout=timeout) as client:
        resp = client.get(f"{ARK_BASE_URL}{path}", headers=_headers())
    data = resp.json()
    if resp.status_code != 200:
        raise ArkError(f"方舟查询异常（{resp.status_code}）：{data.get('error') or data}")
    return data


def _save(remote_url: Optional[str], suffix: str) -> str:
    """下载产物到本地，返回 /static/... 相对路径。"""
    if not remote_url:
        return ""

    import httpx

    day = datetime.date.today().strftime("%Y%m%d")
    rel_dir = f"aigc/{day}"
    (OUTPUT_DIR / rel_dir).mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{suffix}"

    with httpx.stream("GET", remote_url, timeout=DOWNLOAD_TIMEOUT) as resp:
        resp.raise_for_status()
        with open(OUTPUT_DIR / rel_dir / filename, "wb") as file:
            for chunk in resp.iter_bytes(64 * 1024):
                file.write(chunk)

    return f"/static/{rel_dir}/{filename}"


def generate_image(prompt: str, size: str = "2K") -> dict:
    """文生图（同步）。返回 {url, size}，url 为本地相对路径。"""
    if not is_enabled():
        raise ArkError("未配置 ARK_API_KEY，AIGC 功能不可用")

    data = _post(
        "/images/generations",
        {
            "model": ARK_IMAGE_MODEL,
            "prompt": prompt[:600],
            "size": size,
            "response_format": "url",
            "watermark": False,
            # Seedream 4.0 支持组图，营销素材只需要单张
            "sequential_image_generation": "disabled",
        },
        timeout=IMAGE_TIMEOUT,
    )

    items = data.get("data") or []
    if not items or not items[0].get("url"):
        raise ArkError(f"生图未返回结果：{data.get('error') or data}")

    item = items[0]
    return {"url": _save(item["url"], ".jpeg"), "size": item.get("size", "")}


def create_video(
    prompt: str,
    duration: int = 5,
    ratio: str = "9:16",
    resolution: str = "720p",
) -> str:
    """创建文生视频任务，返回方舟任务 ID。"""
    if not is_enabled():
        raise ArkError("未配置 ARK_API_KEY，AIGC 功能不可用")

    data = _post(
        "/contents/generations/tasks",
        {
            "model": ARK_VIDEO_MODEL,
            "content": [{"type": "text", "text": prompt[:500]}],
            "resolution": resolution,
            "ratio": ratio,
            # Seedance 1.0 pro 取值区间 [2, 12]，-1 会让模型自选时长、成本不可控
            "duration": max(2, min(int(duration), 12)),
            "watermark": False,
            "camera_fixed": False,
        },
        timeout=TASK_TIMEOUT,
    )

    task_id = data.get("id")
    if not task_id:
        raise ArkError(f"创建视频任务未返回 id：{data.get('error') or data}")
    return task_id


def query_video(task_id: str) -> dict:
    """查询视频任务状态。

    返回：
      - {"status": "pending"}
      - {"status": "succeeded", "url": 本地视频路径, "cover": 本地封面路径}
      - {"status": "failed", "error": 错误信息}
    """
    if not is_enabled():
        raise ArkError("未配置 ARK_API_KEY，AIGC 功能不可用")

    data = _get(f"/contents/generations/tasks/{task_id}")
    status = data.get("status")

    if status == "succeeded":
        content = data.get("content") or {}
        url = _save(content.get("video_url"), ".mp4")
        try:
            cover = _save(content.get("last_frame_url"), ".jpeg")
        except Exception as error:
            # 封面只是锦上添花，失败不影响视频播放
            print(f"视频封面下载失败：{error}")
            cover = ""
        return {"status": "succeeded", "url": url, "cover": cover}

    if status in ("failed", "cancelled", "expired"):
        error = data.get("error") or {}
        return {
            "status": "failed",
            "error": error.get("message") or f"视频任务状态：{status}",
        }

    return {"status": "pending"}
