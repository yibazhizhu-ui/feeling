# feeling

[打开网页](https://yibazhizhu-ui.github.io/feeling/) · [GitHub 仓库](https://github.com/yibazhizhu-ui/feeling)

一个先感受、再记录的手机网页 App。原生 HTML / CSS / JavaScript，无第三方运行依赖。

**当前状态：本机记录版本。账号、云数据库和多设备同步尚未接入；不会把本机记录上传到 GitHub。**

代码采用 MIT 许可，可以 Fork、自行部署和继续开发。素材授权单独说明，见 [ASSETS.md](ASSETS.md)。`package.json` 的 `private: true` 只防止误发布到 npm，不影响 GitHub 开源。

## 运行

```sh
node server.mjs
```

需要 Node.js 22 或更高版本。打开 http://127.0.0.1:4173。手机尺寸优先，桌面显示居中的手机画幅。

```sh
node --test
node scripts/build.mjs
```

## 体验

- 原创 SVG 占位插画以 cover 方式铺满手机画幅，保留比例并裁切两侧。
- 开场约 7.5 秒，WebGL 在 12 fps 下模拟树影、海面运动，CSS 叠加薄雾和光影。
- 约 3.3 秒渐进模糊、放大、融入浅黄色；“进入”可提前触发转场。
- 不支持 WebGL 时使用静态插画与 CSS 氛围层；系统减少动态效果时关闭持续动画。
- 心情滑杆范围 -100 到 100，中间 ±5 自动吸附到 0，键盘方向键每次移动 10。
- 每个本地自然日保存一条心情，再次记录会更新当天条目；可附加最多 280 字的文字。
- 心情足迹显示本浏览器历史。数据保存在 localStorage，未接入账号或云同步；清除浏览器数据会清除记录。

## 结构

- `index.html`：开场、首页、记录、保存反馈、历史。
- `src/styles.css`：手机布局、纸感、动效、减少动态效果适配。
- `src/scene.js`：原始图片的局部动态着色器与静态回退。
- `src/app.js`：页面状态和交互。
- `src/mood.js`：指针吸附、心情映射、本地日期。
- `src/storage.js`：本机记录读写。

当前为可运行网页原型，尚未打包为 iOS / Android 安装包。动态海景来自原创占位插画的视觉模拟，不是真实视频；无音频播放。

## 部署与参与

- [GitHub 与免费 Pages 发布](docs/GITHUB_SETUP.md)：仓库发布步骤和 Actions 工作流。
- [账号与云同步方案](docs/CLOUD_PLAN.md)：计划使用 Supabase，建议主数据库位于 AWS 新加坡；列明免费额度、账号/项目隔离和备份限制。**数据库尚未创建，真实地区尚未确定。**
- [安全与隐私](SECURITY.md)；[贡献指南](CONTRIBUTING.md)；[代码许可](LICENSE)。

公开网页上线后，每个人都可打开使用；当前记录仍各自保存在访问者自己的浏览器。设备之间的同步须等云版本上线。通过不同域名或地址打开页面，会使用各自独立的浏览器存储。
