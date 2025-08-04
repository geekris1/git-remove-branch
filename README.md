# git-remote-branch

一个交互式的 Git 分支管理命令行工具，支持删除本地和远程分支。

## 功能特性

- 🔄 交互式选择本地或远程分支
- 📋 自动获取分支列表
- 🎯 支持命令行参数快速选择
- ✅ 删除前确认操作
- 🛡️ 防止删除当前分支
- 🌐 支持 npx 直接执行
- 📦 支持批量删除多个分支
- 🔍 自动过滤已删除的远程分支

## 安装

### 全局安装

```bash
npm install -g git-remote-branch
```

### 本地安装

```bash
npm install git-remote-branch
```

## 使用方法

### 交互式使用

```bash
# 使用完整命令名
git-remote-branch

# 使用简写命令
grb
```

### 使用 npx（无需安装）

```bash
npx git-remote-branch
```

### 直接指定分支类型

```bash
# 直接管理本地分支
git-remote-branch local
grb local

# 直接管理远程分支
git-remote-branch remote
grb remote
```

## 使用流程

1. **选择分支类型**（如果未通过参数指定）

   - 本地分支
   - 远程分支

2. **查看分支列表**

   - 工具会自动获取并显示可删除的分支
   - 当前分支会被自动过滤掉

3. **选择要删除的分支**

   - 使用空格键选择/取消选择多个分支
   - 使用方向键导航
   - 按回车确认选择

4. **确认删除操作**
   - 查看选中的分支列表
   - 再次确认是否要删除选中的分支
   - 选择 "是" 执行批量删除，选择 "否" 取消操作

## 示例

```bash
$ grb
请选择要管理的分支类型:
❯ 本地分支
  远程分支

请选择要删除的本地分支:
❯ ◯ feature/login
  ◯ feature/user-profile
  ◯ hotfix/bug-123

已选择以下本地分支:
  - feature/login
  - feature/user-profile

确定要删除这 2 个本地分支吗? (y/N)
```

## 注意事项

- 确保在 Git 仓库目录中运行此工具
- 删除本地分支时，当前分支会被自动过滤
- 删除远程分支需要相应的权限
- 所有操作都有确认步骤，防止误删
- 远程分支列表会自动过滤已删除的分支，只显示实际存在的分支

## 开发

### 安装依赖

```bash
npm install
```

### 本地测试

```bash
npm start
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
