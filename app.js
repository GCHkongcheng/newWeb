const express = require("express");
const session = require("express-session");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const MongoStore = require("connect-mongo").default;
const config = require("./config/config");
const { initAdmin } = require("./models/init");
const connectDB = require("./config/database");
const { initializeData } = require("./models/dataStore");
const { getUserFromSession } = require("./middlewares/userContext");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// 连接MongoDB
connectDB().then(async () => {
  // 初始化默认数据
  await initializeData();
  // 初始化管理员账户
  await initAdmin();
});

// 安全配置
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'", // Alpine.js 需要 eval
          "cdn.tailwindcss.com", // Tailwind Play CDN
        ],
        scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"], // 允许内联事件处理器
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null,
      },
    },
    crossOriginOpenerPolicy: false, // 避免 COOP 警告
  })
);

// 性能优化
app.use(compression());

// 日志记录
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

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
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI || "mongodb://localhost:27017/personal_cloud",
      ttl: 24 * 60 * 60, // 1天
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      httpOnly: true,
      // 注意：生产环境如果使用 HTTPS，请设置 secure: true
      secure:
        process.env.NODE_ENV === "production" && process.env.HTTPS === "true",
    },
  })
);

// 用户上下文中间件（在所有路由之前）
app.use(getUserFromSession);

// 视图引擎配置
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 路由配置
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");
const commentRoutes = require("./routes/comments");
const profileRoutes = require("./routes/profile");
const aboutRoutes = require("./routes/about");

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
app.use("/comments", commentRoutes);
app.use("/profile", profileRoutes);
app.use("/about", aboutRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).render("error", {
    message: "页面不存在",
    error: { status: 404 },
    user: req.user || null,
  });
});

// 统一错误处理中间件
app.use(errorHandler);

// 启动服务器
async function start() {
  try {
    const PORT = config.port;
    const HOST = config.host;
    app.listen(PORT, HOST, () => {
      console.log("");
      console.log("=".repeat(50));
      console.log("🚀 个人网盘系统已启动！");
      console.log("=".repeat(50));
      console.log(`📍 本地访问: http://localhost:${PORT}`);
      console.log(`📍 局域网访问: http://10.152.60.249:${PORT}`);
      console.log(`⏰ 启动时间: ${new Date().toLocaleString("zh-CN")}`);
      console.log("");
      console.log("📝 快速开始:");
      console.log("   1. 本地: http://localhost:" + PORT);
      console.log("   2. 局域网: http://10.152.60.249:" + PORT);
      console.log("   3. 使用管理员账号登录或注册新账号");
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
