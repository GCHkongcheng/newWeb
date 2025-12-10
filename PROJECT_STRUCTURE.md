# 项目文件结构说明

## 完整目录树

```
newWeb/
│
├── app.js                          # 主应用入口
├── package.json                    # 项目配置和依赖
├── package-lock.json              # 依赖锁定文件
├── .env                           # 环境变量配置（需手动配置）
├── .env.example                   # 环境变量示例
├── .gitignore                     # Git 忽略文件
├── README.md                      # 项目说明文档
│
├── config/                        # 配置目录
│   └── config.js                  # 应用配置（读取环境变量）
│
├── models/                        # 数据模型目录
│   ├── dataStore.js              # 数据存储操作（UserModel, FileModel, VerificationCodeModel）
│   └── init.js                   # 初始化脚本（创建管理员账号）
│
├── controllers/                   # 控制器目录
│   ├── authController.js         # 认证控制器（注册、登录、登出、验证码）
│   ├── fileController.js         # 文件控制器（上传、查看、下载、删除）
│   ├── publicController.js       # 公共资源控制器（查看公共文件）
│   └── adminController.js        # 管理控制器（后台管理功能）
│
├── routes/                        # 路由目录
│   ├── auth.js                   # 认证路由（/auth/*)
│   ├── files.js                  # 文件路由（/files/*)
│   ├── public.js                 # 公共资源路由（/public/*)
│   └── admin.js                  # 管理路由（/admin/*)
│
├── middlewares/                   # 中间件目录
│   └── auth.js                   # 认证中间件（requireAuth, requireGuest, requireAdmin）
│
├── utils/                         # 工具函数目录
│   ├── email.js                  # 邮件发送工具（nodemailer + 验证码生成）
│   └── upload.js                 # 文件上传配置（multer）
│
├── views/                         # 视图模板目录（EJS）
│   ├── partials/                 # 公共组件
│   │   ├── auth-layout.ejs      # 认证页面布局
│   │   ├── layout.ejs           # 主布局
│   │   └── navbar.ejs           # 导航栏组件
│   │
│   ├── auth/                     # 认证页面
│   │   ├── login.ejs            # 登录页面
│   │   └── register.ejs         # 注册页面
│   │
│   ├── files/                    # 文件管理页面
│   │   ├── index.ejs            # 文件列表页
│   │   └── view.ejs             # 文件查看页
│   │
│   ├── public/                   # 公共资源页面
│   │   └── index.ejs            # 公共文件列表页
│   │
│   ├── admin/                    # 管理后台页面
│   │   ├── dashboard.ejs        # 管理后台首页
│   │   ├── users.ejs            # 用户管理页
│   │   └── files.ejs            # 文件管理页
│   │
│   └── error.ejs                 # 错误页面
│
├── public/                        # 静态资源目录
│   └── placeholder.js            # 占位文件
│
├── data/                          # 数据存储目录（运行时自动创建）
│   ├── users.json                # 用户数据
│   ├── files.json                # 文件元数据
│   └── verification_codes.json   # 验证码数据
│
└── storage/                       # 文件存储目录（运行时自动创建）
    ├── user_files/               # 用户文件目录
    │   └── {userId}/             # 按用户ID分类的文件
    └── public_files/             # 公共文件目录
```

## 核心模块说明

### 1. 认证模块（Authentication）

**文件：**

- `controllers/authController.js` - 认证逻辑
- `routes/auth.js` - 认证路由
- `middlewares/auth.js` - 认证中间件
- `utils/email.js` - 邮件验证码

**功能：**

- 用户注册（邮箱验证码）
- 用户登录
- 会话管理
- 权限验证

### 2. 文件管理模块（File Management）

**文件：**

- `controllers/fileController.js` - 文件操作逻辑
- `routes/files.js` - 文件路由
- `utils/upload.js` - 上传配置

**功能：**

- 文件上传（支持公开/私有）
- 文件列表查看
- 在线预览文本文件
- 文件下载
- 文件删除

### 3. 公共资源模块（Public Resources）

**文件：**

- `controllers/publicController.js` - 公共资源逻辑
- `routes/public.js` - 公共资源路由

**功能：**

- 查看所有公开文件
- 显示上传者信息
- 支持预览和下载

### 4. 管理后台模块（Admin Panel）

**文件：**

- `controllers/adminController.js` - 管理逻辑
- `routes/admin.js` - 管理路由

**功能：**

- 系统统计数据
- 用户管理
- 文件管理
- 权限控制（仅管理员）

### 5. 数据存储模块（Data Storage）

**文件：**

- `models/dataStore.js` - 数据操作封装
- `models/init.js` - 初始化脚本

**功能：**

- 基于 JSON 文件的数据持久化
- UserModel - 用户 CRUD 操作
- FileModel - 文件 CRUD 操作
- VerificationCodeModel - 验证码管理

## 技术架构

### MVC 架构

```
请求 → 路由（Routes）→ 中间件（Middlewares）→ 控制器（Controllers）→ 模型（Models）→ 视图（Views）→ 响应
```

### 数据流

```
客户端
  ↓
路由匹配
  ↓
认证中间件（如需要）
  ↓
控制器处理
  ↓
数据模型操作
  ↓
EJS 模板渲染
  ↓
HTML 响应
```

## 关键配置

### Session 配置

- 使用 express-session
- 默认有效期：24 小时
- 存储用户 ID、用户名、邮箱、管理员状态

### 文件上传配置

- 使用 multer
- 存储路径：按用户 ID 分类
- 文件大小限制：10MB
- 支持格式：txt, md, cpp, py, js, html, css, json, xml, java, c, h, cs

### 邮件配置

- 使用 nodemailer
- 支持 QQ 邮箱
- 验证码有效期：10 分钟
- 开发模式：验证码在控制台显示

## 安全特性

1. **密码安全**：使用 bcryptjs 加密存储
2. **会话管理**：express-session 管理用户状态
3. **权限控制**：中间件验证用户权限
4. **文件类型限制**：只允许特定格式上传
5. **文件大小限制**：防止恶意上传大文件

## 扩展建议

### 生产环境优化

1. 使用真实数据库（MySQL/MongoDB/PostgreSQL）
2. 使用 Redis 存储 Session
3. 添加文件预览功能（PDF、图片）
4. 实现文件版本管理
5. 添加文件搜索功能
6. 实现文件分享链接
7. 添加用户配额管理
8. 实现文件加密存储

### 功能扩展

1. 支持文件夹管理
2. 支持批量上传
3. 支持断点续传
4. 添加文件标签
5. 实现回收站功能
6. 添加操作日志
7. 实现数据备份
8. 添加文件在线编辑

## 常用命令

```bash
# 安装依赖
npm install

# 启动应用
npm start

# 开发模式（自动重启）
npm run dev
```

## 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

## 端口配置

默认端口：3000
可在 `.env` 文件中修改 `PORT` 配置
