/* eslint-disable */
/**
 * 订单模型：状态机与发卡结果
 */
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    deliveryMode: { type: String, enum: ['page', 'email', 'webhook'], default: 'page' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: { type: [orderItemSchema], default: [] },
    status: { type: String, enum: ['pending', 'paid', 'delivering', 'completed', 'cancelled', 'refunded'], default: 'pending', index: true },
    payChannel: { type: String, enum: ['coins', 'alipay', 'wechat', 'thirdparty'], default: 'coins' },
    payAmount: { type: Number, default: 0 },
    tradeNo: { type: String },
    snapshot: { type: Object }, // 下单时商品快照
    deliveryResult: { type: Object }, // 发卡结果
    createdAt: { type: Date, default: () => new Date(), index: true },
    paidAt: { type: Date },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Order', orderSchema);
