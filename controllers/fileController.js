const { FileModel, UserModel } = require("../models/dataStore");
const fs = require("fs");
const path = require("path");

// 显示文件列表页面
exports.showFiles = async (req, res) => {
  try {
    const userId = req.session.userId;
    const files = FileModel.findByUserId(userId);

    res.render("files/index", {
      user: { username: req.session.username },
      files: files,
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

    // 创建文件记录
    const fileRecord = FileModel.create({
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      isPublic: isPublic,
      description: description,
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

// 查看文件内容
exports.viewFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = FileModel.findById(fileId);

    if (!file) {
      return res.status(404).render("error", {
        message: "文件不存在",
        error: { status: 404 },
        user: { username: req.session.username },
      });
    }

    // 检查权限（私有文件只能所有者查看）
    if (
      !file.isPublic &&
      file.userId !== req.session.userId &&
      !req.session.isAdmin
    ) {
      return res.status(403).render("error", {
        message: "无权访问此文件",
        error: { status: 403 },
        user: { username: req.session.username },
      });
    }

    // 读取文件内容
    const content = fs.readFileSync(file.path, "utf8");

    // 获取上传者信息
    const uploader = UserModel.findById(file.userId);

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
    const file = FileModel.findById(fileId);

    if (!file) {
      return res.status(404).send("文件不存在");
    }

    // 检查权限
    if (
      !file.isPublic &&
      file.userId !== req.session.userId &&
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

// 删除文件
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = FileModel.findById(fileId);

    if (!file) {
      return res.json({ success: false, message: "文件不存在" });
    }

    // 检查权限（只有所有者或管理员可以删除）
    if (file.userId !== req.session.userId && !req.session.isAdmin) {
      return res.json({ success: false, message: "无权删除此文件" });
    }

    // 删除文件
    const deleted = FileModel.delete(fileId);

    if (deleted) {
      res.json({ success: true, message: "文件已删除" });
    } else {
      res.json({ success: false, message: "删除失败" });
    }
  } catch (error) {
    console.error("删除文件错误:", error);
    res.json({ success: false, message: "删除失败: " + error.message });
  }
};
