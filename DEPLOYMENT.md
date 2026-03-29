# 🚀 多用户导航网站部署操作文档

本指南将指导您从零开始，在服务器（Linux/Windows/Vercel）上部署此基于 Next.js 14 的导航网站。

---

## **第一步：安装运行环境**

在部署之前，确保您的服务器已安装以下基础环境：

### **1. 安装 Node.js (推荐 v18.17.0 或更高版本)**
- **Windows**: 从 [nodejs.org](https://nodejs.org/) 下载并安装 LTS 版本。
- **Linux (Ubuntu/Debian)**:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **验证安装**:
  ```bash
  node -v
  npm -v
  ```

---

## **第二步：获取代码并安装依赖**

1. **上传代码**：将项目文件夹上传到服务器，或使用 Git 克隆：
   ```bash
   git clone <您的仓库地址>
   cd <项目目录>
   ```
2. **安装项目依赖**：
   ```bash
   npm install
   ```

---

## **第三步：配置环境变量**

项目根目录下有一个 `.env` 文件。在生产环境中，您需要根据实际域名修改它：

1. **生成 AUTH_SECRET**（用于加密 Session）：
   在终端运行以下命令生成随机密钥：
   ```bash
   npx auth secret
   ```
2. **编辑 .env 文件**：
   ```env
   # 生产环境密钥（将生成的密钥粘贴在此）
   AUTH_SECRET="您的随机密钥"
   
   # 生产环境地址（必须修改为您的实际域名）
   AUTH_URL="https://your-domain.com/api/auth"
   NEXTAUTH_URL="https://your-domain.com/api/auth"
   
   # 数据库连接（如果使用内置 SQLite，保持默认即可）
   DATABASE_URL="file:./dev.db"
   ```

---

## **第四步：初始化数据库**

在第一次部署或数据库结构变更时，需要运行以下命令：

1. **生成 Prisma 客户端**：
   ```bash
   npx prisma generate
   ```
2. **同步数据库结构**：
   ```bash
   npx prisma migrate deploy
   ```
3. **（可选）导入初始测试数据**：
   ```bash
   npx prisma db seed
   ```

---

## **第五步：打包构建**

执行 Next.js 的生产环境构建命令，这会优化代码并生成静态资源：

```bash
npm run build
```

---

## **第六步：正式启动部署**

### **方案 A：使用 PM2 持续运行（推荐用于 Linux 服务器）**
PM2 可以确保您的应用在后台运行，并在崩溃或重启后自动恢复。

1. **安装 PM2**:
   ```bash
   npm install pm2 -g
   ```
2. **启动应用**:
   ```bash
   pm2 start npm --name "my-nav" -- start
   ```
3. **设置开机自启**:
   ```bash
   pm2 save
   pm2 startup
   ```

### **方案 B：Vercel 一键部署（推荐）**
1. 将代码推送至 GitHub/GitLab。
2. 在 [Vercel](https://vercel.com/) 关联仓库。
3. 在 Vercel 控制面板中添加对应的 **Environment Variables** (AUTH_SECRET, AUTH_URL)。
4. Vercel 会自动完成构建和部署。

---

## **第七步：配置 Nginx 反向代理 (可选)**

如果您使用自己的域名，通常需要 Nginx 来转发流量：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## **常见问题排查**

- **401 Unauthorized**: 请检查 `.env` 中的 `AUTH_URL` 是否与您访问的域名完全一致（包含 http/https）。
- **无法连接数据库**: 确保服务器对 `dev.db` 文件有读写权限。
- **端口冲突**: 如果 3000 端口被占用，可以使用 `PORT=4000 npm start` 指定其他端口。
