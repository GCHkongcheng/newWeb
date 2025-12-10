const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middlewares/auth");

// 所有管理路由都需要管理员权限
router.use(requireAdmin);

// 管理后台首页
router.get("/dashboard", adminController.dashboard);

// 用户管理
router.get("/users", adminController.users);

// 文件管理
router.get("/files", adminController.files);

// 删除文件
router.delete("/files/:id", adminController.deleteFile);

module.exports = router;
