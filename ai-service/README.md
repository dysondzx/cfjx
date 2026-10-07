# 晨风精选 · 智能客服（ai-service）

基于 **LangChain / LangGraph / RAG** 的智能客服服务，提供 **FAQ 知识库问答** 与 **用户订单查询** 能力。

## 一、功能简介

服务先用 **意图路由** 判断用户问题类型，再分流到不同的处理链路：

| 能力 | 说明 | 数据来源 |
|---|---|---|
| FAQ 知识库问答 | 退换货政策、物流配送、支付方式、发票、优惠券、积分等 | 本地向量库（`data/faq.md`） |
| 订单查询 | 「我的订单到哪了」「我最近买了什么」等个人订单问题 | MySQL（`orders` / `order_shop` / `order_item`） |

要点：

- FAQ 能力范围**完全由知识库 `data/faq.md` 决定**，改知识库即可改变回答内容。
- 订单查询**必须登录**：身份由 Node 后端校验 JWT 后传入，未登录会引导先登录，不会查库。
- 商品推荐、转人工暂未实现。

## 二、技术栈与架构

| 层 | 技术 |
|---|---|
| Web 框架 | FastAPI + Uvicorn |
| 编排 | LangGraph（`router → retrieve / order → generate`） |
| RAG | LangChain + Chroma 向量库 |
| 向量模型 | 本地 `BAAI/bge-small-zh-v1.5`（DeepSeek 不提供 embedding 接口） |
| 大模型 | DeepSeek（OpenAI 兼容接口，模型名由 `LLM_MODEL` 指定） |
| 数据库 | MySQL + PyMySQL（仅订单查询使用） |


## 三、目录结构

```
ai-service/
├── main.py            # FastAPI 入口：POST /chat、GET /health
├── chain.py           # LangGraph 流程（意图路由 + 检索/订单 + 生成）
├── rag.py             # 向量模型 + Chroma 检索
├── tools.py           # 工具集（订单查询）
├── db.py              # MySQL 连接
├── ingest.py          # 知识库导入脚本
├── prompts.py         # 系统提示词 + 意图路由提示词
├── requirements.txt   # Python 依赖
├── .env.example       # 环境变量模板
├── Dockerfile         # 容器构建
└── data/
    ├── faq.md         # 知识库（Markdown）
    └── chroma/        # 向量库（ingest 后生成）
```

## 四、接口说明

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/chat` | 智能客服问答。请求体 `{"question": "我的订单到哪了", "user_id": 1}`，返回 `{"answer": "..."}` |
| GET | `/health` | 健康检查 |

- `user_id` 可选：FAQ 问答可不传；订单查询必传。
- **安全约定**：`user_id` 只能由 Node 后端从 JWT 解析后传入，绝不接受前端直接提交的值；工具层所有 SQL 均以该值做数据隔离。
- 对外统一入口是 Node 后端的 `POST /api/chat`（见 `server/service/chat.js`），前端不直接访问本服务。

## 五、环境变量

| 变量 | 说明 | 示例 |
|---|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek 密钥（**必填**） | `sk-xxxxxxxx` |
| `DEEPSEEK_BASE_URL` | DeepSeek 接口地址 | `https://api.deepseek.com` |
| `LLM_MODEL` | 模型名（按实际使用的填写） | `deepseek-chat` |
| `EMBEDDING_MODEL` | 本地向量模型 | `BAAI/bge-small-zh-v1.5` |
| `CHROMA_DIR` | 向量库目录 | `./data/chroma` |
| `DB_HOST` | MySQL 地址（订单查询用） | `localhost` |
| `DB_PORT` | MySQL 端口 | `3306` |
| `DB_USER` | MySQL 用户名 | `root` |
| `DB_PASSWORD` | MySQL 密码 | `123456` |
| `DB_NAME` | 数据库名 | `cfjx_db` |
| `PORT` | 服务端口 | `8000` |

> `DB_*` 与 Node 后端保持同一套命名，便于本地与 Docker 复用。

---

## 六、本地启动（不使用 Docker）

本地启动需要分别拉起三个部分：**AI 服务 → Node 后端 → 前端**。

### 6.1 启动 AI 服务（Python）

前置：Python 3.10+。

```bash
cd d:\h5workspace\cfjx\ai-service

# 1. 创建并激活虚拟环境
python -m venv venv
venv\Scripts\activate

# 2. 安装依赖
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 3. 配置环境变量
copy .env.example .env
# 编辑 .env：
#   - DEEPSEEK_API_KEY
#   - DB_HOST / DB_USER / DB_PASSWORD / DB_NAME

# 4. 导入知识库生成向量库（首次会下载 bge 模型）
python ingest.py

# 5. 启动服务
python main.py
```

启动成功后监听 `http://localhost:8000`。

> Linux / macOS 本地启动把 `venv\Scripts\activate` 换成 `source venv/bin/activate`，`copy` 换成 `cp` 即可。

### 6.2 启动后端（Node）

前置：Node 18+（`chat.js` 依赖全局 `fetch`）。

```bash
cd d:\h5workspace\cfjx\server

# 1. 安装依赖
npm install

# 2. 确认 .env 中有 AI 服务地址（默认已配）
# AI_SERVICE_URL=http://localhost:8000

# 3. 启动
npm run dev
```

后端监听 `http://localhost:3000`。

### 6.3 启动前端（uniapp）

用 HBuilderX 打开 **`frontend`** 目录，运行到浏览器、手机端或微信开发者工具。

入口路径：**我的 → 联系客服**。

---

## 七、Linux 启动（使用 Docker）

### 7.1 前置条件

- 已安装 Docker 与 Docker Compose
- 端口 `3000`、`3306`、`6379`、`8000` 未被占用

### 7.2 配置环境变量

Docker 场景下 **不能依赖 `ai-service/.env`**（该文件已被 `.dockerignore` 忽略），变量通过 compose 注入。

Compose 的文件变量替换读取的是 **`server/` 目录下的 `.env`**，所以在这里追加：

```bash
cd /path/to/cfjx/server
vim .env
```

> 说明：`ai-service/.env` 只用于**本地直接运行**；Docker 运行时由 `docker-compose.yml` 的 `environment` 注入 `DEEPSEEK_API_KEY`、`DB_*`、`EMBEDDING_MODEL` 等。其中数据库地址在容器内是 `DB_HOST=mysql`，并已声明 `depends_on: mysql`。

### 7.3 构建并启动

```bash
cd /path/to/cfjx/server

# 构建并后台启动全部服务（backend / mysql / redis / ai-service）
docker compose up -d --build

# 查看状态
docker compose ps
```

### 7.4 首次导入知识库

镜像不会自动导入知识库，需要在容器内执行一次（向量库会持久化到宿主机的 `ai-service/data/chroma`）：

```bash
docker compose exec ai-service python ingest.py
```

### 7.5 验证与运维

```bash
# 验证 AI 服务（FAQ）
POST 请求 http://localhost:8000/chat '{"question":"怎么退货？"}'

# 验证订单查询
POST 请求 http://localhost:8000/chat '{"question":"我的订单到哪了","user_id":1}'

# 查看日志
docker compose logs -f ai-service
docker compose logs -f backend

# 重启单个服务
docker compose restart ai-service

# 停止
docker compose down
```

### 7.6 更新知识库（Docker）

```bash
# 1. 修改宿主机上的 ai-service/data/faq.md
# 2. 重新导入
docker compose exec ai-service python ingest.py
```

---
