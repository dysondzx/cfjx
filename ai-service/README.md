# 晨风精选 · 智能客服与 AIGC 素材生成（ai-service）

基于 **LangChain / LangGraph / RAG** 的智能客服服务，提供 **FAQ 知识库问答**、**用户订单查询** 与 **商品营销素材生成（文生图 / 文生视频）** 能力。

## 一、功能简介

服务先用 **意图路由** 判断用户问题类型，再分流到不同的处理链路：

| 能力 | 说明 | 数据来源 |
|---|---|---|
| FAQ 知识库问答 | 退换货政策、物流配送、支付方式、发票、优惠券、积分等 | 本地向量库（`data/faq.md`） |
| 订单查询 | 「我的订单到哪了」「我最近买了什么」等个人订单问题 | MySQL（`orders` / `order_shop` / `order_item`） |
| 素材生成 | 「给这个商品做张海报 / 做条短视频」等营销素材诉求 | 商品表 + 火山方舟 Seedream / Seedance |

要点：

- FAQ 能力范围**完全由知识库 `data/faq.md` 决定**，改知识库即可改变回答内容。
- 订单查询与素材生成**必须登录**：身份由 Node 后端校验 JWT 后传入，未登录会引导先登录，不会查库也不会调用模型。
- 素材生成的商品信息**按 `good_id` 回查数据库**，不采信前端提交的商品描述，避免提示词被构造。
- 商品推荐、转人工暂未实现。

### AIGC 素材生成链路

```
用户问题
  → router（意图分类，aigc）
  → aigc_node
      ├─ tools.query_goods(good_id)        回查商品名称/价格/店铺
      ├─ planner_llm（DeepSeek）            生成营销文案 + 绘图提示词
      ├─ image：ark.generate_image()        Seedream 同步生图
      └─ video：ark.create_video()          Seedance 异步任务，返回任务ID
  → 产物下载转存到 data/outputs，对外返回 /static 相对路径
```

- **为什么要转存**：方舟返回的图片/视频 URL 仅 24 小时有效，视频 URL 还有下载次数限制，直接透传会导致素材库失效。
- **视频为什么异步**：Seedance 是「创建任务 → 轮询状态」模式，前端拿本地任务 ID 轮询 Node 网关，由网关按需回源方舟（懒轮询）。

## 二、技术栈与架构

| 层 | 技术 |
|---|---|
| Web 框架 | FastAPI + Uvicorn |
| 编排 | LangGraph（`router → retrieve / order / aigc → generate`） |
| RAG | LangChain + Chroma 向量库 |
| 向量模型 | 本地 `BAAI/bge-small-zh-v1.5`（DeepSeek 不提供 embedding 接口） |
| 大模型 | DeepSeek（OpenAI 兼容接口，模型名由 `LLM_MODEL` 指定） |
| AIGC | 火山方舟 Seedream 4.0（文生图）、Seedance 1.0 pro（文生视频） |
| HTTP 客户端 | httpx（调用方舟接口与下载产物） |
| 数据库 | MySQL + PyMySQL（订单查询、商品查询使用） |


## 三、目录结构

```
ai-service/
├── main.py            # FastAPI 入口：/chat、/aigc/poster、/aigc/video、/aigc/task、/health
├── chain.py           # LangGraph 流程（意图路由 + 检索/订单/AIGC + 生成）
├── ark.py             # 火山方舟 Seedream / Seedance 调用与产物转存
├── rag.py             # 向量模型 + Chroma 检索
├── tools.py           # 工具集（订单查询、商品查询）
├── db.py              # MySQL 连接
├── ingest.py          # 知识库导入脚本
├── prompts.py         # 系统提示词 + 意图路由 + 素材计划提示词
├── requirements.txt   # Python 依赖
├── .env.example       # 环境变量模板
├── Dockerfile         # 容器构建
└── data/
    ├── faq.md         # 知识库（Markdown）
    ├── outputs/       # AIGC 产物（图片/视频，runtime 生成）
    └── chroma/        # 向量库（ingest 后生成）
```

