const { FileModel, UserModel } = require("../models/dataStore");

// 显示公共资源页面
exports.showPublic = async (req, res) => {
  try {
    const publicFiles = await FileModel.findPublic();

    // 为每个文件添加上传者信息
    const filesWithUploader = await Promise.all(
      publicFiles.map(async (file) => {
        const uploader = await UserModel.findById(file.userId);
        return {
          ...file.toObject(),
          uploaderName: uploader ? uploader.username : "未知用户",
        };
      })
    );

    res.render("public/index", {
      user: { username: req.session.username },
      files: filesWithUploader,
    });
  } catch (error) {
    console.error("获取公共文件列表错误:", error);
    res.render("error", {
      message: "获取公共文件列表失败",
      error: error,
      user: { username: req.session.username },
    });
  }
};
