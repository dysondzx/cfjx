import os
from typing import TypedDict

from dotenv import load_dotenv

load_dotenv()

from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

import rag
from prompts import SYSTEM_PROMPT


class ChatState(TypedDict):
    question: str
    context: str
    answer: str


# DeepSeek 使用 OpenAI 兼容接口
llm = ChatOpenAI(
    model=os.getenv("LLM_MODEL", "deepseek-flash"),
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    temperature=0.3,
)


def retrieve_node(state: ChatState) -> dict:
    """RAG 检索节点：根据用户问题召回知识片段。"""
    return {"context": rag.retrieve(state["question"])}


def generate_node(state: ChatState) -> dict:
    """生成节点：结合检索结果让大模型组织回答。"""
    messages = [
        SystemMessage(content=SYSTEM_PROMPT.format(context=state["context"])),
        HumanMessage(content=state["question"]),
    ]
    resp = llm.invoke(messages)
    return {"answer": resp.content}


def build_graph():
    """构建 LangGraph 流程：retrieve -> generate。

    后续扩展「订单查询 / 商品推荐 / 转人工」时，只需在入口前增加
    router 节点并分流出 tool 节点即可，无需推翻现有结构。
    """
    graph = StateGraph(ChatState)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("generate", generate_node)

    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    return graph.compile()


_graph = build_graph()


def ask(question: str) -> str:
    """对外统一入口：传入用户问题，返回回答文本。"""
    result = _graph.invoke({"question": question})
    return result.get("answer", "抱歉，我暂时无法回答这个问题。")
