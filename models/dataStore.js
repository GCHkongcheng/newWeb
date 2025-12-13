const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const config = require("../config/config");
const User = require("./schemas/User");
const File = require("./schemas/File");
const Comment = require("./schemas/Comment");
const Category = require("./schemas/Category");
const VerificationCode = require("./schemas/VerificationCode");

// ==================== 初始化数据 ====================
async function initializeData() {
  try {
    // 初始化固定分类
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: "代码", icon: "bi-code-slash", isSystem: true },
        { name: "备忘", icon: "bi-journal-text", isSystem: true },
        { name: "图片", icon: "bi-image", isSystem: true },
        { name: "其他", icon: "bi-folder", isSystem: true },
      ];
      await Category.insertMany(defaultCategories);
      console.log("✅ 默认分类已初始化");
    }
  } catch (error) {
    console.error("初始化数据失败:", error);
  }
}

// ==================== 用户模型 ====================
const UserModel = {
  // 获取所有用户
  async findAll() {
    return await User.find().select("-password").sort({ createdAt: -1 });
  },

  // 根据ID查找用户
  async findById(userId) {
    return await User.findById(userId).select("-password");
  },

  // 根据邮箱查找用户
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  },

  // 根据用户名查找用户
  async findByUsername(username) {
    return await User.findOne({ username });
  },

  // 根据邮箱或用户名查找用户
  async findByEmailOrUsername(identifier) {
    return await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });
  },

  // 创建用户
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      isAdmin: userData.isAdmin || false,
      isVerified: userData.isVerified || false,
    });
    await user.save();

    // 创建用户文件夹
    const userDir = path.join(
      __dirname,
      "..",
      config.uploadPath,
      user._id.toString()
    );
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    return user;
  },

  // 验证密码（用于登录）
  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },

  // 更新用户
  async update(userId, updateData) {
    // 如果更新密码，需要hash
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      select: "-password",
    });
  },

  // 删除用户
  async delete(userId) {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  },

  // 统计用户数量
  async count() {
    return await User.countDocuments();
  },
};

// ==================== 文件模型 ====================
const FileModel = {
  // 获取所有文件
  async findAll() {
    return await File.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 });
  },

  // 根据ID查找文件
  async findById(fileId) {
    return await File.findById(fileId).populate("userId", "username");
  },

  // 根据用户ID查找文件
  async findByUserId(userId) {
    return await File.find({ userId }).sort({ createdAt: -1 });
  },

  // 获取公共文件
  async findPublic() {
    return await File.find({ isPublic: true })
      .populate("userId", "username")
      .sort({ createdAt: -1 });
  },

  // 创建文件记录
  async create(fileData) {
    const file = new File({
      userId: fileData.userId,
      filename: fileData.filename,
      originalName: fileData.originalName,
      path: fileData.path,
      size: fileData.size,
      mimetype: fileData.mimetype,
      category: fileData.category || "其他",
      isPublic: fileData.isPublic || false,
      description: fileData.description || "",
    });
    await file.save();
    return file;
  },

  // 更新文件
  async update(fileId, updateData) {
    return await File.findByIdAndUpdate(fileId, updateData, { new: true });
  },

  // 删除文件记录
  async delete(fileId) {
    const file = await File.findById(fileId);
    if (!file) return false;

    // 删除物理文件
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error("Error deleting physical file:", error);
    }

    await File.findByIdAndDelete(fileId);
    return true;
  },

  // 计算用户已使用的存储空间（字节）
  async getUserStorageUsed(userId) {
    const result = await File.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$size" } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  },

  // 统计文件数量
  async count() {
    return await File.countDocuments();
  },

  // 按分类统计文件数量
  async countByCategory(userId) {
    return await File.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
  },
};

