// 系统常量配置
module.exports = {
  // 存储配置
  MAX_USER_STORAGE: 500 * 1024 * 1024, // 500MB - 用户最大存储空间
  MAX_FILE_CONTENT_SIZE: 5 * 1024 * 1024, // 5MB - 创建文件最大内容大小
  MAX_UPLOAD_SIZE: 3 * 1024 * 1024, // 3MB - 上传文件最大大小

  // 验证码配置
  VERIFICATION_CODE_EXPIRY: 10, // 10分钟 - 验证码过期时间
  VERIFICATION_CODE_LENGTH: 6, // 6位数验证码

  // 文件分类
  FILE_CATEGORIES: {
    CODE: "code",
    MEMO: "memo",
    IMAGE: "image",
    OTHER: "other",
  },

  // 允许的图片扩展名
  IMAGE_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"],

  // 存储警告阈值
  STORAGE_WARNING_THRESHOLD: 70, // 70% 存储空间使用提醒
  STORAGE_DANGER_THRESHOLD: 90, // 90% 存储空间危险提醒
};
