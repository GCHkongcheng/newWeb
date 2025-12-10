const express = require("express");
const session = require("express-session");
const path = require("path");
const config = require("./config/config");
const { initAdmin } = require("./models/init");

const app = express();

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session 配置
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24小时
    },
  })
);

// 视图引擎配置
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 路由配置
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

// 首页重定向
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/files");
  } else {
    res.redirect("/auth/login");
  }
});

// 挂载路由
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/public", publicRoutes);
app.use("/admin", adminRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).render("error", {
    message: "页面不存在",
    error: { status: 404 },
    user: req.session.userId ? { username: req.session.username } : null,
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error("应用错误:", err);
  res.status(err.status || 500).render("error", {
    message: err.message || "服务器错误",
    error: err,
    user: req.session.userId ? { username: req.session.username } : null,
  });
});

// 启动服务器
async function start() {
  try {
    // 初始化管理员账号
    await initAdmin();

    const PORT = config.port;
    app.listen(PORT, () => {
      console.log("");
      console.log("=".repeat(50));
      console.log("🚀 个人网盘系统已启动！");
      console.log("=".repeat(50));
      console.log(`📍 访问地址: http://localhost:${PORT}`);
      console.log(`⏰ 启动时间: ${new Date().toLocaleString("zh-CN")}`);
      console.log("");
      console.log("📝 快速开始:");
      console.log("   1. 打开浏览器访问 http://localhost:" + PORT);
      console.log("   2. 使用管理员账号登录或注册新账号");
      console.log("");
      console.log("⚠️  提醒:");
      console.log("   - 首次启动会自动创建管理员账号");
      console.log("   - 如需发送邮件验证码，请配置 .env 文件");
      console.log("   - 开发模式下验证码会在控制台显示");
      console.log("=".repeat(50));
      console.log("");
    });
  } catch (error) {
    console.error("❌ 启动失败:", error);
    process.exit(1);
  }
}

start();
