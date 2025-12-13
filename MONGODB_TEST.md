# MongoDB 迁移测试指南

## ✅ 已完成的迁移步骤

1. ✅ 安装 mongoose 依赖
2. ✅ 创建数据库连接配置 (config/database.js)
3. ✅ 定义所有 Mongoose 模型 (models/schemas/)
4. ✅ 重写数据访问层 (models/dataStore.js)
5. ✅ 更新 app.js 初始化流程
6. ✅ 删除旧的 JSON 数据文件
7. ✅ 创建 MongoDB 指导文档 (MONGODB_GUIDE.md)
8. ✅ 修复所有 controllers 中的 async/await 问题

## 🚀 启动测试步骤

### 1. 启动 MongoDB 服务

**Windows:**

```powershell
# 方法1: 如果已安装为服务
net start MongoDB

# 方法2: 手动启动
mongod --dbpath C:\data\db
```

**macOS:**

```bash
brew services start mongodb-community
```

**Linux:**

```bash
sudo systemctl start mongod
```

**验证 MongoDB 运行:**

```powershell
# 打开新终端，连接MongoDB
mongosh
# 应该看到 MongoDB shell 提示符
```

### 2. 启动应用

```powershell
# 在项目根目录
node app.js
```

**预期输出:**

```
🔌 正在连接MongoDB...
✅ MongoDB已成功连接
✅ 默认分类已初始化
✅ 管理员账户已创建
服务器运行在 http://localhost:3000
```

### 3. 测试功能清单

#### 3.1 管理员账户登录

- [ ] 访问 http://localhost:3000
- [ ] 使用默认管理员账户登录:
  - 邮箱/用户名: `admin` 或 `admin@example.com`
  - 密码: `admin123`
- [ ] 确认可以进入管理后台

#### 3.2 注册新用户

- [ ] 退出管理员账户
- [ ] 点击"注册"
- [ ] 发送验证码到邮箱（需配置邮件服务，参考 EMAIL_CONFIG.md）
- [ ] 输入验证码完成注册
- [ ] 用新用户登录

#### 3.3 文件上传测试

- [ ] 登录后进入"文件管理"
- [ ] 上传代码文件（.js, .py 等）
- [ ] 上传备忘文件（.txt, .md 等）
- [ ] 上传图片文件（.jpg, .png 等）
- [ ] 查看存储空间统计是否正确

#### 3.4 文件查看

- [ ] 点击文件名查看文件内容
- [ ] 代码文件应正确显示语法高亮
- [ ] 图片文件应正确显示预览
- [ ] 下载文件功能正常

#### 3.5 文件公开与评论

- [ ] 将某个文件设为公开
- [ ] 访问"公共资源"页面
- [ ] 查看公开文件
- [ ] 添加评论
- [ ] 删除自己的评论
- [ ] 管理员可删除任何评论

#### 3.6 用户中心

- [ ] 进入"用户中心"
- [ ] 修改用户名（需输入密码验证）
- [ ] 修改密码
- [ ] 验证修改后可用新信息登录

#### 3.7 管理后台（管理员）

- [ ] 进入"管理后台"
- [ ] 查看统计数据（用户数、文件数等）
- [ ] 查看所有用户列表
- [ ] 查看所有文件列表
- [ ] 删除文件

### 4. 数据库验证

**连接到 MongoDB 并检查数据:**

```javascript
// 在 mongosh 中执行
use personal_cloud

// 查看所有集合
show collections

// 查看用户数据
db.users.find().pretty()

// 查看文件数据
db.files.find().pretty()

// 查看评论数据
db.comments.find().pretty()

// 查看分类数据
db.categories.find().pretty()

// 验证索引
db.users.getIndexes()
db.files.getIndexes()
```

### 5. 常见问题排查

#### 问题 1: 连接 MongoDB 失败

```
错误: MongooseServerSelectionError: connect ECONNREFUSED
```

**解决:**

- 确认 MongoDB 服务已启动: `net start MongoDB`
- 检查端口是否被占用: `netstat -ano | findstr :27017`

#### 问题 2: 管理员账户创建失败

```
错误: E11000 duplicate key error
```

**解决:**

- 管理员已存在，可直接使用 admin/admin123 登录
- 或删除后重新创建:
  ```javascript
  use personal_cloud
  db.users.deleteOne({ email: "admin@example.com" })
  ```

#### 问题 3: 文件上传失败

**检查:**

- storage/user_files 目录权限
- MongoDB 中 userId 字段格式是否正确（应为 ObjectId）
- 查看控制台错误日志

#### 问题 4: 验证码发送失败

**原因:** 未配置邮件服务
**解决:**

- 参考 EMAIL_CONFIG.md 配置邮件服务
- 或暂时跳过验证码（在代码中注释验证逻辑）

### 6. 性能测试（可选）

```javascript
// 在 mongosh 中测试查询性能
use personal_cloud

// 测试用户查询
db.users.find({ email: "test@example.com" }).explain("executionStats")

// 测试文件查询（应使用索引）
db.files.find({ userId: ObjectId("...") }).sort({ createdAt: -1 }).explain("executionStats")

// 检查执行时间应在毫秒级
```

## 📊 测试结果记录

### 功能测试结果

| 功能         | 状态 | 备注 |
| ------------ | ---- | ---- |
| MongoDB 连接 | ⬜   |      |
| 管理员登录   | ⬜   |      |
| 用户注册     | ⬜   |      |
| 文件上传     | ⬜   |      |
| 文件查看     | ⬜   |      |
| 文件下载     | ⬜   |      |
| 公开文件     | ⬜   |      |
| 评论功能     | ⬜   |      |
| 用户信息修改 | ⬜   |      |
| 管理后台     | ⬜   |      |

### 性能测试结果

| 操作         | 平均响应时间 | 备注 |
| ------------ | ------------ | ---- |
| 用户登录     | \_\_\_ms     |      |
| 文件列表加载 | \_\_\_ms     |      |
| 文件上传     | \_\_\_ms     |      |
| 评论查询     | \_\_\_ms     |      |

## 🎉 测试完成后

如果所有测试通过:

1. ✅ MongoDB 迁移成功！
2. ✅ 修改默认管理员密码
3. ✅ 配置环境变量（生产环境）
4. ✅ 设置 MongoDB 认证（生产环境）
5. ✅ 配置定期备份任务

如果有问题:

1. 查看控制台错误日志
2. 检查 MongoDB 日志
3. 参考 MONGODB_GUIDE.md 的常见问题部分
4. 回滚到 JSON 存储（如需要）

---

**测试日期:** ****\_\_\_****  
**测试人员:** ****\_\_\_****  
**测试环境:** Windows / macOS / Linux  
**MongoDB 版本:** ****\_\_\_****  
**Node.js 版本:** ****\_\_\_****
