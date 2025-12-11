const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { requireAuth } = require("../middlewares/auth");

// 查看评论（需要登录）
router.get("/:id", requireAuth, commentController.showComments);

// 添加评论（需要登录）
router.post("/:id", requireAuth, commentController.addComment);

// 删除评论（需要登录）
router.delete("/:id/:commentId", requireAuth, commentController.deleteComment);

module.exports = router;
