# 个人网盘系统

一个基于 Node.js + Express 的轻量级个人网盘系统，支持文件上传、在线预览、公共资源分享和后台管理。

## 功能特性

✨ **用户系统**

- 邮箱验证码注册
- 用户名/邮箱登录
- Session 会话管理

📁 **文件管理**

- 支持多种文本文件格式（txt, md, cpp, py, js, html, css, json, xml, java, c, h, cs）
- 在线查看文件内容
- 文件下载
- 文件删除

🌍 **公共资源区**

- 用户可选择公开文件
- 所有登录用户可查看公共文件
- 显示上传者信息

🔧 **后台管理**

- 查看系统统计数据
- 用户管理
- 文件管理（含删除功能）
- 仅管理员可访问

## 技术栈

- **后端**: Node.js + Express
- **模板引擎**: EJS
- **Session**: express-session
- **文件上传**: multer
- **邮件服务**: nodemailer
- **密码加密**: bcryptjs
- **数据存储**: JSON 文件（本地文件系统）

## 项目结构

```
newWeb/
├── app.js                  # 应用入口文件
├── package.json            # 项目依赖配置
├── .env.example           # 环境变量示例
├── .gitignore             # Git 忽略配置
├── config/                # 配置文件
│   └── config.js          # 应用配置
├── models/                # 数据模型
│   ├── dataStore.js       # 数据存储操作
│   └── init.js            # 初始化脚本
├── controllers/           # 控制器
│   ├── authController.js  # 认证控制器
│   ├── fileController.js  # 文件控制器
│   ├── publicController.js # 公共资源控制器
│   └── adminController.js # 管理后台控制器
├── routes/                # 路由
│   ├── auth.js            # 认证路由
│   ├── files.js           # 文件路由
│   ├── public.js          # 公共资源路由
│   └── admin.js           # 管理路由
├── middlewares/           # 中间件
│   └── auth.js            # 认证中间件
├── utils/                 # 工具函数
│   ├── email.js           # 邮件发送
│   └── upload.js          # 文件上传配置
├── views/                 # 视图模板
│   ├── auth/              # 认证页面
│   ├── files/             # 文件管理页面
│   ├── public/            # 公共资源页面
│   ├── admin/             # 管理后台页面
│   └── partials/          # 公共组件
├── public/                # 静态资源
├── data/                  # 数据文件（自动生成）
└── storage/               # 文件存储（自动生成）
    ├── user_files/        # 用户文件
    └── public_files/      # 公共文件
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
copy .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3000
SESSION_SECRET=your_secret_key_here_change_in_production

# 邮件配置（使用 QQ 邮箱示例）
EMAIL_USER=your_email@qq.com
EMAIL_PASS=your_email_authorization_code

# 管理员账号（首次启动时自动创建）
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**注意**：

- `EMAIL_USER` 和 `EMAIL_PASS` 为可选配置
- 如不配置邮箱，验证码会在控制台显示（开发模式）
- QQ 邮箱需要使用授权码，不是登录密码
- 获取 QQ 邮箱授权码：登录 QQ 邮箱 → 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV 服务 → 生成授权码

### 3. 启动应用

```bash
npm start
```

开发模式（自动重启）：

```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问：`http://localhost:3000`

## 使用说明

### 首次启动

首次启动时，系统会自动创建管理员账号，账号信息在控制台显示：

```
✅ 管理员账号已创建:
   用户名: admin
   邮箱: admin@example.com
   密码: admin123
```

### 注册新用户

1. 访问注册页面
2. 输入用户名和邮箱
3. 点击"发送验证码"
4. 输入收到的验证码（或查看控制台）
5. 设置密码并确认
6. 完成注册

### 上传文件

1. 登录后进入"我的文件"
2. 点击"上传文件"按钮
3. 选择文件（支持的格式）
4. 可选：勾选"公开此文件"分享到公共区
5. 可选：添加文件描述
6. 点击上传

### 管理员功能

使用管理员账号登录后，可以：

- 查看系统统计数据
- 管理所有用户
- 查看和删除所有文件
- 访问后台管理页面

## 开发说明

### 数据存储

本项目使用 JSON 文件存储数据，数据文件位于 `data/` 目录：

- `users.json` - 用户数据
- `files.json` - 文件元数据
- `verification_codes.json` - 验证码

### 文件存储

上传的文件保存在 `storage/` 目录：

- `user_files/{userId}/` - 用户私有文件
- `public_files/` - 公共文件

### 路由说明

- `/` - 首页（重定向到登录或文件页）
- `/auth/register` - 注册页面
- `/auth/login` - 登录页面
- `/auth/logout` - 登出
- `/files` - 我的文件
- `/files/view/:id` - 查看文件
- `/files/download/:id` - 下载文件
- `/public` - 公共资源
- `/admin/dashboard` - 管理后台
- `/admin/users` - 用户管理
- `/admin/files` - 文件管理

## 常见问题

### 1. 如何配置邮箱服务？

如果使用 QQ 邮箱：

1. 登录 QQ 邮箱网页版
2. 进入设置 → 账户
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV 服务"
4. 开启服务并生成授权码
5. 在 `.env` 文件中配置邮箱和授权码

### 2. 验证码收不到怎么办？

- 检查 `.env` 文件中的邮箱配置是否正确
- 确认使用的是授权码而不是登录密码
- 开发模式下验证码会在控制台显示
- 检查邮箱垃圾箱

### 3. 如何修改管理员密码？

首次启动后，可以：

1. 直接修改 `data/users.json` 文件
2. 或删除该文件后重启应用重新生成

### 4. 支持的文件类型有哪些？

目前支持文本类文件：
txt, md, cpp, py, js, html, css, json, xml, java, c, h, cs

可以在 `utils/upload.js` 中修改 `ALLOWED_EXTENSIONS` 数组来添加更多类型。

## 安全建议

⚠️ **生产环境部署建议**：

1. 修改 `SESSION_SECRET` 为强随机字符串
2. 修改默认管理员密码
3. 配置 HTTPS
4. 限制文件上传大小
5. 添加文件类型验证
6. 实施频率限制
7. 考虑使用真实数据库（MySQL/MongoDB）

## 依赖说明

```json
{
  "express": "^4.18.2", // Web 框架
  "express-session": "^1.17.3", // Session 管理
  "ejs": "^3.1.9", // 模板引擎
  "multer": "^1.4.5-lts.1", // 文件上传
  "nodemailer": "^6.9.7", // 邮件发送
  "bcryptjs": "^2.4.3", // 密码加密
  "uuid": "^9.0.1" // UUID 生成
}
```

## License

ISC

## 作者

个人网盘系统

---

**享受使用！如有问题欢迎反馈。**
