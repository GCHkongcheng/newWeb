const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true, // 存储在服务器上的文件名
    },
    originalName: {
      type: String,
      required: true, // 用户上传的原始文件名
    },
    path: {
      type: String,
      required: true, // 文件存储路径
    },
    size: {
      type: Number,
      required: true, // 文件大小（字节）
    },
    mimetype: {
      type: String,
      required: true, // MIME类型
    },
    category: {
      type: String,
      enum: ["code", "memo", "image", "other"],
      default: "other",
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt
  }
);

// 复合索引优化查询
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ isPublic: 1, createdAt: -1 });
fileSchema.index({ userId: 1, category: 1 });

// 虚拟字段 - 文件大小（MB）
fileSchema.virtual("sizeMB").get(function () {
  return (this.size / 1024 / 1024).toFixed(2);
});

module.exports = mongoose.model("File", fileSchema);