// ==================== 评论模型 ====================
const CommentModel = {
  // 获取所有评论
  async findAll() {
    return await Comment.find()
      .populate("userId", "username")
      .populate("fileId", "originalName")
      .sort({ createdAt: -1 });
  },

  // 根据ID查找评论
  async findById(commentId) {
    return await Comment.findById(commentId)
      .populate("userId", "username")
      .populate("fileId", "originalName");
  },

  // 根据文件ID查找评论
  async findByFileId(fileId) {
    return await Comment.find({ fileId })
      .populate("userId", "username")
      .sort({ createdAt: -1 });
  },

  // 添加评论
  async add(fileId, userId, username, content) {
    const comment = new Comment({
      fileId,
      userId,
      content,
    });
    await comment.save();
    return await comment.populate("userId", "username");
  },

  // 删除评论
  async delete(commentId, userId, isAdmin = false) {
    const comment = await Comment.findById(commentId);
    if (!comment) return false;

    // 管理员可以删除任何评论，普通用户只能删除自己的评论
    if (!isAdmin && comment.userId.toString() !== userId) {
      return false;
    }

    await Comment.findByIdAndDelete(commentId);
    return true;
  },

  // 删除文件的所有评论
  async deleteByFileId(fileId) {
    const result = await Comment.deleteMany({ fileId });
    return result.deletedCount;
  },

  // 统计评论数量
  async count() {
    return await Comment.countDocuments();
  },
};

// ==================== 分类模型 ====================
const CategoryModel = {
  // 获取所有分类
  async findAll() {
    return await Category.find().sort({ createdAt: 1 });
  },

  // 根据ID查找分类
  async findById(categoryId) {
    return await Category.findById(categoryId);
  },

  // 根据名称查找分类
  async findByName(name) {
    return await Category.findOne({ name });
  },
};

// ==================== 验证码模型 ====================
const VerificationCodeModel = {
  // 保存验证码
  async save(email, code, expirationMinutes = 10) {
    // 删除旧的验证码
    await VerificationCode.deleteMany({ email: email.toLowerCase() });

    // 创建新的验证码
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    const verificationCode = new VerificationCode({
      email: email.toLowerCase(),
      code,
      expiresAt,
    });
    await verificationCode.save();
    return verificationCode;
  },

  // 验证验证码
  async verify(email, code) {
    const record = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code,
      expiresAt: { $gt: new Date() }, // 未过期
    });

    if (record) {
      // 验证成功后删除验证码
      await VerificationCode.deleteOne({ _id: record._id });
      return true;
    }
    return false;
  },

  // 删除验证码
  async delete(email) {
    await VerificationCode.deleteMany({ email: email.toLowerCase() });
  },

  // 清理过期验证码（MongoDB TTL索引会自动处理，这个方法作为备用）
  async cleanup() {
    const result = await VerificationCode.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  },

  // 获取所有验证码（兼容旧代码）
  async findAll() {
    const codes = await VerificationCode.find();
    const result = {};
    codes.forEach((code) => {
      result[code.email] = {
        code: code.code,
        createdAt: code.createdAt,
        expiresAt: code.expiresAt,
      };
    });
    return result;
  },
};

// ==================== 回收站模型 (暂时保留，后续可考虑用MongoDB实现) ====================
const TrashModel = {
  // 获取所有回收站文件
  findAll() {
    return [];
  },

  // 根据用户ID查找回收站文件
  findByUserId(userId) {
    return [];
  },

  // 根据ID查找回收站文件
  findById(fileId) {
    return null;
  },

  // 添加到回收站
  add(fileData) {
    return null;
  },

  // 从回收站恢复
  restore(fileId) {
    return null;
  },

  // 从回收站彻底删除
  permanentDelete(fileId) {
    return false;
  },

  // 清理过期文件
  cleanExpired() {
    return 0;
  },

  // 清空用户回收站
  emptyByUserId(userId) {
    return 0;
  },
};

module.exports = {
  initializeData,
  UserModel,
  FileModel,
  VerificationCodeModel,
  TrashModel,
  CommentModel,
  CategoryModel,
};
