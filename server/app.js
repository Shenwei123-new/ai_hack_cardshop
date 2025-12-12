/* eslint-disable */
/**
 * 应用入口：初始化Express、加载安全中间件、连接数据库、注册路由与后台任务
 */
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const { loadEnv } = require('./config/env');
const { connectMongo } = require('./db/mongoose');
const { applySecurityMiddlewares } = require('./middlewares/security');
const { authRouter } = require('./routes/auth');
const { adminRouter } = require('./routes/admin');
const { adminProductsRouter } = require('./routes/admin.products');
const { adminCategoriesRouter } = require('./routes/admin.categories');
const { adminCardsRouter } = require('./routes/admin.cards');
const { cartRouter } = require('./routes/cart');
const { ordersRouter } = require('./routes/orders');
const { payRouter } = require('./routes/pay');
const { redeemRouter } = require('./routes/redeem');
const { adminRedeemRouter } = require('./routes/admin.redeem');
const { searchRouter } = require('./routes/search');
const { adminReportsRouter } = require('./routes/admin.reports');
const { ensureMonthlyAuditArchiveJob } = require('./jobs/auditArchive');

loadEnv();

const app = express();

// 请求体解析
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// 访问日志
app.use(morgan('dev'));

// 安全中间件
applySecurityMiddlewares(app);

// 静态资源（前端占位）
app.use('/public', express.static(path.join(__dirname, '..', 'web')));

// 路由注册
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/categories', adminCategoriesRouter);
app.use('/api/admin/cards', adminCardsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/pay', payRouter);
app.use('/api/redeem', redeemRouter);
app.use('/api/admin/redeem', adminRedeemRouter);
app.use('/api/search', searchRouter);
app.use('/api/admin/reports', adminReportsRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

/**
 * 启动服务器
 * @returns {Promise<void>}
 */
async function start() {
  await connectMongo();
  ensureMonthlyAuditArchiveJob();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`[server] listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
