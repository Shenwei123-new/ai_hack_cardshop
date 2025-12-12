/* eslint-disable */
/**
 * 认证与RBAC中间件：JWT鉴权、角色检查
 */
const jwt = require('jsonwebtoken');

/**
 * 解析并验证JWT，注入req.user
 * @returns {import('express').RequestHandler}
 */
function requireAuth() {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
  };
}

/**
 * RBAC角色检查
 * @param {string[]} roles 允许的角色列表
 * @returns {import('express').RequestHandler}
 */
function requireRoles(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
    const ok = roles.some((r) => userRoles.includes(r));
    if (!ok) return res.status(403).json({ error: 'FORBIDDEN' });
    next();
  };
}

module.exports = { requireAuth, requireRoles };
