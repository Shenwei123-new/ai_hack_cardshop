/* eslint-disable */
/**
 * 环境变量加载：集中处理.env与缺省值
 */
const path = require('path');
const dotenv = require('dotenv');

/**
 * 加载环境变量文件
 * @returns {void}
 */
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });
  process.env.PORT = process.env.PORT || '3000';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  process.env.DISABLE_DB = process.env.DISABLE_DB || 'false';
}

module.exports = { loadEnv };
