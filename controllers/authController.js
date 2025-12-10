const { UserModel, VerificationCodeModel } = require("../models/dataStore");
const {
  sendVerificationEmail,
  generateVerificationCode,
} = require("../utils/email");

// 显示注册页面
exports.showRegister = (req, res) => {
  res.render("auth/register", { error: null, success: null });
};

// 显示登录页面
exports.showLogin = (req, res) => {
  res.render("auth/login", { error: null });
};

// 发送验证码
exports.sendCode = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.json({ success: false, message: "邮箱和用户名不能为空" });
    }

    // 检查邮箱是否已注册
    const existingUserByEmail = UserModel.findByEmail(email);
    if (existingUserByEmail) {
      return res.json({ success: false, message: "该邮箱已被注册" });
    }

    // 检查用户名是否已存在
    const existingUserByUsername = UserModel.findByUsername(username);
    if (existingUserByUsername) {
      return res.json({ success: false, message: "该用户名已被使用" });
    }

    // 生成验证码
    const code = generateVerificationCode();

    // 保存验证码
    VerificationCodeModel.save(email, code);

    // 发送邮件
    const result = await sendVerificationEmail(email, code);

    res.json(result);
  } catch (error) {
    console.error("发送验证码错误:", error);
    res.json({ success: false, message: "服务器错误" });
  }
};

// 注册处理
exports.register = async (req, res) => {
  try {
    const { username, email, verificationCode, password, confirmPassword } =
      req.body;

    // 验证输入
    if (
      !username ||
      !email ||
      !verificationCode ||
      !password ||
      !confirmPassword
    ) {
      return res.render("auth/register", {
        error: "所有字段都是必填的",
        success: null,
      });
    }

    // 验证密码
    if (password !== confirmPassword) {
      return res.render("auth/register", {
        error: "两次输入的密码不一致",
        success: null,
      });
    }

    if (password.length < 6) {
      return res.render("auth/register", {
        error: "密码长度至少为6位",
        success: null,
      });
    }

    // 检查用户名和邮箱是否已存在
    if (UserModel.findByEmail(email)) {
      return res.render("auth/register", {
        error: "该邮箱已被注册",
        success: null,
      });
    }

    if (UserModel.findByUsername(username)) {
      return res.render("auth/register", {
        error: "该用户名已被使用",
        success: null,
      });
    }

    // 验证验证码
    if (!VerificationCodeModel.verify(email, verificationCode)) {
      return res.render("auth/register", {
        error: "验证码错误或已过期",
        success: null,
      });
    }

    // 创建用户
    await UserModel.create({
      username,
      email,
      password,
      isAdmin: false,
    });

    // 删除已使用的验证码
    VerificationCodeModel.delete(email);

    res.render("auth/register", {
      error: null,
      success: "注册成功！请登录",
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.render("auth/register", {
      error: "服务器错误，请稍后重试",
      success: null,
    });
  }
};

// 登录处理
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.render("auth/login", {
        error: "邮箱/用户名和密码不能为空",
      });
    }

    // 查找用户
    const user = UserModel.findByEmailOrUsername(identifier);

    if (!user) {
      return res.render("auth/login", {
        error: "用户不存在",
      });
    }

    // 验证密码
    const isValidPassword = await UserModel.validatePassword(
      password,
      user.password
    );

    if (!isValidPassword) {
      return res.render("auth/login", {
        error: "密码错误",
      });
    }

    // 设置 session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.email = user.email;
    req.session.isAdmin = user.isAdmin;

    // 重定向
    if (user.isAdmin) {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/files");
    }
  } catch (error) {
    console.error("登录错误:", error);
    res.render("auth/login", {
      error: "服务器错误，请稍后重试",
    });
  }
};

// 登出
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("登出错误:", err);
    }
    res.redirect("/auth/login");
  });
};
