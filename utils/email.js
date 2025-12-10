const nodemailer = require("nodemailer");
const config = require("../config/config");

// 创建邮件传输器
function createTransporter() {
  // 根据邮箱类型自动选择配置
  const email = config.email.user.toLowerCase();

  if (email.includes("@qq.com")) {
    return nodemailer.createTransport({
      service: "qq",
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  } else if (email.includes("@163.com")) {
    return nodemailer.createTransport({
      host: "smtp.163.com",
      port: 465,
      secure: true, // 使用 SSL
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  } else if (email.includes("@126.com")) {
    return nodemailer.createTransport({
      host: "smtp.126.com",
      port: 465,
      secure: true,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  } else if (email.includes("@gmail.com")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  } else {
    // 默认配置
    return nodemailer.createTransport({
      host: "smtp." + email.split("@")[1],
      port: 465,
      secure: true,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
}

// 生成6位数验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码邮件
async function sendVerificationEmail(to, code) {
  if (!config.email.user || !config.email.pass) {
    console.warn("⚠️  邮件配置未设置，验证码已在控制台显示");
    console.log(`📧 验证码 [${to}]: ${code}`);
    return { success: true, message: "开发模式：验证码已在控制台显示" };
  }

  const transporter = createTransporter();
  const mailOptions = {
    from: config.email.user,
    to: to,
    subject: "个人网盘 - 注册验证码",
    html: `
      <div style="padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333;">验证码</h2>
          <p>您好！</p>
          <p>您正在注册个人网盘账号，您的验证码是：</p>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666;">验证码有效期为 10 分钟，请尽快使用。</p>
          <p style="color: #999; font-size: 12px;">如果这不是您的操作，请忽略此邮件。</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ 验证码邮件已发送至: ${to}`);
    return { success: true, message: "验证码已发送" };
  } catch (error) {
    console.error("❌ 发送邮件失败:", error);
    // 开发环境下，即使发送失败也在控制台显示验证码
    console.log(`📧 验证码 [${to}]: ${code}`);
    return { success: false, message: "邮件发送失败，请检查邮件配置" };
  }
}

module.exports = {
  sendVerificationEmail,
  generateVerificationCode,
};
