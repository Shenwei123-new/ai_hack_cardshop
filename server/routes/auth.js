/* eslint-disable */
/**
 * 认证路由：注册、登录、邮箱验证（占位实现）
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');

const router = express.Router();

/**
 * 用户注册
 * @route POST /api/auth/register
 * @body {email, password}
 * @returns {JSON}
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'BAD_REQUEST' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'EMAIL_IN_USE' });
    const passwordHash = await bcrypt.hash(password, 10);
    const token = uuidv4();
    const user = await User.create({
      email,
      passwordHash,
      emailVerifyToken: token,
      emailVerifyExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    // TODO: 发送验证邮件（使用SMTP配置），此处返回token用于本地测试
    return res.json({ ok: true, verifyToken: token, userId: user._id });
  } catch (e) {
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * 邮箱验证
 * @route POST /api/auth/verify-email
 * @body {email, token}
 * @returns {JSON}
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
    if (user.emailVerified) return res.json({ ok: true, already: true });
    if (user.emailVerifyToken !== token) return res.status(400).json({ error: 'INVALID_TOKEN' });
    if (user.emailVerifyExpiresAt && user.emailVerifyExpiresAt < new Date()) {
      return res.status(400).json({ error: 'TOKEN_EXPIRED' });
    }
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpiresAt = undefined;
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

/**
 * 用户登录
 * @route POST /api/auth/login
 * @body {email, password}
 * @returns {JSON}
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'UNAUTHORIZED' });
    user.lastLoginAt = new Date();
    await user.save();
    const token = jwt.sign({ sub: String(user._id), roles: user.roles }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return res.json({ ok: true, token });
  } catch (e) {
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = { authRouter: router };
