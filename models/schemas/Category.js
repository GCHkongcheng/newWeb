const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "bi-folder",
    },
    isSystem: {
      type: Boolean,
      default: false, // 是否为系统预设分类
    },
  },
  {
    timestamps: true,
  }
);

// 索引
categorySchema.index({ name: 1 });

module.exports = mongoose.model("Category", categorySchema);
