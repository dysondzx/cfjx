import os
from enum import Enum
from typing import Optional, TypedDict

from dotenv import load_dotenv

load_dotenv()

from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

import ark
import rag
import tools
from prompts import SYSTEM_PROMPT, ROUTER_PROMPT, AIGC_PLAN_PROMPT


class Intent(str, Enum):
    FAQ = "faq"        # 平台规则/政策，走知识库检索
    ORDER = "order"    # 用户个人订单，走订单查询工具
    AIGC = "aigc"      # 生成商品营销素材，走 AIGC 工具


class RouteDecision(BaseModel):
    """意图分类结果"""
    intent: Intent = Field(description="用户问题的意图类别")


class MaterialPlan(BaseModel):
    """素材生成计划：由大模型完成文案与提示词的二次创作"""
    kind: str = Field(description="素材类型：image（图片）或 video（视频）")
    caption: str = Field(description="回复用户的一句话，40字以内")
    prompt: str = Field(description="用于文生图/文生视频的中文提示词，200字以内")


class ChatState(TypedDict):
    question: str
    user_id: Optional[int]   # 由 Node 后端校验 JWT 后传入，非前端提交值
    good_id: Optional[int]   # 商品ID，同样由 Node 后端校验后传入
    intent: str
    context: str
    answer: str
    assets: list             # 素材结果（图片/视频）


# DeepSeek 使用 OpenAI 兼容接口
llm = ChatOpenAI(
    model=os.getenv("LLM_MODEL", "deepseek-chat"),
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    temperature=0.3,
    extra_body={"thinking": {"type": "disabled"}}
)

# 用于意图分类的结构化输出模型
router_llm = llm.with_structured_output(RouteDecision, method="function_calling")

# 用于生成素材计划的模型：需要一点创意，温度略高
planner_llm = ChatOpenAI(
    model=os.getenv("LLM_MODEL", "deepseek-chat"),
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    temperature=0.7,
    extra_body={"thinking": {"type": "disabled"}}
).with_structured_output(MaterialPlan, method="function_calling")

# 兜底关键词：仅在意图分类调用失败时使用
ORDER_KEYWORDS = ("订单", "物流", "快递", "发货", "买了什么", "购物记录", "退款进度")
AIGC_KEYWORDS = ("生成", "海报", "做图", "画一张", "主图", "短视频", "视频", "素材")


def router_node(state: ChatState) -> dict:
    """意图路由节点：判断用户问题该走知识库、订单查询还是素材生成。"""
    try:
        decision = router_llm.invoke(
            [
                SystemMessage(content=ROUTER_PROMPT),
                HumanMessage(content=state["question"]),
            ]
        )
        return {"intent": decision.intent.value}
    except Exception as error:
        # 分类失败不阻断服务：先看是否命中 AIGC / 订单关键词，否则兜底到 FAQ
        print(f"意图分类失败，降级处理：{error}")
        question = state["question"]
        if any(word in question for word in AIGC_KEYWORDS):
            return {"intent": Intent.AIGC.value}
        if any(word in question for word in ORDER_KEYWORDS):
            return {"intent": Intent.ORDER.value}
        return {"intent": Intent.FAQ.value}


def route_after_router(state: ChatState) -> str:
    """条件路由：订单查询与素材生成都必须具备登录身份。"""
    if state["intent"] == Intent.ORDER.value:
        if not state.get("user_id"):
            return "need_login"
        return "order"

    if state["intent"] == Intent.AIGC.value:
        if not state.get("user_id"):
            return "need_login"
        return "aigc"

    return "faq"


def retrieve_node(state: ChatState) -> dict:
    """RAG 检索节点：根据用户问题召回知识片段。"""
    return {"context": rag.retrieve(state["question"])}


def order_node(state: ChatState) -> dict:
    """订单查询节点：只查当前用户自己的订单。"""
    try:
        summary = tools.query_user_orders(state["user_id"])
    except Exception as error:
        # 数据库异常不应让整个客服服务崩掉，降级为友好提示
        print(f"订单查询失败：{error}")
        summary = "订单数据暂时无法查询，请稍后再试。"
    return {"context": summary}


def _fallback_plan(goods: dict, request_text: str) -> MaterialPlan:
    """大模型调用失败时的兜底计划，保证 AIGC 链路不中断。"""
    is_video = "视频" in request_text or "短视频" in request_text
    return MaterialPlan(
        kind="video" if is_video else "image",
        caption="正在按简约电商风格为您生成素材～",
        prompt=(
            f"电商广告级商品视觉，主体为{goods['name']}，"
            "简约干净的浅色背景，柔和光影，主体居中，留有文字排版空间，"
            "高清商业摄影质感"
            + ("，镜头缓慢推近，画面稳定" if is_video else "")
        ),
    )


def _plan_material(goods: dict, request_text: str) -> MaterialPlan:
    """让大模型把商品信息改写成营销文案 + 绘图提示词。"""
    try:
        return planner_llm.invoke(
            [
                SystemMessage(
                    content=AIGC_PLAN_PROMPT.format(
                        name=goods["name"],
                        price=goods["cprice"],
                        oprice=goods["oprice"],
                        shop=goods.get("shopName", ""),
                    )
                ),
                HumanMessage(content=request_text),
            ]
        )
    except Exception as error:
        print(f"素材计划生成失败，使用兜底提示词：{error}")
        return _fallback_plan(goods, request_text)


