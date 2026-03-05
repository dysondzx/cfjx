const { AlipaySdk, AlipayFormData } = require('alipay-sdk');

// 从环境变量获取支付宝配置
const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APPID, // 从环境变量获取APP_ID
  signType: 'RSA2', // 签名算法
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY, // 从环境变量获取支付宝公钥
  privateKey: process.env.PRIVATE_KEY, // 从环境变量获取应用私钥
  gateway: process.env.GATE_WAY, // 从环境变量获取网关地址
  timeout: 5000,
  camelcase: true
});

module.exports = {
  alipaySdk,
  AlipayFormData
};