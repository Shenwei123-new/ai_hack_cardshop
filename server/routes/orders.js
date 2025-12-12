/* eslint-disable */
/**
 * 订单路由：创建与库存预留、释放
 */
const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const Card = require('../models/card');

const router = express.Router();

/**
 * 预留卡密（简化版）
 * @param {string} productId
 * @param {number} qty
 * @param {string} orderId
 * @returns {Promise<Array>}
 */
async function reserveCards(productId, qty, orderId) {
  const cards = await Card.find({ productId, status: 'available' }).limit(qty);
  const now = new Date();
  for (const c of cards) {
    c.status = 'reserved';
    c.reservedOrderId = orderId;
    c.reservedAt = now;
    await c.save();
  }
  return cards;
}

/**
 * 释放过期预留（简化：下单后手动检查）
 * @param {string} orderId
 * @param {number} ttlMinutes
 * @returns {Promise<number>}
 */
async function releaseExpiredReserves(orderId, ttlMinutes = 15) {
  const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);
  const result = await Card.updateMany(
    { reservedOrderId: orderId, status: 'reserved', reservedAt: { $lt: cutoff } },
    { $set: { status: 'available' }, $unset: { reservedOrderId: 1, reservedAt: 1 } }
  );
  return result.modifiedCount || 0;
}

/**
 * 创建订单并预留库存
 * @route POST /api/orders/create
 */
router.post('/create', requireAuth(), async (req, res) => {
  const userId = req.user.sub;
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'CART_EMPTY' });

  const itemsSnapshot = [];
  for (const item of cart.items) {
    const p = await Product.findById(item.productId);
    if (!p || p.status !== 'active') return res.status(400).json({ error: 'PRODUCT_INVALID' });
    itemsSnapshot.push({
      productId: p._id,
      qty: item.qty,
      unitPrice: p.pricingModes?.[0]?.config?.price || 0,
      deliveryMode: 'page',
    });
  }

  const order = await Order.create({
    userId,
    items: itemsSnapshot,
    status: 'pending',
    payChannel: 'coins',
    payAmount: itemsSnapshot.reduce((s, it) => s + it.unitPrice * it.qty, 0),
    snapshot: { items: itemsSnapshot },
  });

  // 预留卡密
  for (const it of itemsSnapshot) {
    await reserveCards(it.productId, it.qty, order._id);
  }

  res.json({ ok: true, orderId: order._id });
});

/**
 * 手动释放过期预留（调试用）
 * @route POST /api/orders/:id/release
 */
router.post('/:id/release', requireAuth(), async (req, res) => {
  const count = await releaseExpiredReserves(req.params.id, 15);
  res.json({ ok: true, released: count });
});

module.exports = { ordersRouter: router };
