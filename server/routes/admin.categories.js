/* eslint-disable */
/**
 * 分类管理：CRUD
 */
const express = require('express');
const { requireAuth, requireRoles } = require('../middlewares/auth');
const Category = require('../models/category');

const router = express.Router();
router.use(requireAuth(), requireRoles(['admin']));

/**
 * 创建分类
 * @route POST /api/admin/categories
 */
router.post('/', async (req, res) => {
  const body = req.body || {};
  const level = body.parentId ? 1 : 0;
  const c = await Category.create({ ...body, level });
  res.json({ ok: true, data: c });
});

/**
 * 更新分类
 * @route PUT /api/admin/categories/:id
 */
router.put('/:id', async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ok: true, data: c });
});

/**
 * 列表查询
 * @route GET /api/admin/categories
 */
router.get('/', async (req, res) => {
  const list = await Category.find().sort({ sort: 1, name: 1 });
  res.json({ ok: true, list });
});

module.exports = { adminCategoriesRouter: router };
