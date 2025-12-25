// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "未授权访问") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends AppError {
  constructor(message = "无权访问此资源") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

class NotFoundError extends AppError {
  constructor(message = "资源不存在") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class StorageExceededError extends AppError {
  constructor(used, fileSize, max) {
    const message = `存储空间不足！当前已使用 ${(used / 1024 / 1024).toFixed(
      2
    )}MB，该文件大小 ${(fileSize / 1024 / 1024).toFixed(2)}MB，总容量 ${(
      max /
      1024 /
      1024
    ).toFixed(0)}MB`;
    super(message, 400);
    this.name = "StorageExceededError";
  }
}

// 统一错误处理中间件
function errorHandler(err, req, res, next) {
  // 默认错误信息
  let statusCode = err.statusCode || 500;
  let message = err.message || "服务器错误";

  // Mongoose 验证错误
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(", ");
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field === "email" ? "邮箱" : "用户名"}已被注册`;
  }

  // Mongoose CastError (无效的 ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "无效的 ID 格式";
  }

  // 记录错误
  if (statusCode >= 500) {
    console.error("❌ 服务器错误:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  } else {
    console.log(`⚠️  客户端错误 [${statusCode}]:`, message);
  }

  // 判断是否是 API 请求
  const isApiRequest =
    req.xhr ||
    req.headers.accept?.includes("application/json") ||
    req.path.startsWith("/api");

  // API 请求返回 JSON
  if (isApiRequest) {
    return res.status(statusCode).json({
      success: false,
      message: message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // 页面请求渲染错误页面
  res.status(statusCode).render("error", {
    message: message,
    error: process.env.NODE_ENV === "development" ? err : {},
    user: req.user || null,
  });
}

// 异步错误包装器
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  StorageExceededError,
};
