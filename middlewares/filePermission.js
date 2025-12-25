const { FileModel } = require("../models/dataStore");
const { NotFoundError, ForbiddenError } = require("./errorHandler");

// 检查文件是否存在并获取文件信息
async function loadFile(req, res, next) {
  try {
    const fileId = req.params.id;
    const file = await FileModel.findById(fileId);

    if (!file) {
      throw new NotFoundError("文件不存在");
    }

    req.file = file;
    next();
  } catch (error) {
    next(error);
  }
}

// 检查用户是否有权限访问文件
function checkFilePermission(req, res, next) {
  const file = req.file;
  const userId = req.session.userId;
  const isAdmin = req.session.isAdmin;

  if (!file) {
    return next(new NotFoundError("文件不存在"));
  }

  // 获取文件所有者 ID（兼容 populate 和未 populate 的情况）
  const fileOwnerId = file.userId._id
    ? file.userId._id.toString()
    : file.userId.toString();

  // 检查权限：文件所有者或管理员可以访问
  if (fileOwnerId !== userId && !isAdmin) {
    throw new ForbiddenError("无权访问此文件");
  }

  next();
}

// 检查用户是否有权限访问公共文件（无需登录）
function checkPublicFileAccess(req, res, next) {
  const file = req.file;

  if (!file) {
    return next(new NotFoundError("文件不存在"));
  }

  // 公共文件所有人都可以访问
  if (file.isPublic) {
    return next();
  }

  // 非公共文件需要登录
  if (!req.session.userId) {
    throw new ForbiddenError("此文件为私有文件，需要登录后访问");
  }

  // 检查是否是文件所有者或管理员
  const fileOwnerId = file.userId._id
    ? file.userId._id.toString()
    : file.userId.toString();

  if (fileOwnerId !== req.session.userId && !req.session.isAdmin) {
    throw new ForbiddenError("无权访问此文件");
  }

  next();
}

module.exports = {
  loadFile,
  checkFilePermission,
  checkPublicFileAccess,
};
