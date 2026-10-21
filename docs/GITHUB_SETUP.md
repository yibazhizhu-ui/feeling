# GitHub 发布

当前目录已准备好公开仓库源代码、MIT 代码许可、测试、静态构建和 Pages 自动发布。

## 已登录 GitHub CLI 时

以下命令仅适用于尚未关联远程仓库的本地副本。若仓库已创建，请复用实际仓库地址，不要重复创建。

```sh
git add .gitignore .github ASSETS.md CONTRIBUTING.md LICENSE README.md SECURITY.md assets index.html package.json scripts server.mjs src tests docs
git commit -m "Initial open-source Feeling app"
gh repo create feeling --public --source=. --remote=origin --push --description "A quiet, mobile-first mood journal"
```

Git 提交身份应使用项目所有者的姓名与 GitHub 提供的隐私邮箱；不要把邮箱猜成不存在的账号。若本机尚未认证，可通过 GitHub CLI 的官方浏览器登录流程登录，不要把密码或访问令牌粘贴到聊天或提交文件里。

## 启用网页

1. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
2. Actions → Deploy Feeling to GitHub Pages → Run workflow。
3. 等待成功，在 Pages 设置或部署结果中读取真实网址。

预期网址形式为 `https://<owner>.github.io/feeling/`，以 GitHub 的实际输出为准。仓库存在并不代表网页已经部署成功。

工作流只发布 `dist/` 中的前端文件，不发布服务器脚本、测试、文档、密钥或用户导出。所有前端资源采用相对路径，兼容仓库子路径。

## 本地构建与验证

```sh
node --test
node scripts/build.mjs
node server.mjs
```

当前公开网页仍是本机存储版本。账号与数据库按 [CLOUD_PLAN.md](CLOUD_PLAN.md) 在下一阶段接入。
