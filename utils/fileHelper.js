// 文件相关工具函数

/**
 * 检查文件所有权
 * @param {Object} file - 文件对象
 * @param {String} userId - 当前用户ID
 * @param {Boolean} isAdmin - 是否是管理员
 * @returns {Boolean} - 是否有权限
 */
function checkFileOwnership(file, userId, isAdmin = false) {
  // 处理 populate 后的 userId (可能是对象或字符串)
  const fileOwnerId = file.userId._id
    ? file.userId._id.toString()
    : file.userId.toString();

  return fileOwnerId === userId || isAdmin;
}

/**
 * 格式化文件大小
 * @param {Number} bytes - 字节数
 * @param {Number} decimals - 小数位数
 * @returns {String} - 格式化后的大小
 */
function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * 验证文件名是否合法
 * @param {String} filename - 文件名
 * @returns {Object} - {valid: Boolean, message: String}
 */
function validateFilename(filename) {
  if (!filename || !filename.trim()) {
    return { valid: false, message: "文件名不能为空" };
  }

  if (filename.length > 255) {
    return { valid: false, message: "文件名不能超过255个字符" };
  }

  const invalidChars = /[\/\\:*?"<>|]/;
  if (invalidChars.test(filename)) {
    return {
      valid: false,
      message: '文件名不能包含以下字符: / \\ : * ? " < > |',
    };
  }

  return { valid: true };
}

/**
 * 检查是否为图片文件
 * @param {String} filename - 文件名
 * @returns {Boolean} - 是否是图片
 */
function isImageFile(filename) {
  const constants = require("../config/constants");
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return constants.IMAGE_EXTENSIONS.includes(ext);
}

/**
 * 计算存储空间使用百分比
 * @param {Number} usedStorage - 已使用空间（字节）
 * @param {Number} maxStorage - 最大空间（字节）
 * @returns {Number} - 百分比（保留1位小数）
 */
function calculateStoragePercent(usedStorage, maxStorage) {
  return parseFloat(((usedStorage / maxStorage) * 100).toFixed(1));
}

module.exports = {
  checkFileOwnership,
  formatFileSize,
  validateFilename,
  isImageFile,
  calculateStoragePercent,
};
