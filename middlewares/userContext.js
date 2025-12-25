const { UserModel } = require("../models/dataStore");

// 从 session 中获取用户信息并挂载到 req.user
async function getUserFromSession(req, res, next) {
  if (req.session && req.session.userId) {
    try {
      // 构建用户对象
      req.user = {
        id: req.session.userId,
        username: req.session.username,
        isAdmin: req.session.isAdmin || false,
      };
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 出错时不影响流程，继续执行
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = {
  getUserFromSession,
};
