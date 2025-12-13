const mongoose = require("mongoose");

// MongoDB连接配置
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/personal_cloud";

// 连接选项
const options = {
  // useNewUrlParser 和 useUnifiedTopology 在 Mongoose 6+ 已是默认值
  serverSelectionTimeoutMS: 5000, // 5秒超时
  socketTimeoutMS: 45000, // 45秒socket超时
};

// 连接MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log("✅ MongoDB连接成功");
    console.log(`📍 数据库: ${mongoose.connection.name}`);
    console.log(`🔗 主机: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB连接失败:", error.message);
    console.error("💡 提示: 请确保MongoDB服务已启动");
    process.exit(1);
  }
};

// 监听连接事件
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose连接已建立");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose连接错误:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose连接已断开");
});

// 优雅关闭
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB连接已通过应用终止关闭");
  process.exit(0);
});

module.exports = connectDB;
