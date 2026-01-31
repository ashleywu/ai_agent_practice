# 修复部署问题 - 显示旧应用

## 问题
访问 https://pw-aha-catcher.ai-builders.space/ 看到的是之前的 chatbot，而不是新的 Aha! Catcher。

## 原因
1. ✅ **已修复**：代码文件已复制到根目录（app.py, index.html, Dockerfile）
2. ✅ **已提交**：代码已提交到 Git
3. ✅ **已重新部署**：部署状态显示 HEALTHY

## 解决方案

### 1. 清除浏览器缓存（最重要）
- **Chrome/Edge**: `Ctrl + Shift + Delete` → 清除缓存
- **或硬刷新**: `Ctrl + F5` 或 `Ctrl + Shift + R`
- **或使用隐私模式**: `Ctrl + Shift + N` 打开新的隐私窗口

### 2. 等待几分钟
部署完成后，CDN/负载均衡器可能需要几分钟来更新缓存。

### 3. 验证部署
检查部署是否使用了新代码：

```bash
# 检查部署状态
python deploy.py --list

# 查看运行时日志
curl https://space.ai-builders.com/backend/v1/deployments/pw-aha-catcher/logs?log_type=runtime \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 4. 强制重新部署
如果需要，可以删除并重新创建部署：

```bash
# 注意：这需要平台支持删除功能，或者联系管理员
```

## 验证步骤

1. **清除浏览器缓存**
2. **硬刷新页面** (`Ctrl + F5`)
3. **检查页面内容**：
   - 应该看到 "Aha! Catcher" 标题
   - 应该看到 "Capture Aha!" 按钮
   - 不应该看到 "ChatGPT Clone" 或聊天界面

4. **如果还是旧页面**：
   - 等待 5-10 分钟
   - 再次硬刷新
   - 检查部署日志确认使用了新代码

## 已完成的修复

✅ 将 `app.py` 复制到根目录  
✅ 将 `index.html` 复制到根目录  
✅ 将 `requirements.txt` 复制到根目录  
✅ 将 `Dockerfile` 复制到根目录（Python 版本）  
✅ 提交到 Git  
✅ 重新部署  

现在应该显示正确的应用了！