## 四、接口说明

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/chat` | 智能客服问答。请求体 `{"question": "我的订单到哪了", "user_id": 1, "good_id": 1}`，返回 `{"answer", "intent", "assets"}` |
| POST | `/aigc/poster` | 商品海报同步生成。请求体 `{"good_id": 1, "style": "简约", "scene": "促销"}`，返回 `{"url", "prompt", "caption"}` |
| POST | `/aigc/video` | 创建商品短视频任务。请求体 `{"good_id": 1, "style": "简约", "duration": 5}`，返回 `{"provider_task_id", "prompt", "caption"}` |
| GET | `/aigc/task/{task_id}` | 查询视频任务，`succeeded` 时返回本地 `url` 与 `cover` |
| GET | `/health` | 健康检查，返回 `aigc_enabled` 标识密钥是否配置 |

- `user_id` 可选：FAQ 问答可不传；订单查询、素材生成必传。
- `good_id` 可选：素材生成必传，服务端会按 ID 回查商品信息。
- `assets` 元素结构：图片 `{"type": "image", "status": "succeeded", "url": "/static/..."}`；视频 `{"type": "video", "status": "pending", "provider_task_id": "cgt-..."}`。
- **安全约定**：`user_id` 只能由 Node 后端从 JWT 解析后传入，绝不接受前端直接提交的值；工具层所有 SQL 均以该值做数据隔离。
- 对外统一入口是 Node 后端的 `POST /api/chat` 与 `/api/aigc/*`（见 `server/service/chat.js`、`server/service/aigc.js`），前端不直接访问本服务。

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
| `ARK_API_KEY` | 火山方舟密钥（AIGC **必填**） | `xxxxxxxx-xxxx` |
| `ARK_BASE_URL` | 方舟接口地址 | `https://ark.cn-beijing.volces.com/api/v3` |
| `ARK_IMAGE_MODEL` | 生图模型 | `doubao-seedream-4-0-250828` |
| `ARK_VIDEO_MODEL` | 生视频模型 | `doubao-seedance-1-0-pro-250528` |
| `AIGC_OUTPUT_DIR` | 产物落盘目录 | `./data/outputs` |
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
#   - ARK_API_KEY（不配置则仅 AIGC 功能不可用，客服问答仍正常）
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

入口路径：
- 智能客服：**我的 → 联系客服**
- AIGC 素材：**商品详情 → AI 营销素材**（弹窗选择海报或短视频），生成结果可在 **我的 → AI 创作中心** 查看
- 素材库：**我的 → AI 创作中心**

> 素材生成需要登录；每日配额由 Node 网关的 `AIGC_IMAGE_QUOTA` / `AIGC_VIDEO_QUOTA` 控制。

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

> 说明：`ai-service/.env` 只用于**本地直接运行**；Docker 运行时由 `docker-compose.yml` 的 `environment` 注入 `DEEPSEEK_API_KEY`、`ARK_API_KEY`、`ARK_*`、`DB_*`、`EMBEDDING_MODEL` 等。其中数据库地址在容器内是 `DB_HOST=mysql`，并已声明 `depends_on: mysql`。

`server/.env` 需要补充的变量：

```bash
# 火山方舟 AIGC
ARK_API_KEY=你的方舟key
ARK_IMAGE_MODEL=doubao-seedream-4-0-250828
ARK_VIDEO_MODEL=doubao-seedance-1-0-pro-250528

# 每日生成配额（0 表示不限制）
AIGC_IMAGE_QUOTA=5
AIGC_VIDEO_QUOTA=1
```

> 已有的 `mysql_data` 数据卷不会重新执行 `sql.txt`，升级后需要手动创建 `aigc_task` 表：
> 进入容器执行 `server/sql.txt` 末尾的 `aigc_task` 建表语句即可（不要整份重跑，否则示例数据会重复插入）。

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

# 验证 AIGC 生图（需要 ARK_API_KEY）
POST 请求 http://localhost:8000/aigc/poster '{"good_id":1,"style":"简约","scene":"促销"}'

# 验证视频任务（返回 provider_task_id 后轮询）
POST 请求 http://localhost:8000/aigc/video '{"good_id":1,"duration":5}'
GET  请求 http://localhost:8000/aigc/task/{provider_task_id}

# 验证健康检查与密钥状态
GET  请求 http://localhost:8000/health

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
