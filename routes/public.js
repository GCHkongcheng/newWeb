const express = require("express");
const router = express.Router();
const publicController = require("../controllers/publicController");
const { requireAuth } = require("../middlewares/auth");

// 公共资源页面（需要登录）
router.get("/", requireAuth, publicController.showPublic);

module.exports = router;
