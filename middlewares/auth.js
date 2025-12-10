// 验证用户是否已登录
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect("/auth/login");
}

// 验证用户是否未登录（用于登录/注册页面）
function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect("/files");
  }
  next();
}

// 验证管理员权限
function requireAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.isAdmin) {
    return next();
  }
  res.status(403).render("error", {
    message: "访问被拒绝",
    error: "您没有权限访问此页面",
    user: req.session.userId ? { username: req.session.username } : null,
  });
}

module.exports = {
  requireAuth,
  requireGuest,
  requireAdmin,
};
