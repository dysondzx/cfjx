import os
from enum import Enum
from typing import Optional, TypedDict

from dotenv import load_dotenv

load_dotenv()

from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

import rag
import tools
from prompts import SYSTEM_PROMPT, ROUTER_PROMPT


class Intent(str, Enum):
    FAQ = "faq"        # 平台规则/政策，走知识库检索
    ORDER = "order"    # 用户个人订单，走订单查询工具


class RouteDecision(BaseModel):
    """意图分类结果"""
    intent: Intent = Field(description="用户问题的意图类别")


class ChatState(TypedDict):
    question: str
    user_id: Optional[int]   # 由 Node 后端校验 JWT 后传入，非前端提交值
    intent: str
    context: str
    answer: str


# DeepSeek 使用 OpenAI 兼容接口
llm = ChatOpenAI(
    model=os.getenv("LLM_MODEL", "deepseek-chat"),
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    temperature=0.3,
)

# 用于意图分类的结构化输出模型
router_llm = llm.with_structured_output(RouteDecision, method="function_calling")

# 订单类问题的兜底关键词：仅在意图分类调用失败时使用
ORDER_KEYWORDS = ("订单", "物流", "快递", "发货", "买了什么", "购物记录", "退款进度")


def router_node(state: ChatState) -> dict:
    """意图路由节点：判断用户问题该走知识库还是订单查询。"""
    try:
        decision = router_llm.invoke(
            [
                SystemMessage(content=ROUTER_PROMPT),
                HumanMessage(content=state["question"]),
            ]
        )
        return {"intent": decision.intent.value}
    except Exception as error:
        # 分类失败不阻断服务：命中订单关键词则走订单查询，否则兜底到 FAQ
        print(f"意图分类失败，降级处理：{error}")
        question = state["question"]
        if any(word in question for word in ORDER_KEYWORDS):
            return {"intent": Intent.ORDER.value}
        return {"intent": Intent.FAQ.value}


def route_after_router(state: ChatState) -> str:
    """条件路由：订单查询必须具备登录身份。"""
    if state["intent"] == Intent.ORDER.value:
        if not state.get("user_id"):
            return "need_login"
        return "order"
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


def need_login_node(state: ChatState) -> dict:
    """未登录时引导登录，不再调用任何工具。"""
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
    graph.add_node("need_login", need_login_node)
    graph.add_node("generate", generate_node)

    graph.add_edge(START, "router")
    graph.add_conditional_edges(
        "router",
        route_after_router,
        {
            "faq": "retrieve",
            "order": "order",
            "need_login": "need_login",
        },
    )
    graph.add_edge("retrieve", "generate")
    graph.add_edge("order", "generate")
    graph.add_edge("need_login", END)
    graph.add_edge("generate", END)

    return graph.compile()


_graph = build_graph()


def ask(question: str, user_id: Optional[int] = None) -> str:
    """对外统一入口：传入用户问题与用户ID，返回回答文本。"""
    result = _graph.invoke({"question": question, "user_id": user_id})
    return result.get("answer", "抱歉，我暂时无法回答这个问题。")
