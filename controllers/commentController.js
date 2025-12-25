const { CommentModel, FileModel, UserModel } = require("../models/dataStore");
const {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} = require("../middlewares/errorHandler");

// 显示文件评论页面
exports.showComments = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const file = await FileModel.findById(fileId);

    if (!file) {
      throw new NotFoundError("文件不存在");
    }

    // 只有公共文件才能评论
    if (!file.isPublic) {
      throw new ForbiddenError("只能对公共文件进行评论");
    }

    // 获取评论
    const comments = await CommentModel.findByFileId(fileId);

    // 获取上传者信息
    const uploader = await UserModel.findById(file.userId);

    res.render("comments/index", {
      user: req.user,
      file,
      uploader,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// 添加评论
exports.addComment = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      throw new ValidationError("评论内容不能为空");
    }

    const file = await FileModel.findById(fileId);

    if (!file) {
      throw new NotFoundError("文件不存在");
    }

    // 只有公共文件才能评论
    if (!file.isPublic) {
      throw new ForbiddenError("只能对公共文件进行评论");
    }

    const comment = await CommentModel.add(
      fileId,
      req.session.userId,
      req.session.username,
      content.trim()
    );

    res.json({ success: true, message: "评论成功", comment });
  } catch (error) {
    next(error);
  }
};

// 删除评论
exports.deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.session.userId;
    const isAdmin = req.session.isAdmin || false;

    const deleted = await CommentModel.delete(commentId, userId, isAdmin);

    if (deleted) {
      res.json({ success: true, message: "评论已删除" });
    } else {
      res.json({ success: false, message: "删除失败，无权限或评论不存在" });
    }
  } catch (error) {
    next(error);
  }
};
