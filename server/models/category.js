/* eslint-disable */
/**
 * 分类模型：支持多级分类
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    path: { type: String }, // 例如 "周边/点卡"
    level: { type: Number, default: 0 },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
