const { UserModel } = require("./dataStore");
const config = require("../config/config");

// 初始化管理员账号
async function initAdmin() {
  const adminEmail = config.admin.email;
  const existingAdmin = await UserModel.findByEmail(adminEmail);

  if (!existingAdmin) {
    try {
      const admin = await UserModel.create({
        username: config.admin.username,
        email: adminEmail,
        password: config.admin.password,
        isAdmin: true,
      });
      console.log("✅ 管理员账号已创建:");
      console.log(`   用户名: ${admin.username}`);
      console.log(`   邮箱: ${admin.email}`);
      console.log(`   密码: ${config.admin.password}`);
    } catch (error) {
      console.error("❌ 创建管理员账号失败:", error);
    }
  } else {
    console.log("ℹ️  管理员账号已存在");
  }
}

module.exports = { initAdmin };
