const { ValidationError } = require("./errorHandler");

// 验证文件上传参数
function validateFileUpload(req, res, next) {
  const { description, category, isPublic } = req.body;

  // 验证描述（可选，但如果提供则不能超过 500 字符）
  if (description && description.length > 500) {
    throw new ValidationError("文件描述不能超过 500 字符");
  }

  // 验证分类（可选，但如果提供则必须是字符串）
  if (category && typeof category !== "string") {
    throw new ValidationError("分类格式不正确");
  }

  // 验证 isPublic（可选，但如果提供则必须是 boolean 或 string 'true'/'false'）
  if (
    isPublic !== undefined &&
    isPublic !== "true" &&
    isPublic !== "false" &&
    typeof isPublic !== "boolean"
  ) {
    throw new ValidationError("公开状态格式不正确");
  }

  next();
}

// 验证文件重命名参数
function validateRenameFile(req, res, next) {
  const { newName } = req.body;

  if (!newName) {
    throw new ValidationError("新文件名不能为空");
  }

  if (typeof newName !== "string") {
    throw new ValidationError("文件名格式不正确");
  }

  if (newName.trim().length === 0) {
    throw new ValidationError("文件名不能为空白");
  }

  if (newName.length > 255) {
    throw new ValidationError("文件名不能超过 255 字符");
  }

  // 检查文件名是否包含非法字符
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (invalidChars.test(newName)) {
    throw new ValidationError("文件名包含非法字符");
  }

  next();
}

// 验证移动文件参数
function validateMoveFile(req, res, next) {
  const { category } = req.body;

  if (!category) {
    throw new ValidationError("目标分类不能为空");
  }

  if (typeof category !== "string") {
    throw new ValidationError("分类格式不正确");
  }

  next();
}

// 验证更改权限参数
function validateChangePermission(req, res, next) {
  const { isPublic } = req.body;

  if (isPublic === undefined) {
    throw new ValidationError("权限状态不能为空");
  }

  if (
    isPublic !== "true" &&
    isPublic !== "false" &&
    typeof isPublic !== "boolean"
  ) {
    throw new ValidationError("权限状态格式不正确");
  }

  next();
}

// 验证注册参数
function validateRegister(req, res, next) {
  const { username, email, password, confirmPassword, verificationCode } =
    req.body;

  if (!username || !email || !password || !confirmPassword) {
    throw new ValidationError("所有字段都是必填的");
  }

  if (password !== confirmPassword) {
    throw new ValidationError("两次输入的密码不一致");
  }

  if (password.length < 6) {
    throw new ValidationError("密码长度至少为 6 位");
  }

  if (!verificationCode) {
    throw new ValidationError("验证码不能为空");
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("邮箱格式不正确");
  }

  // 验证用户名（只允许字母、数字、下划线）
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw new ValidationError("用户名只能包含字母、数字、下划线，长度 3-20 位");
  }

  next();
}

// 验证登录参数
function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("邮箱和密码不能为空");
  }

  next();
}

// 验证评论参数
function validateComment(req, res, next) {
  const { content } = req.body;

  if (!content) {
    throw new ValidationError("评论内容不能为空");
  }

  if (typeof content !== "string") {
    throw new ValidationError("评论内容格式不正确");
  }

  if (content.trim().length === 0) {
    throw new ValidationError("评论内容不能为空白");
  }

  if (content.length > 1000) {
    throw new ValidationError("评论内容不能超过 1000 字符");
  }

  next();
}

// 验证修改用户名参数
function validateChangeUsername(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ValidationError("用户名和密码不能为空");
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw new ValidationError("用户名只能包含字母、数字、下划线，长度 3-20 位");
  }

  next();
}

// 验证修改密码参数
function validateChangePassword(req, res, next) {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ValidationError("所有字段都是必填的");
  }

  if (newPassword !== confirmPassword) {
    throw new ValidationError("两次输入的新密码不一致");
  }

  if (newPassword.length < 6) {
    throw new ValidationError("新密码长度至少为 6 位");
  }

  if (currentPassword === newPassword) {
    throw new ValidationError("新密码不能与当前密码相同");
  }

  next();
}

module.exports = {
  validateFileUpload,
  validateRenameFile,
  validateMoveFile,
  validateChangePermission,
  validateRegister,
  validateLogin,
  validateComment,
  validateChangeUsername,
  validateChangePassword,
};
