const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const { requireAuth } = require("../middlewares/auth");
const upload = require("../utils/upload");

// 所有文件路由都需要登录
router.use(requireAuth);

// 文件列表页面
router.get("/", fileController.showFiles);

// 上传文件
router.post("/upload", upload.single("file"), fileController.uploadFile);

// 查看文件
router.get("/view/:id", fileController.viewFile);

// 下载文件
router.get("/download/:id", fileController.downloadFile);

// 删除文件
router.delete("/:id", fileController.deleteFile);

// 回收站
router.get("/trash", fileController.showTrash);

// 恢复文件
router.post("/trash/restore/:id", fileController.restoreFile);

// 彻底删除
router.delete("/trash/:id", fileController.permanentDelete);

// 清空回收站
router.post("/trash/empty", fileController.emptyTrash);

module.exports = router;
