# 账号与云同步方案（待实施）

核对日期：2026-10-20。本文是下一阶段方案，**当前没有创建数据库、启用登录或上传心情数据**。

## 服务、地区与费用

| 用途 | 服务 | 建议位置 | 当前状态 |
| --- | --- | --- | --- |
| 源代码 | GitHub 公开仓库 | GitHub 托管 | [已公开](https://github.com/yibazhizhu-ui/feeling) |
| 网页 | GitHub Pages | GitHub 分发网络，不保证固定地区 | [已配置 Pages](https://yibazhizhu-ui.github.io/feeling/)，部署结果见仓库 Actions |
| 登录 | Supabase Auth | 与所选 Supabase 项目配套 | 未创建 |
| 主数据库 | Supabase 托管 PostgreSQL | AWS 新加坡 `ap-southeast-1` | 建议地区，尚未实际选定 |
| 备份 | 单独的私有、加密备份目的地 | 上线前选定并记录 | 未配置 |

新加坡是初步建议，实际部署时需在控制台选择明确的 **Specific region**，并把真实区域写回此文档。每个 Supabase 项目的主数据位于所选主区域；平台日志、遥测及服务元数据等可能在其他地区处理，不能宣称全部数据绝不离开新加坡。

- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) 支持免费公开仓库的静态网页托管；不负责保存私密心情。
- [Supabase Free](https://supabase.com/pricing) 当前为 $0/月，包含 500 MB 数据库、50,000 月活用户、5 GB 出站流量、1 GB 文件存储；最多 2 个活跃免费项目。一个星期不活跃可能暂停。免费版不含自动备份或时间点恢复。
- 付费 Pro 当前 $25/月起，包含 7 天日备份；本阶段不启用任何付费方案。配额、可用性和费用以上线时官网为准。
- [地区文档](https://supabase.com/docs/guides/platform/regions)；[数据所在地说明](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq)。

如果目标用户主要在中国大陆，需要在实际网络环境验证访问速度和可用性，不能假定海外托管服务处处可用。

## “项目”和“账号”的数据归属

区分三层：

1. **独立部署**：不同开源部署使用各自的 Supabase 项目、数据库和密钥。Fork 代码不会获得原站的数据或后台权限。
2. **应用内项目**：一个用户可以有自己的多个日记本/项目。默认建立“我的心情”，以后可以扩展。
3. **用户账号**：由 Supabase Auth 提供稳定的用户 UUID。不同设备登录同一账号，读取同一份云数据。

建议表结构：

| 表 | 主要字段 | 约束与用途 |
| --- | --- | --- |
| `projects` | `id`, `owner_id`, `name`, `created_at` | `owner_id` 关联 `auth.users.id`；`(id, owner_id)` 唯一 |
| `mood_entries` | `id`, `project_id`, `user_id`, `entry_date`, `value`, `note`, `version`, `updated_at`, `deleted_at` | `(project_id, user_id, entry_date)` 唯一；`(project_id,user_id)` 外键关联 `projects(id,owner_id)` |
| `entry_revisions` | `id`, `entry_id`, `project_id`, `user_id`, `version`, `snapshot`, `created_at` | 服务端保存修改历史，用于恢复；用户不可任意改写历史 |

`value` 数据库约束为 -100 到 100 的整数；备注限制 280 字；时间由服务器产生，日记日期按用户选定时区计算，不能把 UTC 日期直接当作当天。

## 访问隔离

开启所有公开 API 表的 [PostgreSQL Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)：

- 未登录用户无权访问云端心情。
- `projects` 的 SELECT/INSERT/UPDATE/DELETE 均验证 `auth.uid() = owner_id`。
- `mood_entries` 的每项操作均验证 `auth.uid() = user_id`，并确认对应项目属于该用户；UPDATE 同时使用 USING 和 WITH CHECK，禁止把记录转给他人。
- 版本表对普通用户只开放本人记录的读取，由受保护的服务端逻辑写入。
- 外键约束防止把自己的记录绑定到其他人的项目。
- 前端只持有公开 publishable key；这不是管理员密钥，安全性依赖 RLS 和登录凭据。secret/service_role key 可以绕过 RLS，只能留在受控服务端。
- HTTPS、管理员 MFA、最少后台成员权限、精确回调域名白名单；生产环境和开发环境分开。

这些措施尚未配置或验证。它们提供访问隔离，不等于端到端加密：持有合法数据库管理员权限的人仍可能读取明文心情。若需要“管理员也无法读取”，需另行设计客户端加密与密钥恢复。

## 登录与多设备同步

第一版计划：Supabase Auth 邮箱登录，配合确认邮件和密码重置。公开开放注册前必须配置可用 SMTP；Supabase 默认测试邮件服务限制收件人和速率，不能直接当公开邮件服务使用。邮件服务的免费额度单独核实。GitHub/Google OAuth 可作为后续替代入口。[邮件服务说明](https://supabase.com/docs/guides/auth/auth-smtp)

同步行为：

1. 登录成功后，按账号与项目读取云端记录。
2. 本机旧记录不会在首次登录时自动上传；用户选择导入后才迁移，并保留原副本。
3. 本地待同步队列按部署、用户、项目分别分区；切换账号不得混入上一账号的数据。
4. 保存使用服务端事务与版本号比较；并发修改时保留两个版本并提示选择，不静默覆盖另一设备的内容。
5. 使用记录 ID / 幂等操作标识防止断网重试产生重复写入。
6. 页面显示“仅本机 / 待同步 / 已同步 / 同步失败”，仅服务器确认成功后显示“已同步”。
7. 页面重新获得焦点、重新联网时拉取更新；实时订阅可再增加。
8. 退出时移除会话、该用户缓存和订阅；处理未同步数据时先提醒，不能直接清空。

## 防止数据丢失

不能保证绝对不丢失。云同步解决多设备一致性，备份用于恢复误删、错误覆盖和服务故障；二者不可互相替代。

- 用户可导出自己的 JSON 记录并导入恢复（待实现）。
- 管理员定期导出数据库、加密存放到独立私有目的地，不提交到公开 GitHub、不作为公开 Actions artifact。
- 默认目标：每天备份、保留最近 7 份每日备份和 4 份每周备份。每天备份仍可能丢失最近 24 小时内的数据；具体 RPO/RTO 上线前验证后再承诺。
- 每月在隔离测试项目演练恢复，覆盖表结构、权限、记录；不能只验证“文件下载成功”。
- 删除先软删除并保留修订记录；永久删除、账号删除及备份保留期限需在隐私说明中明确。
- 对备份失败、配额不足和项目暂停建立告警（尚未设置）。

免费版需要自行安排备份。Supabase 官方也建议免费项目定期导出并保留异地副本；删除项目会移除项目及其相关备份。[官方备份说明](https://supabase.com/docs/guides/platform/backups)

## 下一阶段实施顺序

1. 确认 GitHub 仓库和 Pages 上线。
2. 在项目所有者的 Supabase 账号下创建免费项目，记录真实地区和实际配额。
3. 提交 SQL migration，配置 RLS、约束与版本更新逻辑。
4. 接入登录、验证邮件、找回密码、账号退出。
5. 接入数据隔离、待同步队列、冲突处理与数据导入导出。
6. 两个账号 × 两个项目 × 两台设备验证隔离及同步；测试离线重试、重置密码和过期会话。
7. 配置私有备份、执行恢复演练，再开放云同步。
