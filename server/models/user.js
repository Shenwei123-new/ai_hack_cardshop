/* eslint-disable */
/**
 * 用户模型：邮箱验证、密码Hash、内置货币余额、角色
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    passwordHash: { type: String },
    emailVerified: { type: Boolean, default: false },
    roles: { type: [String], default: ['user'] },
    balanceCoins: { type: Number, default: 0 },
    registerAt: { type: Date, default: () => new Date() },
    lastLoginAt: { type: Date },
    emailVerifyToken: { type: String },
    emailVerifyExpiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
