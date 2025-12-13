# MongoDB 数据库指导文档

## 目录

1. [MongoDB 简介](#mongodb-简介)
2. [安装 MongoDB](#安装-mongodb)
3. [配置说明](#配置说明)
4. [数据模型](#数据模型)
5. [常用操作](#常用操作)
6. [备份与恢复](#备份与恢复)
7. [性能优化](#性能优化)
8. [常见问题](#常见问题)

---

## MongoDB 简介

MongoDB 是一个基于文档的 NoSQL 数据库，本项目使用 MongoDB 存储用户、文件、评论等数据。

### 技术栈

- **MongoDB**: 数据库服务器
- **Mongoose**: Node.js 的 MongoDB ODM（对象文档映射）库
- **版本要求**: MongoDB 4.4+ 推荐

---

## 安装 MongoDB

### Windows 安装

1. **下载 MongoDB Community Server**

   - 访问 [MongoDB 官网](https://www.mongodb.com/try/download/community)
   - 选择 Windows 平台，下载 `.msi` 安装包

2. **安装步骤**

   ```powershell
   # 运行安装包，选择 Complete 完整安装
   # 安装路径默认: C:\Program Files\MongoDB\Server\7.0\
   ```

3. **配置环境变量**

   ```powershell
   # 添加到 PATH
   C:\Program Files\MongoDB\Server\7.0\bin
   ```

4. **创建数据目录**

   ```powershell
   mkdir C:\data\db
   ```

5. **启动 MongoDB 服务**

   ```powershell
   # 方法1: 以服务方式启动（推荐）
   net start MongoDB

   # 方法2: 手动启动
   mongod --dbpath C:\data\db
   ```

6. **安装 MongoDB Shell（可选但推荐）**

   MongoDB Server 和 Shell 是分开的，需要单独安装 mongosh：

   - 访问 https://www.mongodb.com/try/download/shell
   - 下载 Windows 版本的 `.msi` 或 `.zip` 安装包
   - 运行安装程序或解压后添加到 PATH

   **或者使用传统的 mongo 命令**（如果已安装）:

   ```powershell
   mongo
   ```

7. **验证 MongoDB 服务运行**

   ```powershell
   # 方法1: 检查服务状态
   sc query MongoDB

   # 方法2: 检查端口占用
   netstat -ano | findstr :27017

   # 方法3: 如果安装了mongosh
   mongosh

   # 方法4: 直接启动应用测试连接（推荐）
   cd 你的项目目录
   node app.js
   # 看到 "✅ MongoDB已成功连接" 就说明成功
   ```

### macOS 安装

1. **使用 Homebrew 安装**

   ```bash
   # 安装 MongoDB
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

2. **启动服务**

   ```bash
   # 启动 MongoDB 服务
   brew services start mongodb-community@7.0
   ```

3. **验证安装**
   ```bash
   mongosh
   ```

### Linux (Ubuntu/Debian) 安装

1. **导入公钥**

   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   ```

2. **添加源**

   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **安装**

   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **启动服务**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod  # 开机自启
   ```

---

## 配置说明

### 连接字符串配置

配置文件位置: `config/database.js`

```javascript
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/personal_cloud";
```

#### 连接字符串格式

```
mongodb://[username:password@]host[:port]/database[?options]
```

#### 常用配置示例

**本地开发环境**

```javascript
mongodb://localhost:27017/personal_cloud
```

**带认证的连接**

```javascript
mongodb://admin:password123@localhost:27017/personal_cloud?authSource=admin
```

**生产环境（MongoDB Atlas）**

```javascript
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/personal_cloud?retryWrites=true&w=majority
```

### 环境变量配置

创建 `.env` 文件：

```env
MONGODB_URI=mongodb://localhost:27017/personal_cloud
NODE_ENV=development
```

---

## 数据模型

### 1. User（用户模型）

```javascript
{
  _id: ObjectId,
  username: String,      // 用户名（唯一，3-30字符）
  email: String,         // 邮箱（唯一，小写）
  password: String,      // 密码哈希（bcrypt加密）
  isAdmin: Boolean,      // 是否管理员
  isVerified: Boolean,   // 邮箱是否验证
  createdAt: Date,       // 创建时间
  updatedAt: Date        // 更新时间
}
```

**索引**:

- `email`: 唯一索引
- `username`: 唯一索引

### 2. File（文件模型）

```javascript
{
  _id: ObjectId,
  userId: ObjectId,      // 用户ID（ref: User）
  filename: String,      // 存储文件名
  originalName: String,  // 原始文件名
  path: String,          // 文件路径
  size: Number,          // 文件大小（字节）
  mimetype: String,      // MIME类型
  category: String,      // 分类（代码/备忘/图片/其他）
  isPublic: Boolean,     // 是否公开
  description: String,   // 文件描述
  createdAt: Date,       // 上传时间
  updatedAt: Date
}
```

**索引**:

- `userId` + `createdAt`: 复合索引（用户文件列表）
- `isPublic` + `createdAt`: 复合索引（公共文件）
- `userId` + `category`: 复合索引（分类查询）

### 3. Comment（评论模型）

```javascript
{
  _id: ObjectId,
  fileId: ObjectId,      // 文件ID（ref: File）
  userId: ObjectId,      // 用户ID（ref: User）
  content: String,       // 评论内容（1-500字符）
  createdAt: Date,
  updatedAt: Date
}
```

**索引**:

- `fileId` + `createdAt`: 复合索引（文件评论列表）

### 4. Category（分类模型）

```javascript
{
  _id: ObjectId,
  name: String,          // 分类名称（唯一）
  icon: String,          // 图标类名
  isSystem: Boolean,     // 是否系统分类
  createdAt: Date,
  updatedAt: Date
}
```

### 5. VerificationCode（验证码模型）

```javascript
{
  _id: ObjectId,
  email: String,         // 邮箱地址
  code: String,          // 验证码
  expiresAt: Date,       // 过期时间
  createdAt: Date
}
```

**特殊索引**:

- `expiresAt`: TTL 索引（自动删除过期文档）

---

## 常用操作

### 启动项目

1. **确保 MongoDB 服务运行**

   ```powershell
   # Windows
   net start MongoDB

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

2. **启动应用**
   ```bash
   npm start
   ```

### 使用 mongosh 管理数据库

```bash
# 连接到数据库
mongosh mongodb://localhost:27017/personal_cloud

# 查看所有集合
show collections

# 查看用户
db.users.find().pretty()

# 查看文件
db.files.find().pretty()

# 统计文档数量
db.users.countDocuments()
db.files.countDocuments()

# 删除所有数据（慎用！）
db.users.deleteMany({})
db.files.deleteMany({})
db.comments.deleteMany({})
```

### 创建管理员用户

应用首次启动时会自动创建管理员账户（在 `models/init.js` 中配置）：

```javascript
// 默认管理员账户
用户名: admin
邮箱: admin@example.com
密码: admin123
```

**⚠️ 重要**: 首次登录后请立即修改密码！

---

## 备份与恢复

### 备份数据库

```bash
# 备份整个数据库
mongodump --db personal_cloud --out ./backup

# 备份特定集合
mongodump --db personal_cloud --collection users --out ./backup

# 带压缩的备份
mongodump --db personal_cloud --gzip --out ./backup
```

### 恢复数据库

```bash
# 恢复整个数据库
mongorestore --db personal_cloud ./backup/personal_cloud

# 恢复特定集合
mongorestore --db personal_cloud --collection users ./backup/personal_cloud/users.bson

# 恢复压缩备份
mongorestore --db personal_cloud --gzip ./backup/personal_cloud
```

### 导出为 JSON

```bash
# 导出集合为 JSON
mongoexport --db personal_cloud --collection users --out users.json --pretty

# 导入 JSON
mongoimport --db personal_cloud --collection users --file users.json
```

---

## 性能优化

### 1. 索引优化

```javascript
// 查看集合的索引
db.files.getIndexes();

// 分析查询性能
db.files.find({ userId: "xxx" }).explain("executionStats");

// 创建自定义索引
db.files.createIndex({ userId: 1, category: 1 });
```

### 2. 连接池配置

在 `config/database.js` 中调整连接选项：

```javascript
const options = {
  maxPoolSize: 10, // 最大连接数
  minPoolSize: 5, // 最小连接数
  socketTimeoutMS: 45000, // Socket超时
  serverSelectionTimeoutMS: 5000,
};
```

### 3. 查询优化建议

- 使用 `select()` 只返回需要的字段
- 合理使用 `populate()` 避免过度关联
- 对大量数据使用分页（limit + skip）
- 避免在循环中执行数据库查询

---

## 常见问题

### 1. 连接失败

**错误**: `MongooseServerSelectionError: connect ECONNREFUSED`

**解决方法**:

```bash
# 检查 MongoDB 服务是否运行
# Windows
sc query MongoDB

# macOS/Linux
sudo systemctl status mongod

# 如果未运行，启动服务
net start MongoDB  # Windows
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

### 2. 认证失败

**错误**: `Authentication failed`

**解决方法**:

```bash
# 检查用户名和密码
# 确保连接字符串中的 authSource 正确
mongodb://user:pass@localhost:27017/personal_cloud?authSource=admin
```

### 3. 端口被占用

**错误**: `Address already in use`

**解决方法**:

```bash
# Windows
netstat -ano | findstr :27017
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :27017
kill -9 <PID>
```

### 4. 数据库磁盘空间不足

```bash
# 压缩数据库释放空间
mongosh
use personal_cloud
db.runCommand({ compact: 'files' })
```

### 5. 升级 Mongoose 后出现弃用警告

```javascript
// 在 database.js 中更新连接选项
mongoose.set("strictQuery", false); // 消除 strictQuery 警告
```

---

## 监控和维护

### 查看数据库状态

```javascript
// 连接 mongosh
mongosh

// 查看数据库状态
use personal_cloud
db.stats()

// 查看集合统计
db.files.stats()

// 查看当前操作
db.currentOp()
```

### 定期维护任务

1. **清理过期验证码**（TTL 索引自动处理）
2. **备份数据库**（建议每天备份）
3. **检查索引性能**（定期分析慢查询）
4. **监控磁盘空间**

---

## 安全建议

1. **生产环境务必启用认证**

   ```bash
   # 创建管理员用户
   mongosh
   use admin
   db.createUser({
     user: "admin",
     pwd: "strong_password",
     roles: ["root"]
   })
   ```

2. **修改默认端口**（可选）

   ```yaml
   # mongod.conf
   net:
     port: 27018
   ```

3. **限制网络访问**

   ```yaml
   # mongod.conf
   net:
     bindIp: 127.0.0.1 # 只允许本地访问
   ```

4. **启用日志审计**
   ```yaml
   # mongod.conf
   auditLog:
     destination: file
     path: /var/log/mongodb/audit.log
   ```

---

## 开发工具推荐

1. **MongoDB Compass**（官方 GUI 工具）

   - 下载: https://www.mongodb.com/products/compass
   - 可视化数据库管理

2. **Studio 3T**（强大的第三方工具）

   - 下载: https://studio3t.com/
   - 功能丰富的数据库客户端

3. **VS Code 插件**
   - MongoDB for VS Code（官方插件）

---

## 参考资源

- [MongoDB 官方文档](https://docs.mongodb.com/)
- [Mongoose 官方文档](https://mongoosejs.com/)
- [MongoDB University](https://university.mongodb.com/)（免费课程）

---

## 技术支持

如有问题，请参考：

1. 本文档的常见问题部分
2. MongoDB 官方论坛
3. Stack Overflow

**更新日期**: 2024-12-19
