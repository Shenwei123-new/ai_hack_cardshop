/* eslint-disable */
/**
 * 支付路由：统一创建与回调入口
 */
const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const alipay = require('../providers/alipayProvider');
const wechat = require('../providers/wechatProvider');
const thirdparty = require('../providers/thirdPartyProvider');
const Card = require('../models/card');

const router = express.Router();

/**
 * 渠道选择
 * @param {string} channel
 */
function providerOf(channel) {
  if (channel === 'alipay') return alipay;
  if (channel === 'wechat') return wechat;
  return thirdparty;
}

/**
 * 创建支付
 * @route POST /api/pay/create/:orderId/:channel
 */
router.post('/create/:orderId/:channel', requireAuth(), async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order || order.status !== 'pending') return res.status(404).json({ error: 'ORDER_INVALID' });
  order.payChannel = req.params.channel;
  await order.save();
  const provider = providerOf(order.payChannel);
  const result = await provider.createPayment(order);
  res.json({ ok: true, ...result });
});

/**
 * 内置货币支付
 * @route POST /api/pay/coins/:orderId
 */
router.post('/coins/:orderId', requireAuth(), async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order || order.status !== 'pending') return res.status(404).json({ error: 'ORDER_INVALID' });
  const user = await User.findById(order.userId);
  if (!user) return res.status(404).json({ error: 'USER_INVALID' });
  if (user.balanceCoins < order.payAmount) return res.status(400).json({ error: 'BALANCE_NOT_ENOUGH' });
  user.balanceCoins -= order.payAmount;
  await user.save();
  order.status = 'paid';
  order.paidAt = new Date();
  order.tradeNo = `COINS-${order._id}`;
  await order.save();
  // 自动发卡
  await Card.updateMany(
    { reservedOrderId: order._id, status: 'reserved' },
    { $set: { status: 'sent' } }
  );
  res.json({ ok: true, paid: true, balanceCoins: user.balanceCoins });
});

/**
 * 支付回调（通用）
 * @route POST /api/pay/notify/:channel
 */
router.post('/notify/:channel', async (req, res) => {
  const provider = providerOf(req.params.channel);
  const verify = await provider.verifyNotify(req.body || {});
  if (!verify.ok) return res.status(400).send('fail');
  const order = await Order.findOne({ tradeNo: verify.outTradeNo });
  // 如果tradeNo不在订单中，尝试通过其他映射（演示略过）
  if (!order) return res.status(404).send('notfound');
  order.status = 'paid';
  order.paidAt = new Date();
  await order.save();
  // 自动发卡（简化：将预留置为已发）
  await Card.updateMany(
    { reservedOrderId: order._id, status: 'reserved' },
    { $set: { status: 'sent' } }
  );
  res.send('success');
});

module.exports = { payRouter: router };
