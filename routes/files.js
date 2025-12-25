const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const { requireAuth } = require("../middlewares/auth");
const {
  validateFileUpload,
  validateRenameFile,
  validateMoveFile,
  validateChangePermission,
} = require("../middlewares/validation");
const upload = require("../utils/upload");

// 所有文件路由都需要登录
router.use(requireAuth);

// 文件列表页面
router.get("/", fileController.showFiles);

// 上传文件
router.post(
  "/upload",
  upload.single("file"),
  validateFileUpload,
  fileController.uploadFile
);

// 创建文件
router.post("/create", fileController.createFile);

// 查看文件
router.get("/view/:id", fileController.viewFile);

// 下载文件
router.get("/download/:id", fileController.downloadFile);

// 重命名文件
router.put("/:id/rename", validateRenameFile, fileController.renameFile);

// 移动文件（更改分类）
router.put("/:id/move", validateMoveFile, fileController.moveFile);

// 更改文件权限
router.put(
  "/:id/permission",
  validateChangePermission,
  fileController.changePermission
);

// 删除文件
router.delete("/:id", fileController.deleteFile);

// 分类管理
router.post("/category/create", fileController.createCategory);
router.put("/category/update", fileController.updateCategory);
router.delete("/category/delete", fileController.deleteCategory);
router.put("/category/update-file", fileController.updateFileCategory);

module.exports = router;
