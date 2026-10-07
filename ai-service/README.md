# 晨风精选 · 智能客服（ai-service）

基于 **LangChain / LangGraph / RAG** 的智能客服服务，当前提供 **FAQ 知识库问答** 能力。

## 一、功能简介

当前版本（第一阶段）实现的是 **纯 RAG 知识问答**：

- 用户在客服页提问 → 服务从本地向量库检索相关 FAQ 片段 → 交给 DeepSeek 组织回答。
- 能回答：退换货政策、物流配送、支付方式、发票、订单与账户、优惠券、积分、商品咨询、人工客服时间等。
- 能力范围**完全由知识库 `data/faq.md` 决定**，改知识库即可改变回答内容。

> 订单查询、商品推荐、转人工等属于**第二阶段**（需要工具调用），当前未实现，扩展方式见第八节。

## 二、技术栈与架构

| 层 | 技术 |
|---|---|
| Web 框架 | FastAPI + Uvicorn |
| 编排 | LangGraph（`retrieve → generate`） |
| RAG | LangChain + Chroma 向量库 |
| 向量模型 | 本地 `BAAI/bge-small-zh-v1.5`（DeepSeek 不提供 embedding 接口） |
| 大模型 | DeepSeek `deepseek-chat`（OpenAI 兼容接口） |

```
前端 uniapp  ──POST /api/chat──▶  Node 后端(Koa)  ──POST /chat──▶  ai-service(FastAPI)
                    (3000)              (转发)                          │
                                                                        ▼
                                              LangGraph: retrieve → generate
                                                  │              │
                                             Chroma 向量库     DeepSeek
```

## 三、目录结构

```
ai-service/
├── main.py            # FastAPI 入口：POST /chat、GET /health
├── chain.py           # LangGraph 流程定义（retrieve → generate）
├── rag.py             # 向量模型 + Chroma 检索
├── ingest.py          # 知识库导入脚本
├── prompts.py         # 系统提示词
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
| POST | `/chat` | 智能客服问答，请求体 `{"question": "怎么退货？"}`，返回 `{"answer": "..."}` |
| GET | `/health` | 健康检查 |

对外统一入口是 Node 后端的 `POST /api/chat`（见 `server/service/chat.js`），前端不直接访问本服务。

## 五、环境变量

| 变量 | 说明 | 示例 |
|---|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek 密钥（**必填**） | `sk-xxxxxxxx` |
| `DEEPSEEK_BASE_URL` | DeepSeek 接口地址 | `https://api.deepseek.com` |
| `LLM_MODEL` | 模型名 | `deepseek-chat` |
| `EMBEDDING_MODEL` | 本地向量模型 | `BAAI/bge-small-zh-v1.5` |
| `CHROMA_DIR` | 向量库目录 | `./data/chroma` |
| `PORT` | 服务端口 | `8000` |

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

# 2. 安装依赖（含 torch，体积较大，耐心等待）
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 3. 配置环境变量（复制模板后填入自己的 DeepSeek Key）
copy .env.example .env
# 编辑 .env，把 DEEPSEEK_API_KEY 改成真实值

# 4. 导入知识库生成向量库（首次会下载 bge 模型，约 100MB）
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

用 HBuilderX 打开项目根目录 `cfjx`，运行到浏览器或微信开发者工具。

入口路径：**我的 → 联系客服**（`pages/my/my.vue` → `pages/chat/chat.vue`）。

### 6.4 验证

```bash
# 直接测 AI 服务
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d "{\"question\":\"怎么退货？\"}"

# 测 Node 网关
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{\"question\":\"配送要多久？\"}"
```

---

## 七、Linux 启动（使用 Docker）

生产部署推荐用 Docker，`server/docker-compose.yml` 已包含 `ai-service` 服务，无需单独构建。

### 7.1 前置条件

- 已安装 Docker 与 Docker Compose（v2 用 `docker compose`，老版本用 `docker-compose`）
- 端口 `3000`、`3306`、`6379`、`8000` 未被占用

### 7.2 配置环境变量

Docker 场景下 **不能依赖 `ai-service/.env`**（该文件已被 `.dockerignore` 忽略），密钥通过 compose 注入。

Compose 的文件变量替换读取的是 **`server/` 目录下的 `.env`**，所以在这里追加：

