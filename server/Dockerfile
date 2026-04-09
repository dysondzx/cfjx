# 使用官方Node.js镜像作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果有的话）
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 定义环境变量（默认值）
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["npm", "start"]