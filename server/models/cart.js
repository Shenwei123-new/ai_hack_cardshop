/* eslint-disable */
/**
 * 购物车模型：支持用户/游客（guestId）
 */
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty: { type: Number, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestId: { type: String },
    items: { type: [cartItemSchema], default: [] },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Cart', cartSchema);
