# 设置新 GitHub 仓库指南

## 目标
创建新仓库 `github.com/ashleywu/ahacatcher` 专门用于 Aha! Catcher 项目

## 步骤

### 步骤 1: 在 GitHub 上创建新仓库

1. 访问：https://github.com/new
2. 仓库名称：`ahacatcher`
3. 描述：`Aha! Catcher - Voice-powered idea capture app`
4. 选择：**Public** 或 **Private**
5. **不要**勾选 "Initialize with README"（我们要推送现有代码）
6. 点击 **Create repository**

### 步骤 2: 准备本地代码

由于当前代码在 `phaseBp1/` 子目录中，我们需要：

**选项 A: 在 phaseBp1 目录中初始化新仓库（推荐）**
- 保持代码在当前位置
- 初始化新的 git 仓库
- 推送到新仓库

**选项 B: 创建独立的项目目录**
- 创建新目录 `ahacatcher`
- 复制所有文件
- 初始化 git 仓库

### 步骤 3: 执行设置脚本

运行 `setup_new_repo.ps1` 脚本（见下方）

## 快速执行

```powershell
# 1. 在 GitHub 网页上创建新仓库（手动）

# 2. 运行设置脚本
cd c:\Users\peili\fastapi_hello\phaseBp1
.\setup_new_repo.ps1
```
