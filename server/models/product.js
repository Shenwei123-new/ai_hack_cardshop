/* eslint-disable */
/**
 * 商品模型：图文详情、定价模式、库存与搜索增强辅助字段
 */
const mongoose = require('mongoose');

const pricingModeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['fixed', 'tiered', 'bulk'], default: 'fixed' },
    config: { type: Object }, // 根据type保存不同配置
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, index: 'text' },
    slug: { type: String, unique: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    images: { type: [String], default: [] },
    descriptionHTML: { type: String }, // 已清洗的HTML
    pricingModes: { type: [pricingModeSchema], default: [{ type: 'fixed', config: { price: 0 } }] },
    stock: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    searchAux: {
      nameLower: { type: String, index: true },
      synonyms: { type: [String], default: [], index: true },
      namePinyin: { type: [String], default: [], index: true }, // 预留拼音字段
    },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  this.searchAux = this.searchAux || {};
  this.searchAux.nameLower = (this.name || '').toLowerCase();
  next();
});

module.exports = mongoose.model('Product', productSchema);
