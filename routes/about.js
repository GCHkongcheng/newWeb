const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutController");

// 关于页面（无需登录）
router.get("/", aboutController.showAbout);

module.exports = router;
