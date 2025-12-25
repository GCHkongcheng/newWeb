const { FileModel, UserModel, CategoryModel } = require("../models/dataStore");
const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const jschardet = require("jschardet");

// 显示文件列表页面
exports.showFiles = async (req, res) => {
  try {
    const userId = req.session.userId;
    const files = await FileModel.findByUserId(userId);
    const categories = await CategoryModel.findAll();

    // 为文件添加 id 字段（兼容视图）
    const filesWithId = files.map(file => {
      const fileObj = file.toObject ? file.toObject() : file;
      return {
        ...fileObj,
        id: fileObj._id.toString()
      };
    });

    // 计算存储空间
    const usedStorage = await FileModel.getUserStorageUsed(userId);
    const maxStorage = 500 * 1024 * 1024; // 500MB
    const storagePercent = ((usedStorage / maxStorage) * 100).toFixed(1);

    res.render("files/index", {
      user: { username: req.session.username },
      files: filesWithId,
      categories: categories,
      usedStorage: usedStorage,
      maxStorage: maxStorage,
      storagePercent: storagePercent,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error("获取文件列表错误:", error);
    res.render("error", {
      message: "获取文件列表失败",
      error: error,
      user: { username: req.session.username },
    });
  }
};

// 上传文件
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "没有上传文件" });
    }

    const userId = req.session.userId;
    const isPublic = req.body.isPublic === "true";
    const description = req.body.description || "";
    const category = req.body.category || "other";

    // 检查用户存储空间
    const maxStorage = 500 * 1024 * 1024; // 500MB
    const usedStorage = await FileModel.getUserStorageUsed(userId);
    const fileSize = req.file.size;

    if (usedStorage + fileSize > maxStorage) {
      // 删除已上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `存储空间不足！当前已使用 ${(
          usedStorage /
          1024 /
          1024
        ).toFixed(2)}MB，该文件大小 ${(fileSize / 1024 / 1024).toFixed(
          2
        )}MB，总容量 500MB`,
      });
    }

    // 创建文件记录
    const fileRecord = await FileModel.create({
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      isPublic: isPublic,
      description: description,
      category: category,
    });

    res.json({
      success: true,
      message: "文件上传成功",
      file: fileRecord,
    });
  } catch (error) {
    console.error("上传文件错误:", error);
    res.status(500).json({
      success: false,
      message: "文件上传失败: " + error.message,
    });
  }
};

// 创建文件
exports.createFile = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { filename, content, category, isPublic, description } = req.body;

    // 验证输入
    if (!filename || !content) {
      return res.status(400).json({
        success: false,
        message: "文件名和内容不能为空",
      });
    }

    // 验证文件名字符
    const invalidChars = /[\/\\:*?"<>|]/;
    if (invalidChars.test(filename)) {
      return res.status(400).json({
        success: false,
        message: '文件名不能包含以下字符: / \\ : * ? " < > |',
      });
    }

    // 检查内容大小（5MB限制）
    const contentBuffer = Buffer.from(content, "utf8");
    const contentSize = contentBuffer.length;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (contentSize > maxSize) {
      return res.status(400).json({
        success: false,
        message: `文件内容过大！当前: ${(contentSize / 1024 / 1024).toFixed(
          2
        )}MB，最大: 5MB`,
      });
    }

    // 检查用户存储空间
    const maxStorage = 500 * 1024 * 1024; // 500MB
    const usedStorage = await FileModel.getUserStorageUsed(userId);
    if (usedStorage + contentSize > maxStorage) {
      return res.status(400).json({
        success: false,
        message: `存储空间不足！当前已使用 ${(
          usedStorage /
          1024 /
          1024
        ).toFixed(2)}MB，该文件大小 ${(contentSize / 1024 / 1024).toFixed(
          2
        )}MB，总容量 500MB`,
      });
    }

    // 确定MIME类型
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    const mimeTypes = {
      ".txt": "text/plain",
      ".md": "text/markdown",
      ".js": "text/javascript",
      ".py": "text/x-python",
      ".html": "text/html",
      ".css": "text/css",
      ".json": "application/json",
      ".xml": "application/xml",
      ".sql": "text/x-sql",
      ".sh": "text/x-sh",
      ".yaml": "text/yaml",
      ".yml": "text/yaml",
      ".java": "text/x-java",
      ".cpp": "text/x-c++src",
      ".c": "text/x-c",
      ".php": "text/x-php",
      ".rb": "text/x-ruby",
      ".go": "text/x-go",
      ".rs": "text/x-rustsrc",
      ".ts": "text/typescript",
      ".vue": "text/x-vue",
      ".jsx": "text/jsx",
      ".tsx": "text/tsx",
    };
    const mimetype = mimeTypes[ext] || "text/plain";

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    const generatedFilename = `file-${timestamp}-${randomNum}${ext || ".txt"}`;

    // 确保用户目录存在
    const userDir = path.join(__dirname, "..", "storage", "user_files", userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // 保存文件到磁盘
    const filePath = path.join(userDir, generatedFilename);
    fs.writeFileSync(filePath, content, "utf8");

    // 创建文件记录
    const fileRecord = await FileModel.create({
      userId: userId,
      filename: generatedFilename,
      originalName: filename,
      path: filePath,
      size: contentSize,
      mimetype: mimetype,
      isPublic: isPublic || false,
      description: description || "",
      category: category || "other",
    });

    res.json({
      success: true,
      message: "文件创建成功",
      file: fileRecord,
    });
  } catch (error) {
    console.error("创建文件错误:", error);
    res.status(500).json({
      success: false,
      message: "文件创建失败: " + error.message,
    });
  }
};

// 查看文件内容
exports.viewFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FileModel.findById(fileId);

    if (!file) {
      return res.status(404).render("error", {
        message: "文件不存在",
        error: { status: 404 },
        user: { username: req.session.username },
      });
    }

    // 检查权限（私有文件只能所有者查看）
    // file.userId 被 populate 后是对象 {_id, username}
    const fileOwnerId = file.userId._id
      ? file.userId._id.toString()
      : file.userId.toString();

    if (
      !file.isPublic &&
      fileOwnerId !== req.session.userId &&
      !req.session.isAdmin
    ) {
      return res.status(403).render("error", {
        message: "无权访问此文件",
        error: { status: 403 },
        user: { username: req.session.username },
      });
    }

    // 检查是否为图片文件
    const ext = path.extname(file.originalName).toLowerCase();
    const imageExts = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    const isImage = imageExts.includes(ext);

    // 读取文件内容并自动检测编码（仅对非图片文件）
    let content = "";
    if (!isImage) {
      try {
        const buffer = fs.readFileSync(file.path);

        // 检测文件编码
        const detected = jschardet.detect(buffer);
        const encoding = detected.encoding;

        // 根据检测到的编码读取文件
        if (
          encoding &&
          encoding.toLowerCase() !== "utf-8" &&
          encoding.toLowerCase() !== "ascii"
        ) {
          // 如果是 GBK、GB2312 等编码，转换为 UTF-8
          if (iconv.encodingExists(encoding)) {
            content = iconv.decode(buffer, encoding);
          } else {
            // 尝试常见的中文编码
            try {
              content = iconv.decode(buffer, "gbk");
            } catch (e) {
              content = buffer.toString("utf8");
            }
          }
        } else {
          content = buffer.toString("utf8");
        }
      } catch (error) {
        console.error("读取文件编码错误:", error);
        content = fs.readFileSync(file.path, "utf8");
      }
    }

    // 获取上传者信息
    const uploader = await UserModel.findById(file.userId);

    res.render("files/view", {
      user: { username: req.session.username },
      file: file,
      content: content,
      uploader: uploader,
    });
  } catch (error) {
    console.error("查看文件错误:", error);
    res.render("error", {
      message: "无法读取文件",
      error: error,
      user: { username: req.session.username },
    });
  }
};

// 下载文件
exports.downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FileModel.findById(fileId);

    if (!file) {
      return res.status(404).send("文件不存在");
    }

    // 检查权限
    // file.userId 被 populate 后是对象 {_id, username}
    const fileOwnerId = file.userId._id
      ? file.userId._id.toString()
      : file.userId.toString();

    if (
      !file.isPublic &&
      fileOwnerId !== req.session.userId &&
      !req.session.isAdmin
    ) {
      return res.status(403).send("无权访问此文件");
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error("下载文件错误:", error);
    res.status(500).send("下载失败");
  }
};

// 删除文件（直接删除）
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FileModel.findById(fileId);

    if (!file) {
      return res.json({ success: false, message: "文件不存在" });
    }

    // 检查权限（只有所有者或管理员可以删除）
    // file.userId 被 populate 后是对象 {_id, username}
    const fileOwnerId = file.userId._id
      ? file.userId._id.toString()
      : file.userId.toString();

    if (fileOwnerId !== req.session.userId && !req.session.isAdmin) {
      return res.json({ success: false, message: "无权删除此文件" });
    }

    // 删除物理文件
    const fs = require("fs");
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // 从数据库中删除文件记录
    await FileModel.delete(fileId);

    res.json({ success: true, message: "文件已删除" });
  } catch (error) {
    console.error("删除文件错误:", error);
    res.json({ success: false, message: "删除失败: " + error.message });
  }
};

// 重命名文件
exports.renameFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const { newName } = req.body;
    const userId = req.session.userId;

    if (!newName || !newName.trim()) {
      return res.status(400).json({
        success: false,
        message: "新文件名不能为空",
      });
    }

    // 验证文件名字符
    const invalidChars = /[\/\\:*?"<>|]/;
    if (invalidChars.test(newName)) {
      return res.status(400).json({
        success: false,
        message: '文件名不能包含以下字符: / \\ : * ? " < > |',
      });
    }

    // 查找文件
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "文件不存在" });
    }

    // 检查权限
    const fileOwnerId = file.userId._id
      ? file.userId._id.toString()
      : file.userId.toString();

    if (fileOwnerId !== userId && !req.session.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "无权修改此文件" });
    }

    // 更新文件记录中的 originalName
    await FileModel.update(fileId, { originalName: newName.trim() });

    res.json({
      success: true,
      message: "文件重命名成功",
    });
  } catch (error) {
    console.error("重命名文件错误:", error);
    res.status(500).json({
      success: false,
      message: "重命名失败: " + error.message,
    });
  }
};

// 移动文件（更改分类）
exports.moveFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const { category } = req.body;
    const userId = req.session.userId;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "请选择目标分类",
      });
    }

    // 验证分类是否有效
    const validCategories = ["code", "memo", "image", "other"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "无效的分类",
      });
    }

    // 查找文件
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "文件不存在" });
    }

    // 检查权限
    const fileOwnerId = file.userId._id
      ? file.userId._id.toString()
      : file.userId.toString();

    if (fileOwnerId !== userId && !req.session.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "无权移动此文件" });
    }

    // 更新文件分类
    await FileModel.update(fileId, { category: category });

    res.json({
      success: true,
      message: "文件移动成功",
    });
  } catch (error) {
    console.error("移动文件错误:", error);
    res.status(500).json({
      success: false,
      message: "移动失败: " + error.message,
    });
  }
};

// 创建分类
exports.createCategory = async (req, res) => {
  res.status(404).json({ success: false, message: "功能已禁用" });
};

// 更新分类
exports.updateCategory = async (req, res) => {
  res.status(404).json({ success: false, message: "功能已禁用" });
};

// 删除分类
exports.deleteCategory = async (req, res) => {
  res.status(404).json({ success: false, message: "功能已禁用" });
};

// 更新文件分类
exports.updateFileCategory = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { fileId, category } = req.body;

    const file = await FileModel.findById(fileId);

    if (!file) {
      return res.json({ success: false, message: "文件不存在" });
    }

    if (file.userId !== userId && !req.session.isAdmin) {
      return res.json({ success: false, message: "无权修改此文件" });
    }

    const updated = await FileModel.update(fileId, { category });

    if (updated) {
      res.json({ success: true, message: "分类更新成功" });
    } else {
      res.json({ success: false, message: "更新失败" });
    }
  } catch (error) {
    console.error("更新文件分类错误:", error);
    res.json({ success: false, message: "更新失败: " + error.message });
  }
};

// 更改文件权限
exports.changePermission = async (req, res) => {
  try {
    const fileId = req.params.id;
    const { isPublic } = req.body;
    const userId = req.session.userId;

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "权限参数无效",
      });
    }

    // 查找文件
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "文件不存在" });
    }

    // 检查权限
    const fileOwnerId = file.userId._id
      ? file.userId._id.toString()
      : file.userId.toString();

    if (fileOwnerId !== userId && !req.session.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "无权修改此文件" });
    }

    // 更新文件权限
    await FileModel.update(fileId, { isPublic: isPublic });

    res.json({
      success: true,
      message: `文件已设为${isPublic ? "公开" : "私有"}`,
    });
  } catch (error) {
    console.error("更改文件权限错误:", error);
    res.status(500).json({
      success: false,
      message: "权限更改失败: " + error.message,
    });
  }
};
