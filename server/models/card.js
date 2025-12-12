/* eslint-disable */
/**
 * 卡密模型：加密存储、预留与发放状态
 */
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    codeEncrypted: { type: String }, // 加密后的卡密
    status: { type: String, enum: ['available', 'reserved', 'sent'], default: 'available', index: true },
    reservedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    reservedAt: { type: Date },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Card', cardSchema);
