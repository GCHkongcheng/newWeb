const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "用户名不能为空"],
      unique: true,
      trim: true,
      minlength: [3, "用户名至少3个字符"],
      maxlength: [30, "用户名最多30个字符"],
    },
    email: {
      type: String,
      required: [true, "邮箱不能为空"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "邮箱格式不正确"],
    },
    password: {
      type: String,
      required: [true, "密码不能为空"],
      minlength: [6, "密码至少6个字符"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    storageQuota: {
      type: Number,
      default: 500 * 1024 * 1024, // 默认500MB
    },
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);
