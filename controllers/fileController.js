const { FileModel, UserModel, TrashModel } = require("../models/dataStore");
const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const jschardet = require("jschardet");

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

    // 读取文件内容并自动检测编码
    let content;
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

// 删除文件（移到回收站）
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

    // 从文件列表中删除
    const files = FileModel.findAll();
    const filteredFiles = files.filter((f) => f.id !== fileId);
    const fs = require("fs");
    fs.writeFileSync(
      require("path").join(__dirname, "..", "data", "files.json"),
      JSON.stringify(filteredFiles, null, 2)
    );

    // 添加到回收站
    TrashModel.add(file);

    res.json({ success: true, message: "文件已移至回收站" });
  } catch (error) {
    console.error("删除文件错误:", error);
    res.json({ success: false, message: "删除失败: " + error.message });
  }
};

// 显示回收站
exports.showTrash = async (req, res) => {
  try {
    const userId = req.session.userId;
    const trashFiles = TrashModel.findByUserId(userId);

    res.render("files/trash", {
      user: { username: req.session.username },
      files: trashFiles,
    });
  } catch (error) {
    console.error("获取回收站错误:", error);
    res.render("error", {
      message: "获取回收站失败",
      error: error,
      user: { username: req.session.username },
    });
  }
};

// 从回收站恢复
exports.restoreFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = TrashModel.findById(fileId);

    if (!file) {
      return res.json({ success: false, message: "文件不存在" });
    }

    // 检查权限
    if (file.userId !== req.session.userId && !req.session.isAdmin) {
      return res.json({ success: false, message: "无权恢复此文件" });
    }

    // 从回收站恢复
    const restoredFile = TrashModel.restore(fileId);

    if (restoredFile) {
      // 添加回文件列表
      const files = FileModel.findAll();
      const { deletedAt, expireAt, ...fileData } = restoredFile;
      files.push(fileData);
      const fs = require("fs");
      fs.writeFileSync(
        require("path").join(__dirname, "..", "data", "files.json"),
        JSON.stringify(files, null, 2)
      );

      res.json({ success: true, message: "文件已恢复" });
    } else {
      res.json({ success: false, message: "恢复失败" });
    }
  } catch (error) {
    console.error("恢复文件错误:", error);
    res.json({ success: false, message: "恢复失败: " + error.message });
  }
};

// 彻底删除
exports.permanentDelete = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = TrashModel.findById(fileId);

    if (!file) {
      return res.json({ success: false, message: "文件不存在" });
    }

    // 检查权限
    if (file.userId !== req.session.userId && !req.session.isAdmin) {
      return res.json({ success: false, message: "无权删除此文件" });
    }

    const deleted = TrashModel.permanentDelete(fileId);

    if (deleted) {
      res.json({ success: true, message: "文件已彻底删除" });
    } else {
      res.json({ success: false, message: "删除失败" });
    }
  } catch (error) {
    console.error("彻底删除文件错误:", error);
    res.json({ success: false, message: "删除失败: " + error.message });
  }
};

// 清空回收站
exports.emptyTrash = async (req, res) => {
  try {
    const userId = req.session.userId;
    const count = TrashModel.emptyByUserId(userId);

    res.json({ success: true, message: `已清空 ${count} 个文件` });
  } catch (error) {
    console.error("清空回收站错误:", error);
    res.json({ success: false, message: "清空失败: " + error.message });
  }
};
