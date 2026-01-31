# 下一步操作指南

## 当前状态 ✅

- ✅ Dockerfile 已更新为从 `phaseBp1/` 子目录构建
- ✅ 代码保持在 `phaseBp1/` 目录中（项目隔离）
- ✅ Git 提交已完成（本地有 2 个未推送的提交）

## 需要完成的步骤

### 1. 更新根目录的 Dockerfile（重要）

部署平台会从**根目录**查找 Dockerfile，所以根目录的 Dockerfile 也需要更新为从子目录构建。

**操作：**
```powershell
# 复制更新后的 Dockerfile 到根目录
cd c:\Users\peili\fastapi_hello
Copy-Item phaseBp1\Dockerfile . -Force
```

### 2. 清理根目录的旧文件（可选）

根目录有旧的 `app.py` 和 `index.html`（之前复制过去的），可以删除或保留。

**如果删除：**
```powershell
cd c:\Users\peili\fastapi_hello
Remove-Item app.py, index.html -ErrorAction SilentlyContinue
```

**如果保留：**
- 这些文件不会影响部署（Dockerfile 会从 `phaseBp1/` 复制）
- 但可能会造成混淆

### 3. 提交并推送代码到 GitHub

```powershell
cd c:\Users\peili\fastapi_hello

# 添加更新的文件
git add Dockerfile
git add phaseBp1/Dockerfile

# 提交
git commit -m "Update Dockerfile to build from phaseBp1 subdirectory"

# 推送到 GitHub
git push origin main
```

**注意：** 如果遇到代理问题，可能需要：
- 检查网络连接
- 或稍后重试

### 4. 重新部署应用

推送成功后，重新运行部署脚本：

```powershell
cd c:\Users\peili\fastapi_hello\phaseBp1
python deploy.py --repo-url https://github.com/ashleywu/AI_agent_practice.git --service-name pw-aha-catcher --branch main
```

### 5. 验证部署

部署成功后：
1. 访问：`https://pw-aha-catcher.ai-builders.space/`
2. **清除浏览器缓存**（重要！）：
   - Chrome/Edge: `Ctrl + Shift + Delete` → 清除缓存
   - 或使用无痕模式：`Ctrl + Shift + N`
3. 验证是否显示新的 Aha! Catcher 应用

## 快速执行脚本

可以运行以下命令一次性完成步骤 1-3：

```powershell
cd c:\Users\peili\fastapi_hello

# 1. 更新根目录 Dockerfile
Copy-Item phaseBp1\Dockerfile . -Force

# 2. 提交更改
git add Dockerfile phaseBp1/Dockerfile
git commit -m "Update Dockerfile to build from phaseBp1 subdirectory"

# 3. 推送（如果网络正常）
git push origin main
```

## 如果遇到问题

### 网络/代理问题
- 检查网络连接
- 稍后重试 `git push` 和 `deploy.py`

### 部署超时
- 部署 API 可能需要更长时间
- 可以稍后重试，或检查部署状态

### 浏览器仍显示旧内容
- **必须清除浏览器缓存**
- 或使用无痕模式访问

## 总结

**立即执行：**
1. ✅ 更新根目录 Dockerfile
2. ✅ 提交并推送代码
3. ✅ 重新部署
4. ✅ 清除缓存并验证

完成后，你的应用就会从 `phaseBp1/` 子目录正确部署了！🎉
