# 生产环境部署检查清单

## 1. 环境变量配置 (.env)

在生产服务器根目录下创建 `.env` 文件，并配置以下变量：

```env
# 服务器配置
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/personal_cloud

# 安全配置 (必须修改!)
SESSION_SECRET=your_long_random_string_here_please_change_it

# 邮件服务配置 (用于发送验证码)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# 管理员初始密码 (仅首次启动有效)
ADMIN_PASSWORD=secure_admin_password
```

## 2. 进程管理 (PM2)

建议使用 PM2 来管理 Node.js 进程，确保应用崩溃自动重启。

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name "personal-cloud"

# 保存当前进程列表（开机自启）
pm2 save
pm2 startup
```

## 3. 反向代理 (Nginx)

建议使用 Nginx 作为反向代理，处理静态文件、SSL 加密和端口转发。

**Nginx 配置示例:**

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 强制跳转 HTTPS (可选)
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存 (可选，Express 已经配置了 express.static)
    # location /public {
    #     alias /path/to/your/project/public;
    #     expires 30d;
    # }
}
```

## 4. 安全性检查

- [ ] 确保 `.env` 文件未被提交到版本控制系统
- [ ] 修改默认的管理员密码
- [ ] 配置防火墙，只开放必要端口 (80, 443, 22)
- [ ] 建议配置 SSL 证书 (使用 Let's Encrypt)
- [ ] 定期备份 MongoDB 数据 (`mongodump`)

## 5. 性能优化

- [x] 已启用 Gzip 压缩 (compression)
- [x] 已配置 Session 持久化 (connect-mongo)
- [x] 已配置安全头 (helmet)
- [ ] 考虑使用 CDN 加速静态资源 (可选)

## 6. 监控与日志

- [x] 已配置请求日志 (morgan)
- [ ] 建议接入监控系统 (如 PM2 Monitor 或其他 APM)
