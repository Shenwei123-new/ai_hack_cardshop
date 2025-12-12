/* eslint-disable */
/**
 * 安全中间件：Helmet、CORS、CSRF（可选）、限流、人机与爬虫基础防护
 */
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

/**
 * 应用安全中间件到Express实例
 * @param {import('express').Express} app
 * @returns {void}
 */
function applySecurityMiddlewares(app) {
  // 基础安全头
  app.use(helmet());

  // CORS策略（默认允许本地开发）
  app.use(
    cors({
      origin: (origin, cb) => cb(null, true),
      credentials: true,
    })
  );

  // 全局限流（IP维度）
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // CSRF（如使用Cookie会话，可开启；当前默认关闭，按路由开启）
  // const csrfProtection = csrf({ cookie: true });
  // app.use('/api/secure', csrfProtection);

  // 基础防爬：异常UA与隐藏蜜罐路径
  app.use('/honeypot', (req, res) => {
    // 访问蜜罐直接限速或标记
    res.status(429).send('Too Many Requests');
  });
}

module.exports = { applySecurityMiddlewares };
