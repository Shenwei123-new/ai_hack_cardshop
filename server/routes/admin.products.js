/* eslint-disable */
/**
 * 商品管理：CRUD与卡密批量导入导出
 */
const express = require('express');
const { requireAuth, requireRoles } = require('../middlewares/auth');
const Product = require('../models/product');
const Card = require('../models/card');

const router = express.Router();
router.use(requireAuth(), requireRoles(['admin']));

/**
 * 创建商品
 * @route POST /api/admin/products
 */
router.post('/', async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.json({ ok: true, data: p });
  } catch (e) {
    res.status(400).json({ error: 'BAD_REQUEST' });
  }
});

/**
 * 更新商品
 * @route PUT /api/admin/products/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, data: p });
  } catch (e) {
    res.status(400).json({ error: 'BAD_REQUEST' });
  }
});

/**
 * 列表查询
 * @route GET /api/admin/products
 */
router.get('/', async (req, res) => {
  const list = await Product.find().sort({ createdAt: -1 }).limit(100);
  res.json({ ok: true, list });
});

/**
 * 卡密批量导入（CSV，列：code）
 * @route POST /api/admin/products/:id/cards/import
 * @body {csv}
 */
router.post('/:id/cards/import', async (req, res) => {
  try {
    const { csv } = req.body || {};
    if (!csv) return res.status(400).json({ error: 'BAD_REQUEST' });
    const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);
    const docs = lines.map((code) => ({
      productId: req.params.id,
      codeEncrypted: Buffer.from(code).toString('base64'), // 演示：用base64代替加密
      status: 'available',
    }));
    const result = await Card.insertMany(docs);
    await Product.findByIdAndUpdate(req.params.id, { $inc: { stock: result.length } });
    res.json({ ok: true, imported: result.length });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * 卡密导出（CSV）
 * @route GET /api/admin/products/:id/cards/export
 */
router.get('/:id/cards/export', async (req, res) => {
  const cards = await Card.find({ productId: req.params.id, status: 'available' }).limit(1000);
  const csv = cards.map((c) => Buffer.from(c.codeEncrypted, 'base64').toString()).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

module.exports = { adminProductsRouter: router };
