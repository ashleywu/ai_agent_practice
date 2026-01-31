# 设置新 GitHub 仓库：ahacatcher

## 🎯 目标
创建独立的 GitHub 仓库 `github.com/ashleywu/ahacatcher` 专门用于 Aha! Catcher 项目

## 📋 快速步骤

### 1. 在 GitHub 创建新仓库

访问：**https://github.com/new**

填写：
- **Repository name**: `ahacatcher`
- **Description**: `Aha! Catcher - Voice-powered idea capture app`
- **Visibility**: Public 或 Private（你的选择）
- ⚠️ **重要**: **不要**勾选 "Add a README file"
- 点击 **Create repository**

### 2. 运行设置脚本

```powershell
cd c:\Users\peili\fastapi_hello\phaseBp1
.\setup_new_repo.ps1
```

脚本会：
- ✅ 初始化新的 git 仓库（在 phaseBp1 目录中）
- ✅ 添加所有文件
- ✅ 创建初始提交
- ✅ 连接到新仓库
- ✅ 推送到 GitHub

### 3. 更新部署配置

推送成功后，使用新仓库 URL 部署：

```powershell
cd c:\Users\peili\fastapi_hello\phaseBp1
python deploy.py --repo-url https://github.com/ashleywu/ahacatcher.git --service-name pw-aha-catcher --branch main
```

---

## 🔧 手动方法（如果脚本有问题）

如果脚本不工作，可以手动执行：

```powershell
cd c:\Users\peili\fastapi_hello\phaseBp1

# 1. 初始化新的 git 仓库
git init

# 2. 添加所有文件
git add .

# 3. 创建初始提交
git commit -m "Initial commit: Aha! Catcher - Voice-powered idea capture app"

# 4. 添加新仓库为 remote
git remote add origin https://github.com/ashleywu/ahacatcher.git

# 5. 设置主分支并推送
git branch -M main
git push -u origin main
```

---

## ✅ 验证

1. 访问：https://github.com/ashleywu/ahacatcher
2. 确认所有文件都已推送（应该看到 `app.py`, `index.html`, `Dockerfile` 等）
3. 运行部署脚本测试

---

## 📁 项目结构

推送后，新仓库的结构：
```
ahacatcher/
├── app.py              # FastAPI 后端
├── index.html          # 前端应用
├── requirements.txt    # Python 依赖
├── Dockerfile          # Docker 配置（从 phaseBp1/ 构建）
├── deploy.py           # 部署脚本
├── .env                # API 配置（不会被推送，在 .gitignore 中）
└── ...                 # 其他项目文件
```

---

## 🎉 优势

- ✅ **项目隔离**: Aha! Catcher 有自己独立的仓库
- ✅ **清晰组织**: 不会与 `AI_agent_practice` 项目混淆
- ✅ **独立部署**: 可以独立管理和部署
- ✅ **版本控制**: 独立的提交历史

---

## 📝 注意事项

- Dockerfile 已配置为从 `phaseBp1/` 子目录构建（但新仓库中所有文件都在根目录）
- 如果推送到新仓库后，需要更新 Dockerfile 为从根目录构建（因为新仓库中文件在根目录）
- 或者保持当前结构，将文件放在根目录

**推荐**: 在新仓库中，将所有文件放在根目录，这样 Dockerfile 更简单。
