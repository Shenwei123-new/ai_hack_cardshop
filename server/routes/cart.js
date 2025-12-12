/* eslint-disable */
/**
 * 购物车路由：增删改查
 */
const express = require('express');
const Cart = require('../models/cart');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

/**
 * 获取购物车
 * @route GET /api/cart
 */
router.get('/', requireAuth(), async (req, res) => {
  const userId = req.user.sub;
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  res.json({ ok: true, cart });
});

/**
 * 添加商品到购物车
 * @route POST /api/cart/add
 * @body {productId, qty}
 */
router.post('/add', requireAuth(), async (req, res) => {
  const userId = req.user.sub;
  const { productId, qty = 1 } = req.body || {};
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  const existing = cart.items.find((i) => String(i.productId) === String(productId));
  if (existing) existing.qty += qty;
  else cart.items.push({ productId, qty });
  cart.updatedAt = new Date();
  await cart.save();
  res.json({ ok: true, cart });
});

/**
 * 更新商品数量
 * @route POST /api/cart/update
 * @body {productId, qty}
 */
router.post('/update', requireAuth(), async (req, res) => {
  const userId = req.user.sub;
  const { productId, qty = 1 } = req.body || {};
  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ error: 'NOT_FOUND' });
  const existing = cart.items.find((i) => String(i.productId) === String(productId));
  if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
  existing.qty = qty;
  cart.updatedAt = new Date();
  await cart.save();
  res.json({ ok: true, cart });
});

module.exports = { cartRouter: router };
