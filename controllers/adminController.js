const { FileModel, UserModel } = require("../models/dataStore");

// 管理后台首页
exports.dashboard = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();
    const files = await FileModel.findAll();

    const stats = {
      totalUsers: users.length,
      totalFiles: files.length,
      publicFiles: files.filter((f) => f.isPublic).length,
      privateFiles: files.filter((f) => !f.isPublic).length,
    };

    res.render("admin/dashboard", {
      user: req.user,
      stats: stats,
    });
  } catch (error) {
    next(error);
  }
};

// 用户管理
exports.users = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();

    res.render("admin/users", {
      user: req.user,
      users: users,
    });
  } catch (error) {
    next(error);
  }
};

// 文件管理
exports.files = async (req, res, next) => {
  try {
    const files = await FileModel.findAll();

    // 为每个文件添加上传者信息
    const filesWithUploader = await Promise.all(
      files.map(async (file) => {
        const uploader = await UserModel.findById(file.userId);
        return {
          ...file.toObject(),
          uploaderName: uploader ? uploader.username : "未知用户",
        };
      })
    );

    res.render("admin/files", {
      user: req.user,
      files: filesWithUploader,
    });
  } catch (error) {
    next(error);
  }
};

// 删除文件（管理员）
exports.deleteFile = async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const deleted = await FileModel.delete(fileId);

    if (deleted) {
      res.json({ success: true, message: "文件已删除" });
    } else {
      res.json({ success: false, message: "文件不存在或删除失败" });
    }
  } catch (error) {
    next(error);
  }
};
