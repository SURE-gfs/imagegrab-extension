# 图提取 ImageGrab

Chrome Manifest V3 电商图片提取、预览和 PNG 批量下载扩展，以及纯静态宣传官网。AI 编程实训项目。

## 安装

1. 下载 `docs/downloads/ImageGrab-1.0.0.zip` 并解压。
2. 在 Chrome 打开 `chrome://extensions`，启用开发者模式。
3. 点击“加载已解压的扩展程序”，选择包含 `manifest.json` 的扩展文件夹。
4. 刷新商品详情页，滚动等待详情图加载，然后点击右下角“获取图片”。

也可以通过扩展工具栏按钮扫描当前普通网页，或打开内置演示页。内置演示使用自制素材，并非真实电商页面。

## 功能与权限

- 详情页浮动按钮适配淘宝/天猫、京东、拼多多相关域名和详情路径。
- 收集 img、懒加载属性、srcset、picture source、CSS 背景图，补全 URL 并去重。
- 实际解码尺寸过滤小图；全选、反选与尺寸筛选。
- Service Worker 跨域读取、createImageBitmap + OffscreenCanvas 编码 PNG、downloads API 保存。
- 等待浏览器报告 complete 后才计为下载成功；失败项可重试。
- `activeTab` 与 `scripting`：用户主动扫描当前网页；`downloads`：保存图片；`storage`：保存最近 20 次提取记录。
- host_permissions 限于支持的平台及常见图片 CDN，不读取账号、密码或 Cookie。

图片保存在浏览器默认下载目录的 `ImageGrab` 文件夹。不同浏览器可能使用不同下载路径，请在浏览器设置中确认。

## 范围和限制

本工具不绕过登录、反爬或反盗链限制。需要先滚动页面使懒加载地址进入 DOM；跨域 iframe、网络拦截和站点改版可能影响提取。背景视频、Canvas、CSS 多层复杂图像不保证可提取。单图最大 30 MB / 4000 万像素，最多提取 500 个候选地址。尺寸过滤不能百分之百判断图片的语义或排除大尺寸 Logo。

## 目录

- `extension/`：完整可加载扩展，包括内置演示素材。
- `docs/`：官网与插件安装包；可由 GitHub Pages 的 main /docs 发布。
- `tests/`：真实扩展端到端测试和自制测试素材生成器。
- `TEST_REPORT.md`：测试证据、发现的问题和验证范围。

官网使用 HTML、CSS、原生 JavaScript，不依赖 CDN。直接打开 `docs/index.html` 可预览。
修改 `docs/css/style.css` 的 `--primary` 可调整主色；文案位于 `docs/index.html`。

仓库：https://github.com/SURE-gfs/imagegrab-extension
官网：https://SURE-gfs.github.io/imagegrab-extension/
