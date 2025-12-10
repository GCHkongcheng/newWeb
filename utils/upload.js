const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config/config");

// 允许的文件扩展名
const ALLOWED_EXTENSIONS = [
  ".txt",
  ".md",
  ".cpp",
  ".py",
  ".js",
  ".html",
  ".css",
  ".json",
  ".xml",
  ".java",
  ".c",
  ".h",
  ".cs",
];

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.session.userId;
    const isPublic = req.body.isPublic === "true";

    let uploadPath;
    if (isPublic) {
      uploadPath = path.join(__dirname, "..", config.publicUploadPath);
    } else {
      uploadPath = path.join(__dirname, "..", config.uploadPath, userId);
    }

    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `不支持的文件类型。允许的类型: ${ALLOWED_EXTENSIONS.join(", ")}`
      ),
      false
    );
  }
};

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制 10MB
  },
});

module.exports = upload;
