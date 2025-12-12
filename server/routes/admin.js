/* eslint-disable */
/**
 * 管理后台基础路由：审计日志查询（示例）、角色检查
 */
const express = require('express');
const { requireAuth, requireRoles } = require('../middlewares/auth');
const Audit = require('../models/audit');

const router = express.Router();

router.use(requireAuth(), requireRoles(['admin']));

/**
 * 查询当月审计日志
 * @route GET /api/admin/audits/current
 * @returns {JSON}
 */
router.get('/audits/current', async (req, res) => {
  try {
    const ym = new Date().toISOString().slice(0, 7);
    const list = await Audit.find({ archivedMonth: ym }).sort({ createdAt: -1 }).limit(100);
    return res.json({ ok: true, list });
  } catch (e) {
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = { adminRouter: router };
