const { CommentModel, FileModel, UserModel } = require("../models/dataStore");

// 显示文件评论页面
exports.showComments = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = FileModel.findById(fileId);

    if (!file) {
      return res.status(404).render("error", {
        message: "文件不存在",
        error: { status: 404 },
        user: req.session.userId ? { username: req.session.username } : null,
      });
    }

    // 只有公共文件才能评论
    if (!file.isPublic) {
      return res.status(403).render("error", {
        message: "只能对公共文件进行评论",
        error: { status: 403 },
        user: req.session.userId ? { username: req.session.username } : null,
      });
    }

    // 获取评论
    const comments = CommentModel.findByFileId(fileId);

    // 获取上传者信息
    const uploader = UserModel.findById(file.userId);

    res.render("comments/index", {
      user: req.session.userId
        ? { username: req.session.username, userId: req.session.userId }
        : null,
      file,
      uploader,
      comments,
    });
  } catch (error) {
    console.error("显示评论错误:", error);
    res.status(500).render("error", {
      message: "加载评论失败",
      error: error,
      user: req.session.userId ? { username: req.session.username } : null,
    });
  }
};

// 添加评论
exports.addComment = async (req, res) => {
  try {
    const fileId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.json({ success: false, message: "评论内容不能为空" });
    }

    const file = FileModel.findById(fileId);

    if (!file) {
      return res.json({ success: false, message: "文件不存在" });
    }

    // 只有公共文件才能评论
    if (!file.isPublic) {
      return res.json({ success: false, message: "只能对公共文件进行评论" });
    }

    const comment = CommentModel.add(
      fileId,
      req.session.userId,
      req.session.username,
      content.trim()
    );

    res.json({ success: true, message: "评论成功", comment });
  } catch (error) {
    console.error("添加评论错误:", error);
    res.json({ success: false, message: "评论失败: " + error.message });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.session.userId;

    const deleted = CommentModel.delete(commentId, userId);

    if (deleted) {
      res.json({ success: true, message: "评论已删除" });
    } else {
      res.json({ success: false, message: "删除失败，无权限或评论不存在" });
    }
  } catch (error) {
    console.error("删除评论错误:", error);
    res.json({ success: false, message: "删除失败: " + error.message });
  }
};
