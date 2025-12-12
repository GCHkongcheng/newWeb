const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { requireAuth } = require("../middlewares/auth");

// 所有路由都需要登录
router.use(requireAuth);

// 显示用户中心
router.get("/", profileController.showProfile);

// 修改用户名
router.post("/username", profileController.updateUsername);

// 修改密码
router.post("/password", profileController.updatePassword);

module.exports = router;
