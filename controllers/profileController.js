const { UserModel } = require("../models/dataStore");
const bcrypt = require("bcryptjs");

// 辅助函数：渲染用户中心页面
function renderProfile(res, user, success = null, error = null) {
  res.render("profile/index", {
    user: {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      storageQuota: user.storageQuota || 500 * 1024 * 1024,
    },
    success,
    error,
  });
}

// 显示用户中心页面
exports.showProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.session.userId);
    if (!user) {
      return res.redirect("/auth/login");
    }
    renderProfile(res, user);
  } catch (error) {
    console.error("显示用户中心错误:", error);
    res.status(500).render("error", {
      message: "加载用户中心失败",
      error: error,
      user: req.session.userId
        ? {
            username: req.session.username,
            isAdmin: req.session.isAdmin || false,
          }
        : null,
    });
  }
};

// 修改用户名
exports.updateUsername = async (req, res) => {
  try {
    const { newUsername, password } = req.body;
    const userId = req.session.userId;

    // 查找用户（包含密码字段用于验证）
    const user = await UserModel.findById(userId, true);

    if (!user) {
      return res.redirect("/auth/login");
    }

    // 验证输入
    if (!newUsername || !password) {
      return renderProfile(res, user, null, "用户名和密码不能为空");
    }

    // 验证用户名长度（3-30字符，与注册保持一致）
    if (newUsername.length < 3 || newUsername.length > 30) {
      return renderProfile(res, user, null, "用户名长度应在3-30个字符之间");
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return renderProfile(res, user, null, "密码错误");
    }

    // 检查新用户名是否已被使用
    const existingUser = await UserModel.findByUsername(newUsername);
    if (existingUser && existingUser._id.toString() !== userId) {
      return renderProfile(res, user, null, "该用户名已被使用");
    }

    // 更新用户名
    await UserModel.update(userId, { username: newUsername });
    req.session.username = newUsername;

    const updatedUser = await UserModel.findById(userId);
    renderProfile(res, updatedUser, "用户名修改成功");
  } catch (error) {
    console.error("修改用户名错误:", error);
    const user = await UserModel.findById(req.session.userId);
    renderProfile(res, user, null, "修改失败，请稍后重试");
  }
};

// 修改密码
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    // 查找用户（包含密码字段用于验证）
    const user = await UserModel.findById(userId, true);

    if (!user) {
      return res.redirect("/auth/login");
    }

    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
      return renderProfile(res, user, null, "所有密码字段都是必填的");
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return renderProfile(res, user, null, "新密码长度至少为6个字符");
    }

    // 验证两次新密码是否一致
    if (newPassword !== confirmPassword) {
      return renderProfile(res, user, null, "两次输入的新密码不一致");
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return renderProfile(res, user, null, "当前密码错误");
    }

    // 更新密码（update方法内部会自动hash密码）
    await UserModel.update(userId, { password: newPassword });

    const updatedUser = await UserModel.findById(userId);
    renderProfile(res, updatedUser, "密码修改成功");
  } catch (error) {
    console.error("修改密码错误:", error);
    const user = await UserModel.findById(req.session.userId);
    renderProfile(res, user, null, "修改失败，请稍后重试");
  }
};
