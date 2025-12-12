const { UserModel } = require("../models/dataStore");
const bcrypt = require("bcryptjs");

// 显示用户中心页面
exports.showProfile = async (req, res) => {
  try {
    const user = UserModel.findById(req.session.userId);

    if (!user) {
      return res.redirect("/auth/login");
    }

    res.render("profile/index", {
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      success: null,
      error: null,
    });
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

    // 验证输入
    if (!newUsername || !password) {
      const user = UserModel.findById(userId);
      return res.render("profile/index", {
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        success: null,
        error: "用户名和密码不能为空",
      });
    }

    // 验证用户名长度
    if (newUsername.length < 2 || newUsername.length > 20) {
      const user = UserModel.findById(userId);
      return res.render("profile/index", {
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        success: null,
        error: "用户名长度应在2-20个字符之间",
      });
    }

    // 查找用户
    const user = UserModel.findById(userId);

    if (!user) {
      return res.redirect("/auth/login");
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.render("profile/index", {
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        success: null,
        error: "密码错误",
      });
    }

    // 检查新用户名是否已被使用
    const existingUser = UserModel.findByUsername(newUsername);
    if (existingUser && existingUser.id !== userId) {
      return res.render("profile/index", {
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        success: null,
        error: "该用户名已被使用",
      });
    }

    // 更新用户名
    UserModel.update(userId, { username: newUsername });

    // 更新 session
    req.session.username = newUsername;

    const updatedUser = UserModel.findById(userId);
    res.render("profile/index", {
      user: {
        userId: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
      },
      success: "用户名修改成功",
      error: null,
    });
  } catch (error) {
    console.error("修改用户名错误:", error);
    const user = UserModel.findById(req.session.userId);
    res.render("profile/index", {
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      success: null,
      error: "修改失败，请稍后重试",
    });
  }
};

// 修改密码
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
      const user = UserModel.findById(userId);
      return res.render("profile/index", {
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        success: null,
        error: "所有密码字段都是必填的",
      });
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      const user = UserModel.findById(userId);
      return res.render("profile/index", {
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        success: null,
        error: "新密码长度至少为6个字符",
      });
    }

    // 验证两次新密码是否一致
    if (newPassword !== confirmPassword) {
      const user = UserModel.findById(userId);
      return res.render("profile/index", {
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        success: null,
        error: "两次输入的新密码不一致",
      });
    }

    // 查找用户
    const user = UserModel.findById(userId);

    if (!user) {
      return res.redirect("/auth/login");
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return res.render("profile/index", {
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        success: null,
        error: "当前密码错误",
      });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    UserModel.update(userId, { password: hashedPassword });

    const updatedUser = UserModel.findById(userId);
    res.render("profile/index", {
      user: {
        userId: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
      },
      success: "密码修改成功",
      error: null,
    });
  } catch (error) {
    console.error("修改密码错误:", error);
    const user = UserModel.findById(req.session.userId);
    res.render("profile/index", {
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      success: null,
      error: "修改失败，请稍后重试",
    });
  }
};
