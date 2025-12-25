const mongoose = require("mongoose");
const User = require("./models/schemas/User");

mongoose
  .connect("mongodb://localhost:27017/personal_cloud")
  .then(async () => {
    const users = await User.find().select("username email isAdmin createdAt");
    console.log("\n当前数据库中的用户:");
    users.forEach((u) => {
      console.log(
        `  ${u.isAdmin ? "[管理员]" : "[普通用户]"} ${u.username} | ${
          u.email
        } | ${u.createdAt}`
      );
    });
    console.log(`\n总计: ${users.length} 个用户\n`);

    // 检查特定邮箱
    const testEmail = "2839474636@qq.com";
    const existingUser = await User.findOne({ email: testEmail });
    console.log(`检查邮箱 ${testEmail}:`);
    if (existingUser) {
      console.log(
        `  ❌ 存在！用户名: ${existingUser.username}, 注册时间: ${existingUser.createdAt}`
      );
    } else {
      console.log(`  ✅ 不存在，可以注册`);
    }

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
