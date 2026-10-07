import os

from dotenv import load_dotenv

load_dotenv()

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

_embeddings = None


def get_embeddings():
    """懒加载本地向量模型（bge 中文模型），避免服务启动即下载模型。"""
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name=os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-zh-v1.5"),
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
    return _embeddings


def load_vectorstore():
    """加载本地 Chroma 向量库。"""
    return Chroma(
        persist_directory=os.getenv("CHROMA_DIR", "./data/chroma"),
        embedding_function=get_embeddings(),
    )


def retrieve(query: str, k: int = 4) -> str:
    """检索与问题最相关的知识片段，拼接为上下文字符串。"""
    db = load_vectorstore()
    docs = db.similarity_search(query, k=k)
    if not docs:
        return "（暂无相关内容）"
    return "\n\n".join(doc.page_content for doc in docs)
