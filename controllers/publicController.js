const { FileModel, UserModel } = require("../models/dataStore");

// 显示公共资源页面
exports.showPublic = async (req, res, next) => {
  try {
    const publicFiles = await FileModel.findPublic();

    // 为每个文件添加上传者信息
    const filesWithUploader = await Promise.all(
      publicFiles.map(async (file) => {
        const uploader = await UserModel.findById(file.userId);
        const fileObj = file.toObject();
        return {
          ...fileObj,
          id: fileObj._id.toString(),
          uploaderName: uploader ? uploader.username : "未知用户",
        };
      })
    );

    res.render("public/index", {
      user: req.user,
      files: filesWithUploader,
    });
  } catch (error) {
    next(error);
  }
};
