/* eslint-disable */
/**
 * MongoDB连接：支持禁用DB的演示模式
 */
const mongoose = require('mongoose');

let connected = false;

/**
 * 连接MongoDB（可在DISABLE_DB=true时跳过连接）
 * @returns {Promise<void>}
 */
async function connectMongo() {
  if (String(process.env.DISABLE_DB).toLowerCase() === 'true') {
    console.log('[db] DISABLE_DB=true，跳过Mongo连接，使用演示模式');
    return;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI未配置');
  }
  await mongoose.connect(uri, { autoIndex: true });
  connected = true;
  console.log('[db] connected');
}

/**
 * 检查是否已连接Mongo
 * @returns {boolean}
 */
function isMongoConnected() {
  return connected;
}

module.exports = { connectMongo, isMongoConnected };