def aigc_node(state: ChatState) -> dict:
    """素材生成节点：商品信息回库查询 → LLM 改写提示词 → 调用文生图/文生视频。"""
    if not state.get("good_id"):
        return {
            "answer": "我可以帮您生成商品海报或短视频～请从商品详情页的「AI 生成素材」进入，"
                      "这样我才能看到是哪件商品哦。",
            "assets": [],
        }

    if not ark.is_enabled():
        return {"answer": "AI 素材生成功能还在配置中，请稍后再试～", "assets": []}

    try:
        goods = tools.query_goods(state["good_id"])
    except Exception as error:
        print(f"商品查询失败：{error}")
        return {"answer": "没能找到这件商品，请从商品详情页重新进入～", "assets": []}

    try:
        plan = _plan_material(goods, state["question"])
        kind = (plan.kind or "image").strip().lower()
        if "video" in kind or "视频" in kind:
            task_id = ark.create_video(plan.prompt)
            asset = {
                "type": "video",
                "status": "pending",
                "provider_task_id": task_id,
                "prompt": plan.prompt,
            }
        else:
            image = ark.generate_image(plan.prompt)
            asset = {
                "type": "image",
                "status": "succeeded",
                "url": image["url"],
                "prompt": plan.prompt,
            }
        return {"answer": plan.caption, "assets": [asset]}
    except Exception as error:
        print(f"素材生成失败：{error}")
        return {"answer": "素材生成暂时不可用，请稍后再试，先看看商品详情吧～", "assets": []}


def need_login_node(state: ChatState) -> dict:
    """未登录时引导登录，不再调用任何工具。"""
    if state["intent"] == Intent.AIGC.value:
        return {"answer": "生成营销素材需要先登录哦～登录后我再帮您做海报和短视频。"}
    return {"answer": "查询订单需要先登录哦～请先登录后再来问我。"}


def generate_node(state: ChatState) -> dict:
    """生成节点：结合上下文（知识片段 / 订单数据）组织回答。"""
    messages = [
        SystemMessage(content=SYSTEM_PROMPT.format(context=state["context"])),
        HumanMessage(content=state["question"]),
    ]
    resp = llm.invoke(messages)
    return {"answer": resp.content}


def build_graph():

    graph = StateGraph(ChatState)
    graph.add_node("router", router_node)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("order", order_node)
    graph.add_node("aigc", aigc_node)
    graph.add_node("need_login", need_login_node)
    graph.add_node("generate", generate_node)

    graph.add_edge(START, "router")
    graph.add_conditional_edges(
        "router",
        route_after_router,
        {
            "faq": "retrieve",
            "order": "order",
            "aigc": "aigc",
            "need_login": "need_login",
        },
    )
    graph.add_edge("retrieve", "generate")
    graph.add_edge("order", "generate")
    graph.add_edge("aigc", END)
    graph.add_edge("need_login", END)
    graph.add_edge("generate", END)

    return graph.compile()


_graph = build_graph()


def ask(
    question: str,
    user_id: Optional[int] = None,
    good_id: Optional[int] = None,
) -> dict:
    """对外统一入口：返回 {answer, intent, assets}。

    assets 仅在 AIGC 分支有值，元素结构：
      - 图片：{"type": "image", "status": "succeeded", "url": "/static/...", "prompt": "..."}
      - 视频：{"type": "video", "status": "pending", "provider_task_id": "cgt-...", "prompt": "..."}
    """
    result = _graph.invoke(
        {"question": question, "user_id": user_id, "good_id": good_id}
    )
    return {
        "answer": result.get("answer") or "抱歉，我暂时无法回答这个问题。",
        "intent": result.get("intent", Intent.FAQ.value),
        "assets": result.get("assets", []),
    }


def generate_poster(good_id: int, style: str = "简约", scene: str = "促销") -> dict:
    """独立生图入口（供 Node 的 /api/aigc/poster 使用），返回 {url, prompt, caption}。"""
    goods = tools.query_goods(good_id)
    request_text = f"为这件商品生成一张{style}风格的{scene}海报"
    plan = _plan_material(goods, request_text)
    image = ark.generate_image(plan.prompt)
    return {"url": image["url"], "prompt": plan.prompt, "caption": plan.caption}


def generate_video_task(good_id: int, style: str = "简约", duration: int = 5) -> dict:
    """独立视频任务入口（供 Node 的 /api/aigc/video 使用）。

    返回 {provider_task_id, prompt, caption}。
    """
    goods = tools.query_goods(good_id)
    request_text = f"为这件商品生成一条{style}风格的种草短视频"
    plan = _plan_material(goods, request_text)
    task_id = ark.create_video(plan.prompt, duration=duration)
    return {"provider_task_id": task_id, "prompt": plan.prompt, "caption": plan.caption}
