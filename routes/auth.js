const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireGuest } = require("../middlewares/auth");

// 注册页面
router.get("/register", requireGuest, authController.showRegister);
router.post("/register", requireGuest, authController.register);

// 发送验证码
router.post("/send-code", requireGuest, authController.sendCode);

// 登录页面
router.get("/login", requireGuest, authController.showLogin);
router.post("/login", requireGuest, authController.login);

// 登出
router.get("/logout", authController.logout);

module.exports = router;
