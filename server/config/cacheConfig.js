// 缓存键常量
const CACHE_KEYS = {
    CLASSIFY_LIST: 'classify:list', // 分类
    INDEX_TOP_BAR: 'index:top_bar' // 首页顶部导航
};

// 缓存过期时间（秒）
const CACHE_TTL = {
    CLASSIFY_LIST: 3600 // 1小时
};

module.exports = {
  CACHE_KEYS,
  CACHE_TTL
};