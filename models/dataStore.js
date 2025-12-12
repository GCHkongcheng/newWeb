const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/config");

// 数据文件路径
const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const FILES_FILE = path.join(DATA_DIR, "files.json");
const VERIFICATION_CODES_FILE = path.join(DATA_DIR, "verification_codes.json");
const TRASH_FILE = path.join(DATA_DIR, "trash.json");
const COMMENTS_FILE = path.join(DATA_DIR, "comments.json");

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化数据文件
function initDataFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(FILES_FILE)) {
    fs.writeFileSync(FILES_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(VERIFICATION_CODES_FILE)) {
    fs.writeFileSync(VERIFICATION_CODES_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(TRASH_FILE)) {
    fs.writeFileSync(TRASH_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify([]));
  }
}

// 读取数据
function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return filePath === VERIFICATION_CODES_FILE ? {} : [];
  }
}

// 写入数据
function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// 用户相关操作
const UserModel = {
  // 获取所有用户
  findAll() {
    return readData(USERS_FILE);
  },

  // 根据ID查找用户
  findById(userId) {
    const users = this.findAll();
    return users.find((user) => user.id === userId);
  },

  // 根据邮箱查找用户
  findByEmail(email) {
    const users = this.findAll();
    return users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  },

  // 根据用户名查找用户
  findByUsername(username) {
    const users = this.findAll();
    return users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  },

  // 根据邮箱或用户名查找用户
  findByEmailOrUsername(identifier) {
    const users = this.findAll();
    return users.find(
      (user) =>
        user.email.toLowerCase() === identifier.toLowerCase() ||
        user.username.toLowerCase() === identifier.toLowerCase()
    );
  },

  // 创建用户
  async create(userData) {
    const users = this.findAll();
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      isAdmin: userData.isAdmin || false,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    // 创建用户文件夹
    const userDir = path.join(__dirname, "..", config.uploadPath, newUser.id);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    return newUser;
  },

  // 验证密码
  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },

  // 更新用户
  update(userId, updateData) {
    const users = this.findAll();
    const index = users.findIndex((user) => user.id === userId);

    if (index === -1) return null;

    users[index] = { ...users[index], ...updateData };
    writeData(USERS_FILE, users);
    return users[index];
  },

  // 删除用户
  delete(userId) {
    const users = this.findAll();
    const filteredUsers = users.filter((user) => user.id !== userId);

    if (users.length === filteredUsers.length) return false;

    writeData(USERS_FILE, filteredUsers);
    return true;
  },
};

// 文件相关操作
const FileModel = {
  // 获取所有文件
  findAll() {
    return readData(FILES_FILE);
  },

  // 根据ID查找文件
  findById(fileId) {
    const files = this.findAll();
    return files.find((file) => file.id === fileId);
  },

  // 根据用户ID查找文件
  findByUserId(userId) {
    const files = this.findAll();
    return files.filter((file) => file.userId === userId);
  },

  // 获取公共文件
  findPublic() {
    const files = this.findAll();
    return files.filter((file) => file.isPublic);
  },

  // 创建文件记录
  create(fileData) {
    const files = this.findAll();

    const newFile = {
      id: uuidv4(),
      userId: fileData.userId,
      filename: fileData.filename,
      originalName: fileData.originalName,
      path: fileData.path,
      size: fileData.size,
      mimetype: fileData.mimetype,
      isPublic: fileData.isPublic || false,
      description: fileData.description || "",
      uploadedAt: new Date().toISOString(),
    };

    files.push(newFile);
    writeData(FILES_FILE, files);
    return newFile;
  },

  // 更新文件
  update(fileId, updateData) {
    const files = this.findAll();
    const index = files.findIndex((file) => file.id === fileId);

    if (index === -1) return null;

    files[index] = { ...files[index], ...updateData };
    writeData(FILES_FILE, files);
    return files[index];
  },

  // 删除文件记录
  delete(fileId) {
    const files = this.findAll();
    const file = this.findById(fileId);

    if (!file) return false;

    // 删除物理文件
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error("Error deleting physical file:", error);
    }

    const filteredFiles = files.filter((f) => f.id !== fileId);
    writeData(FILES_FILE, filteredFiles);
    return true;
  },
};

