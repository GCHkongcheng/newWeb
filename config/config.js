// 环境变量配置
require("dotenv").config();

const config = {
  port: process.env.PORT || 3000,
  sessionSecret:
    process.env.SESSION_SECRET || "change_this_secret_in_production",
  email: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "admin123",
  },
  uploadPath: "./storage/user_files",
  publicUploadPath: "./storage/public_files",
  dataPath: "./data",
};

module.exports = config;
