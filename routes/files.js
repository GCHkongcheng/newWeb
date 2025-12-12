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

// 分类管理
router.post("/category/create", fileController.createCategory);
router.put("/category/update", fileController.updateCategory);
router.delete("/category/delete", fileController.deleteCategory);
router.put("/category/update-file", fileController.updateFileCategory);

module.exports = router;
