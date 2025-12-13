const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "评论内容不能为空"],
      trim: true,
      minlength: [1, "评论内容不能为空"],
      maxlength: [500, "评论最多500个字符"],
    },
  },
  {
    timestamps: true,
  }
);

// 复合索引 - 按文件ID和创建时间排序
commentSchema.index({ fileId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
