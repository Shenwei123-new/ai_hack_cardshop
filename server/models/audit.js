/* eslint-disable */
/**
 * 审计日志模型：按月归档标记
 */
const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    actorId: { type: String }, // 用户或管理员ID
    actorType: { type: String, enum: ['user', 'admin'] },
    action: { type: String }, // 操作名
    resourceType: { type: String }, // 资源类型
    resourceId: { type: String }, // 资源ID
    payload: { type: Object }, // 关键参数快照
    archivedMonth: { type: String }, // YYYY-MM
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Audit', auditSchema);
