"""MySQL 连接工具（供订单查询等工具使用）。

连接参数与 Node 后端保持一致（DB_HOST / DB_USER / DB_PASSWORD / DB_NAME），
便于本地与 Docker 环境复用同一套环境变量。
"""

import os

from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """创建 MySQL 连接。客服查询频率较低，按需建立连接即可。

    说明：pymysql 采用延迟导入——即使忘记安装该依赖，
    也只是订单查询不可用，不会导致 FAQ 问答等其它功能无法启动。
    """
    import pymysql

    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "cfjx_db"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )
