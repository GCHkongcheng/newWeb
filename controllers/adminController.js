const { FileModel, UserModel } = require("../models/dataStore");

// 管理后台首页
exports.dashboard = async (req, res) => {
  try {
    const users = UserModel.findAll();
    const files = FileModel.findAll();

    const stats = {
      totalUsers: users.length,
      totalFiles: files.length,
      publicFiles: files.filter((f) => f.isPublic).length,
      privateFiles: files.filter((f) => !f.isPublic).length,
    };

    res.render("admin/dashboard", {
      user: { username: req.session.username, isAdmin: true },
      stats: stats,
    });
  } catch (error) {
    console.error("加载管理后台错误:", error);
    res.render("error", {
      message: "加载管理后台失败",
      error: error,
      user: { username: req.session.username, isAdmin: true },
    });
  }
};

// 用户管理
exports.users = async (req, res) => {
  try {
    const users = UserModel.findAll();

    res.render("admin/users", {
      user: { username: req.session.username, isAdmin: true },
      users: users,
    });
  } catch (error) {
    console.error("获取用户列表错误:", error);
    res.render("error", {
      message: "获取用户列表失败",
      error: error,
      user: { username: req.session.username, isAdmin: true },
    });
  }
};

// 文件管理
exports.files = async (req, res) => {
  try {
    const files = FileModel.findAll();

    // 为每个文件添加上传者信息
    const filesWithUploader = files.map((file) => {
      const uploader = UserModel.findById(file.userId);
      return {
        ...file,
        uploaderName: uploader ? uploader.username : "未知用户",
      };
    });

    res.render("admin/files", {
      user: { username: req.session.username, isAdmin: true },
      files: filesWithUploader,
    });
  } catch (error) {
    console.error("获取文件列表错误:", error);
    res.render("error", {
      message: "获取文件列表失败",
      error: error,
      user: { username: req.session.username, isAdmin: true },
    });
  }
};

// 删除文件（管理员）
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const deleted = FileModel.delete(fileId);

    if (deleted) {
      res.json({ success: true, message: "文件已删除" });
    } else {
      res.json({ success: false, message: "文件不存在或删除失败" });
    }
  } catch (error) {
    console.error("删除文件错误:", error);
    res.json({ success: false, message: "删除失败: " + error.message });
  }
};
