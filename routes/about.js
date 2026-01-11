const express = require("express");
const router = express.Router();

// 关于页面（无需登录）
router.get("/", (req, res) => {
  res.render("about/index", { user: req.user });
});

module.exports = router;