```bash
cd /path/to/cfjx/server
vim .env
```

追加一行：

```env
DEEPSEEK_API_KEY=sk-你的真实密钥
```

> 说明：`ai-service/.env` 只用于**本地直接运行**；Docker 运行时由 `docker-compose.yml` 的 `environment` 注入 `DEEPSEEK_API_KEY`、`EMBEDDING_MODEL` 等。

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

> 该步骤会下载 bge 向量模型（容器内首次执行），耗时取决于网络。

### 7.5 验证与运维

```bash
# 验证 AI 服务
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"question":"怎么退货？"}'

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

## 八、调试指南

### 8.1 分层定位

| 现象 | 先查 |
|---|---|
| 前端提示"服务暂时不可用" | Node 后端日志，再看 AI 服务是否启动 |
| Node 返回 500 | `AI_SERVICE_URL` 是否正确、AI 服务是否可达 |
| AI 服务报错 | AI 服务日志（密钥、向量库、模型下载） |
| 回答不准确/答非所问 | 知识库内容与检索参数 |

### 8.2 常见问题

**1. 启动报错 `No API key provided` / 调用 DeepSeek 返回 401**
本地运行检查 `ai-service/.env` 是否配置了 `DEEPSEEK_API_KEY`；Docker 运行检查 `server/.env` 是否配置。注意 `.env` 必须和进程工作目录匹配。

**2. 首次运行卡在下载模型**
走镜像下载

**3. 后端报 `fetch is not defined`**
Node 版本低于 18。本地升级 Node；Docker 镜像已升级为 `node:18-alpine`。

**4. 回答总是"暂无相关内容"**
向量库没有生成或路径不对。确认已执行 `python ingest.py`，且 `CHROMA_DIR` 指向实际目录。

**5. Docker 里 `exec` 报找不到 `ingest.py`**
确认 `ai-service` 容器正在运行（`docker compose ps`），并在 `server/` 目录下执行命令。

**6. 回答不够精准**
调整 `ingest.py` 的 `chunk_size` / `chunk_overlap`，以及 `rag.retrieve` 的 `k`（默认 4）；同时可把 `data/faq.md` 拆得更细、表述更贴近用户提问方式。

---

## 九、扩展说明

### 9.1 更新知识库

直接编辑 `ai-service/data/faq.md`，然后重新执行 `python ingest.py`（脚本会重建向量库）。

### 9.2 增加订单查询 / 商品推荐 / 转人工

这些属于**工具调用**，不是 RAG。`chain.py` 已预留扩展点：

```
graph.set_entry_point("router")     # 意图路由
graph.add_conditional_edges("router", route_fn, {
    "rag": "retrieve", "tool": "call_tool", "fallback": "generate"
})
```

需要补充：

1. 新建 `tools.py`，实现查单函数（读取 `orders` / `order_shop` / `order_item` 表）。
2. `ChatState` 增加 `user_id`、`intent`、`tool_result` 字段。
3. `main.py` 的 `ChatRequest` 增加 `user_id`。
4. `server/service/chat.js` 挂上 `authMiddleware`，从 `ctx.state.user.userId` 取值转发（**不可信任前端传入的 userId**）。
5. 给 AI 服务增加 MySQL 依赖（如 `pymysql`）与 DB 环境变量。

### 9.3 更换大模型

修改 `.env`（或 compose 环境变量）即可，支持任意 OpenAI 兼容服务：

```env
DEEPSEEK_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat
```

### 9.4 增加流式输出（打字机效果）

- 服务端：`main.py` 改为 `StreamingResponse`（`llm.stream()` 逐块产出 + SSE）。
- Node 端：`chat.js` 透传 SSE 流。
- 前端：H5 用 `fetch` + `ReadableStream`；小程序需改用 WebSocket。

### 9.5 增加多轮对话记忆

在 `ChatState` 中加入 `history`，并引入 LangGraph 的 `MemorySaver`（或把会话存到已有的 Redis）实现上下文记忆。

### 9.6 前端相关

- 客服页：`pages/chat/chat.vue`（图标使用 `uni-icons`）
- 入口：`pages/my/my.vue` 的「联系客服」
- 页面注册：`pages.json`
- 请求封装：`common/js/request.js`（已支持 `loading: false` 关闭全局加载遮罩）
