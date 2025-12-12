/* eslint-disable */
/**
 * 卡密库存：查询与状态概览
 */
const express = require('express');
const { requireAuth, requireRoles } = require('../middlewares/auth');
const Card = require('../models/card');

const router = express.Router();
router.use(requireAuth(), requireRoles(['admin']));

/**
 * 按商品统计库存
 * @route GET /api/admin/cards/stats
 */
router.get('/stats', async (req, res) => {
  const agg = await Card.aggregate([
    { $group: { _id: '$productId', total: { $sum: 1 }, available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } } } },
  ]);
  res.json({ ok: true, stats: agg });
});

module.exports = { adminCardsRouter: router };
