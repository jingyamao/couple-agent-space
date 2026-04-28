# GitHub 协作与保存代码流程

## 推荐仓库

仓库名建议使用：`couple-agent-space`

## 每次开发保存代码

```bash
git status
git add .
git commit -m "描述本次完成的功能"
git push origin main
```

## 如果本机已安装并登录 GitHub CLI

```bash
gh repo create couple-agent-space --private --source=. --remote=origin --push
```

## 如果没有 GitHub CLI

1. 在 GitHub 网页端创建一个空仓库：`couple-agent-space`
2. 不要勾选 README、.gitignore、license
3. 在本地执行：

```bash
git remote add origin git@github.com:<你的用户名>/couple-agent-space.git
git push -u origin main
```

也可以使用 HTTPS：

```bash
git remote add origin https://github.com/<你的用户名>/couple-agent-space.git
git push -u origin main
```
