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

    // 为每个文件添加上传者信息和id字段
    const filesWithUploader = await Promise.all(
      files.map(async (file) => {
        const uploader = await UserModel.findById(file.userId);
        const fileObj = file.toObject();
        return {
          ...fileObj,
          id: fileObj._id.toString(),
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
      return res.json({ success: true, message: "文件已删除" });
    } else {
      return res.json({ success: false, message: "文件不存在或删除失败" });
    }
  } catch (error) {
    console.error("删除文件错误:", error);
    return res
      .status(500)
      .json({ success: false, message: "删除失败，请稍后重试" });
  }
};

// 更新用户存储配额
exports.updateUserQuota = async (req, res, next) => {
  try {
    const { userId, quota } = req.body;
    const quotaBytes = parseFloat(quota) * 1024 * 1024; // MB转字节

    await UserModel.update(userId, { storageQuota: quotaBytes });
    return res.json({ success: true, message: "配额更新成功" });
  } catch (error) {
    console.error("更新配额错误:", error);
    return res.status(500).json({ success: false, message: "更新失败" });
  }
};

// 删除用户（管理员）
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // 不能删除自己
    if (userId === req.session.userId) {
      return res.json({ success: false, message: "不能删除自己的账号" });
    }

    // 删除用户的所有文件
    const userFiles = await FileModel.findByUserId(userId);
    for (const file of userFiles) {
      await FileModel.delete(file.id);
    }

    // 删除用户
    const deleted = await UserModel.delete(userId);

    if (deleted) {
      return res.json({ success: true, message: "用户已删除" });
    } else {
      return res.json({ success: false, message: "用户不存在或删除失败" });
    }
  } catch (error) {
    console.error("删除用户错误:", error);
    return res
      .status(500)
      .json({ success: false, message: "删除失败，请稍后重试" });
  }
};
