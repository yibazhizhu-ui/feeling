# 安全与隐私

## 当前版本

当前版本没有账号或云数据库。心情数据保存在当前浏览器的 localStorage，未发送到项目服务器；无第三方统计脚本。设备上的其他使用者、浏览器扩展以及同源脚本可能访问本机记录，当前记录未作端到端加密。

公开仓库仅包含程序和展示素材，不应包含用户记录或数据库导出。GitHub Pages 的页面访问由 GitHub 提供服务，平台仍可能处理访问日志。

## 报告漏洞

不要把个人心情或密钥贴到公开 Issue 中。若仓库启用了 GitHub Private vulnerability reporting，请通过 Security → Report a vulnerability 私下报告；未启用时，先用不含敏感细节的 Issue 请求维护者提供私密联系渠道。

## 云版本上线门槛

参见 [云同步方案](docs/CLOUD_PLAN.md)。数据库权限必须由服务端/RLS 验证，不能仅依赖页面隐藏数据。不得将 `service_role`、数据库密码或 OAuth client secret 放入前端、GitHub 仓库或 Pages 构建产物。

上线前验证：匿名访问被拒绝；账号 A 无法读写账号 B；项目 A 无法访问项目 B；退出和切换账号后清空旧用户缓存；备份已能实际恢复。
