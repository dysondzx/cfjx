# 后端系统 Docker 部署指南

## 📋 项目概述

这是一个基于 Node.js + Koa 的后端系统，已配置 Docker 支持，可以快速部署到任何支持 Docker 的环境。

## 🚀 快速开始

### 前提条件
- 已安装 Docker 和 Docker Compose
- 确保端口 3000、3306、6379 未被占用

### 1. 构建并启动所有服务
```bash
# 在 server 目录下执行
docker-compose up -d
```

### 2. 查看服务状态
```bash
docker-compose ps
```

### 3. 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f redis
```

### 4. 停止服务
```bash
docker-compose down
```

## 🔧 环境配置

### 生产环境变量配置

创建 `.env.prod` 文件（已存在，但需要根据实际情况修改）：

```env
# 应用配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=secure_password
DB_NAME=cfjx_db

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
```

### 或者通过环境变量覆盖（推荐）

```bash
# 启动时设置环境变量
docker-compose run -e DB_PASSWORD=password backend
```

## 📁 文件说明

### Dockerfile
- 基于 Node.js 16 Alpine 镜像
- 多阶段构建优化
- 生产环境配置

### docker-compose.yml
包含三个服务：
- **backend**: 应用服务（端口 3000）
- **mysql**: 数据库服务（端口 3306）
- **redis**: 缓存服务（端口 6379）

### .dockerignore
忽略不必要的文件，减小镜像体积

## 🔍 服务访问

### 后端 API
- URL: http://localhost:3000
- 健康检查: http://localhost:3000/api/health

### MySQL 数据库
- 主机: localhost
- 端口: 3306
- 用户名: root
- 密码: 在环境变量中设置

### Redis 缓存
- 主机: localhost
- 端口: 6379

## 🛠️ 开发环境使用

### 1. 仅启动后端服务（连接外部数据库）
```bash
# 修改 docker-compose.yml，注释掉 mysql 和 redis 服务
# 然后启动
docker-compose up backend -d
```

### 2. 开发模式启动
```bash
# 使用开发环境变量
docker-compose -f docker-compose.dev.yml up -d
```

## 📊 监控和维护

### 查看容器资源使用
```bash
docker stats
```

### 进入容器调试
```bash
# 进入后端容器
docker-compose exec backend sh

# 进入MySQL容器
docker-compose exec mysql mysql -u root -p

# 进入Redis容器
docker-compose exec redis redis-cli
```

### 数据备份
```bash
# 备份MySQL数据
docker-compose exec mysql mysqldump -u root -p cfjx_db > backup.sql

# 备份Redis数据
docker-compose exec redis redis-cli SAVE
```

## 🔒 安全建议

1. **修改默认密码**：务必修改 MySQL 和 Redis 的默认密码
2. **限制端口暴露**：生产环境只暴露必要的端口
3. **使用 HTTPS**：生产环境配置 SSL/TLS
4. **定期更新**：保持 Docker 镜像和依赖库更新

## 🐛 故障排除

### 常见问题

**1. 端口冲突**
```bash
# 查看端口占用
netstat -ano | findstr :3000

# 修改 docker-compose.yml 中的端口映射
ports:
  - "3001:3000"  # 外部端口:内部端口
```

**2. 数据库连接失败**
- 检查 MySQL 服务是否正常启动
- 验证数据库连接配置
- 查看 MySQL 容器日志

**3. 内存不足**
```bash
# 增加 Docker 内存限制
docker-compose down
docker system prune -a
docker-compose up -d
```

## 📞 支持

如有问题，请检查：
1. Docker 和 Docker Compose 版本
2. 系统资源（内存、磁盘空间）
3. 防火墙和端口设置
4. 查看各服务日志