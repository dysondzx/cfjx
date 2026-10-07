"""知识库导入脚本。

用法：
    python ingest.py

作用：读取 data/faq.md，切分后向量化写入 Chroma 向量库。
后续知识库有更新时，重新执行本脚本即可（会重建向量库目录）。
"""

import os
import shutil

from dotenv import load_dotenv

load_dotenv()

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

import rag

FAQ_PATH = "./data/faq.md"


def ingest(md_path: str = FAQ_PATH):
    chroma_dir = os.getenv("CHROMA_DIR", "./data/chroma")

    # 重建向量库，避免旧数据残留
    if os.path.exists(chroma_dir):
        shutil.rmtree(chroma_dir)

    with open(md_path, encoding="utf-8") as f:
        text = f.read()
    docs = [Document(page_content=text, metadata={"source": md_path})]

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n## ", "\n### ", "\n\n", "\n", "。", "！", "？", "；", "，", " ", ""],
    )
    chunks = splitter.split_documents(docs)

    Chroma.from_documents(
        chunks,
        embedding=rag.get_embeddings(),
        persist_directory=chroma_dir,
    )
    print(f"知识库导入完成，共 {len(chunks)} 个片段 -> {chroma_dir}")


if __name__ == "__main__":
    ingest()
