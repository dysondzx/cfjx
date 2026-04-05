const redis = require('redis');

/**
 * Redis缓存服务类
 * 提供统一的缓存操作接口
 */
class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.init();
    }

    /**
     * 初始化Redis连接
     */
    async init() {
        try {
            // 从环境变量获取Redis配置
            const redisUrl = process.env.REDIS_URL;
            
            this.client = redis.createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        // 指数退避重连策略
                        const delay = Math.min(retries * 50, 1000);
                        return delay;
                    }
                }
            });

            // 错误处理
            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('Redis connected successfully');
                this.isConnected = true;
            });

            await this.client.connect();
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            this.isConnected = false;
        }
    }

    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     * @param {number} ttl - 过期时间（秒）
     * @returns {Promise<boolean>}
     */
    async set(key, value, ttl = 3600) {
        if (!this.isConnected) return false;
        
        try {
            const serializedValue = JSON.stringify(value);
            await this.client.set(key, serializedValue, {
                EX: ttl // 设置过期时间
            });
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @returns {Promise<any>}
     */
    async get(key) {
        if (!this.isConnected) return null;
        
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * 删除缓存
     * @param {string} key - 缓存键
     * @returns {Promise<boolean>}
     */
    async del(key) {
        if (!this.isConnected) return false;
        
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    /**
     * 检查缓存是否存在
     * @param {string} key - 缓存键
     * @returns {Promise<boolean>}
     */
    async exists(key) {
        if (!this.isConnected) return false;
        
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    /**
     * 获取缓存剩余时间
     * @param {string} key - 缓存键
     * @returns {Promise<number>} 剩余秒数，-1表示永不过期，-2表示键不存在
     */
    async ttl(key) {
        if (!this.isConnected) return -2;
        
        try {
            return await this.client.ttl(key);
        } catch (error) {
            console.error('Cache TTL error:', error);
            return -2;
        }
    }

    /**
     * 关闭Redis连接
     */
    async close() {
        if (this.client && this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
}

// 创建单例实例
const cacheService = new CacheService();

module.exports = cacheService;