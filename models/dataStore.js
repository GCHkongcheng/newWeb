const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// 数据文件路径
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FILES_FILE = path.join(DATA_DIR, 'files.json');
const VERIFICATION_CODES_FILE = path.join(DATA_DIR, 'verification_codes.json');

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
}

// 读取数据
function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
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
    return users.find(user => user.id === userId);
  },

  // 根据邮箱查找用户
  findByEmail(email) {
    const users = this.findAll();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  },

  // 根据用户名查找用户
  findByUsername(username) {
    const users = this.findAll();
    return users.find(user => user.username.toLowerCase() === username.toLowerCase());
  },

  // 根据邮箱或用户名查找用户
  findByEmailOrUsername(identifier) {
    const users = this.findAll();
    return users.find(user => 
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
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData(USERS_FILE, users);
    
    // 创建用户文件夹
    const userDir = path.join(__dirname, '..', config.uploadPath, newUser.id);
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
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updateData };
    writeData(USERS_FILE, users);
    return users[index];
  },

  // 删除用户
  delete(userId) {
    const users = this.findAll();
    const filteredUsers = users.filter(user => user.id !== userId);
    
    if (users.length === filteredUsers.length) return false;
    
    writeData(USERS_FILE, filteredUsers);
    return true;
  }
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
    return files.find(file => file.id === fileId);
  },

  // 根据用户ID查找文件
  findByUserId(userId) {
    const files = this.findAll();
    return files.filter(file => file.userId === userId);
  },

  // 获取公共文件
  findPublic() {
    const files = this.findAll();
    return files.filter(file => file.isPublic);
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
      description: fileData.description || '',
      uploadedAt: new Date().toISOString()
    };

    files.push(newFile);
    writeData(FILES_FILE, files);
    return newFile;
  },

  // 更新文件
  update(fileId, updateData) {
    const files = this.findAll();
    const index = files.findIndex(file => file.id === fileId);
    
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
      console.error('Error deleting physical file:', error);
    }
    
    const filteredFiles = files.filter(f => f.id !== fileId);
    writeData(FILES_FILE, filteredFiles);
    return true;
  }
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
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10分钟有效期
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
  }
};

// 初始化
initDataFiles();

module.exports = {
  UserModel,
  FileModel,
  VerificationCodeModel
};