// 验证码相关操作
const VerificationCodeModel = {
  // 获取所有验证码
  findAll() {
    return readData(VERIFICATION_CODES_FILE);
  },

  // 保存验证码
  save(email, code) {
    const codes = this.findAll();
    codes[email] = {
      code: code,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10分钟有效期
    };
    writeData(VERIFICATION_CODES_FILE, codes);
  },

  // 验证验证码
  verify(email, code) {
    const codes = this.findAll();
    const record = codes[email];

    if (!record) return false;

    // 检查是否过期
    if (new Date(record.expiresAt) < new Date()) {
      this.delete(email);
      return false;
    }

    return record.code === code;
  },

  // 删除验证码
  delete(email) {
    const codes = this.findAll();
    delete codes[email];
    writeData(VERIFICATION_CODES_FILE, codes);
  },
};

// 回收站相关操作
const TrashModel = {
  // 获取所有回收站文件
  findAll() {
    return readData(TRASH_FILE);
  },

  // 根据用户ID查找回收站文件
  findByUserId(userId) {
    const trashFiles = this.findAll();
    return trashFiles.filter((file) => file.userId === userId);
  },

  // 根据ID查找回收站文件
  findById(fileId) {
    const trashFiles = this.findAll();
    return trashFiles.find((file) => file.id === fileId);
  },

  // 添加到回收站
  add(fileData) {
    const trashFiles = this.findAll();
    const trashItem = {
      ...fileData,
      deletedAt: new Date().toISOString(),
      expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
    };
    trashFiles.push(trashItem);
    writeData(TRASH_FILE, trashFiles);
    return trashItem;
  },

  // 从回收站恢复
  restore(fileId) {
    const trashFiles = this.findAll();
    const index = trashFiles.findIndex((file) => file.id === fileId);

    if (index === -1) return null;

    const file = trashFiles[index];
    trashFiles.splice(index, 1);
    writeData(TRASH_FILE, trashFiles);

    return file;
  },

  // 从回收站彻底删除
  permanentDelete(fileId) {
    const trashFiles = this.findAll();
    const file = this.findById(fileId);

    if (!file) return false;

    // 删除物理文件
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error("Error deleting physical file:", error);
    }

    const filteredFiles = trashFiles.filter((f) => f.id !== fileId);
    writeData(TRASH_FILE, filteredFiles);
    return true;
  },

  // 清理过期文件
  cleanExpired() {
    const trashFiles = this.findAll();
    const now = new Date();
    const validFiles = [];
    const expiredFiles = [];

    trashFiles.forEach((file) => {
      if (new Date(file.expireAt) > now) {
        validFiles.push(file);
      } else {
        expiredFiles.push(file);
        // 删除过期的物理文件
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (error) {
          console.error("Error deleting expired file:", error);
        }
      }
    });

    writeData(TRASH_FILE, validFiles);
    return expiredFiles.length;
  },

  // 清空用户回收站
  emptyByUserId(userId) {
    const trashFiles = this.findAll();
    const userFiles = trashFiles.filter((file) => file.userId === userId);

    // 删除物理文件
    userFiles.forEach((file) => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    });

    const remainingFiles = trashFiles.filter((file) => file.userId !== userId);
    writeData(TRASH_FILE, remainingFiles);
    return userFiles.length;
  },
};

// 评论模型
const CommentModel = {
  // 获取文件的所有评论
  findByFileId(fileId) {
    const comments = readData(COMMENTS_FILE);
    return comments
      .filter((c) => c.fileId === fileId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // 添加评论
  add(fileId, userId, username, content) {
    const comments = readData(COMMENTS_FILE);
    const newComment = {
      id: uuidv4(),
      fileId,
      userId,
      username,
      content,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    writeData(COMMENTS_FILE, comments);
    return newComment;
  },

  // 删除评论
  delete(commentId, userId, isAdmin = false) {
    const comments = readData(COMMENTS_FILE);
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) {
      return false;
    }
    // 管理员可以删除任何评论，普通用户只能删除自己的评论
    if (!isAdmin && comment.userId !== userId) {
      return false;
    }
    const filtered = comments.filter((c) => c.id !== commentId);
    writeData(COMMENTS_FILE, filtered);
    return true;
  },

  // 获取所有评论（管理员用）
  findAll() {
    return readData(COMMENTS_FILE);
  },

  // 删除文件的所有评论
  deleteByFileId(fileId) {
    const comments = readData(COMMENTS_FILE);
    const filtered = comments.filter((c) => c.fileId !== fileId);
    writeData(COMMENTS_FILE, filtered);
    return true;
  },
};

// 初始化
initDataFiles();

module.exports = {
  UserModel,
  FileModel,
  VerificationCodeModel,
  TrashModel,
  CommentModel,
};
