# 故障排除指南

## 查看错误信息

如果扩展程序显示"Errors"按钮（红色），请按以下步骤查看具体错误：

1. **点击红色的"Errors"按钮**
   - 会显示错误详情

2. **或者点击"Inspect views service worker"**
   - 打开开发者工具
   - 查看 Console 标签页中的错误信息

3. **常见错误类型：**
   - **Syntax Error**: 语法错误
   - **ReferenceError**: 未定义的变量或函数
   - **TypeError**: 类型错误
   - **Import Error**: 导入文件失败

## 常见问题修复

### 问题 1: importScripts 路径错误
**错误信息**: `Failed to load module script` 或 `importScripts failed`

**解决方法**:
- 确保 `utils/storage.js` 和 `utils/category-classifier.js` 文件存在
- 检查文件路径是否正确

### 问题 2: Service Worker 无法启动
**错误信息**: `Service worker registration failed`

**解决方法**:
- 重新加载扩展程序
- 检查 manifest.json 语法是否正确

### 问题 3: 权限错误
**错误信息**: `Cannot access tabs API`

**解决方法**:
- 确保 manifest.json 中有 `"tabs"` 权限
- 重新加载扩展程序

## 快速修复步骤

1. **重新加载扩展程序**
   - 打开 `chrome://extensions/`
   - 点击扩展程序的刷新图标

2. **清除缓存**
   - 点击"Remove"移除扩展
   - 重新加载扩展程序

3. **检查文件完整性**
   - 确保所有文件都存在
   - 检查文件权限

## 报告错误

如果问题仍然存在，请提供：
1. 错误信息（从 Errors 按钮或 Console）
2. Chrome 版本
3. 操作系统版本
