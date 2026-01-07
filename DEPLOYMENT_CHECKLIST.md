# 生产环境部署检查清单

## ✅ 已完成的配置

### 1. CDN 本地化

- ✅ Alpine.js → `/public/js/alpine.min.js`
- ✅ Bootstrap Icons → `/public/fonts/bootstrap-icons/`
- ✅ Highlight.js → `/public/libs/highlight/`
- ⚠️ Tailwind CSS → 使用官方 CDN `cdn.tailwindcss.com`（支持动态配置）

### 2. CSP 安全策略

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.tailwindcss.com"],
    scriptSrcElem: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
    scriptSrcAttr: null, // 允许所有内联事件处理器
    styleSrc: ["'self'", "'unsafe-inline'"],
    styleSrcElem: ["'self'", "'unsafe-inline'"],
    styleSrcAttr: ["'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", "data:"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
  }
}
```

### 3. 生产环境中间件

- ✅ helmet（安全头）
- ✅ compression（gzip 压缩）
- ✅ morgan（日志记录）
- ✅ connect-mongo（session 持久化）

## 🚀 部署到云服务器步骤

### 1. 上传文件

确保上传以下关键目录和文件：

```
├── app.js                    # 主应用文件（已修复 CSP）
├── package.json
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── utils/
├── views/                    # 所有 EJS 模板
└── public/                   # 静态资源
    ├── js/
    │   └── alpine.min.js    # 必须！
    ├── fonts/
    │   └── bootstrap-icons/ # 必须！
    └── libs/
        └── highlight/        # 必须！
```

### 2. 环境变量配置

在云服务器上设置：

```bash
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/personal_cloud
HTTPS=true  # 如果启用 HTTPS
```

### 3. 安装依赖

```bash
cd /path/to/project
npm install --production
```

### 4. 重启应用

**宝塔面板：**

- 进入"网站" → "Node 项目"
- 找到你的项目
- 点击"重启"

**命令行：**

```bash
pm2 restart app.js
# 或
npm start
```

### 5. 清除浏览器缓存

⚠️ **重要！** 部署后首次访问：

- 强制刷新：`Ctrl + Shift + R`（Windows）/ `Cmd + Shift + R`（Mac）
- 或清除浏览器缓存
- 或使用无痕模式测试

## 🔍 常见问题排查

### 问题 1：CSP 错误 - 加载 jsdelivr CDN

**症状：**

```
Loading the script 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js'
violates the following Content Security Policy directive
```

**原因：** 浏览器缓存了旧页面

**解决：**

1. 强制刷新浏览器（Ctrl + Shift + R）
2. 清除浏览器缓存
3. 确认服务器上的文件是最新版本

### 问题 2：内联脚本被阻止

**症状：**

```
Executing inline script violates the following Content Security Policy directive
'script-src-elem 'self' cdn.tailwindcss.com'
```

**原因：** CSP 配置缺少 `'unsafe-inline'`

**解决：** 确认 `app.js` 中 `scriptSrcElem` 包含 `"'unsafe-inline'"`

### 问题 3：Bootstrap Icons 字体加载失败

**症状：** 图标显示为方块或不显示

**原因：**

1. `public/fonts/bootstrap-icons/` 目录缺失
2. 字体文件（.woff, .woff2）未上传

**解决：**

1. 确认字体文件存在：

```bash
ls public/fonts/bootstrap-icons/
# 应该看到：bootstrap-icons.woff, bootstrap-icons.woff2
```

2. 重新上传整个 `bootstrap-icons` 目录

### 问题 4：Highlight.js 不工作

**症状：** 代码没有高亮显示

**原因：** `public/libs/highlight/` 目录缺失

**解决：**

```bash
# 确认文件存在
ls public/libs/highlight/
# 应该看到：highlight.js, javascript.js, python.js, css.js, xml.js, json.js
```

## 📊 验证部署成功

### 1. 检查浏览器控制台

打开开发者工具（F12），应该：

- ✅ 无 CSP 错误
- ✅ 所有资源返回 200 状态码
- ✅ 无 404 错误

### 2. 检查网络请求

在"Network"标签中确认：

```
✅ /js/alpine.min.js → 200 OK
✅ /fonts/bootstrap-icons/bootstrap-icons.css → 200 OK
✅ /fonts/bootstrap-icons/fonts/bootstrap-icons.woff2 → 200 OK
✅ /libs/highlight/highlight.js → 200 OK
✅ https://cdn.tailwindcss.com → 200 OK
```

### 3. 功能测试

- ✅ 登录/注册页面正常显示
- ✅ 文件上传功能正常
- ✅ 图标正常显示
- ✅ 代码高亮正常工作
- ✅ Alpine.js 交互功能正常

## 🛡️ 安全建议

### 生产环境优化

如果 Tailwind CDN 在目标地区速度过慢，考虑：

**方案 A：完全本地化 Tailwind**

1. 构建完整的 CSS 文件
2. 移除 CDN 依赖
3. 更新 CSP 策略

**方案 B：使用国内 CDN 镜像**

- BootCDN
- cdnjs.cloudflare.com（在某些地区可用）

### HTTPS 配置

生产环境建议启用 HTTPS：

```javascript
cookie: {
  secure: true,  // 仅在 HTTPS 下传输 cookie
  httpOnly: true,
  sameSite: 'strict'
}
```

## 📝 维护记录

- **2026-01-07**: 完成 CDN 本地化，修复 CSP 配置
- **问题修复**: scriptSrcElem 添加 'unsafe-inline' 支持内联配置脚本
- **验证通过**: 所有本地资源文件已确认存在
