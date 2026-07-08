# Changelog

## 2026-07-08

### 站点接入
- `site.config.ts` 指向用户自己的 Notion 页面（`rootNotionPageId`），站点名 `BuX`，域名 `bbyb.me`，作者 `Alex`。

### Bug 修复
- **本地开发图片报错 `resolved to private ip`**：本机系统代理（Clash，fake-ip DNS 把 `notion.so` 解析到 `198.18.0.0/15` 保留网段）触发了 `next/image` 内置的 SSRF 防护。`next.config.js` 加了 `images.unoptimized`，仅非生产环境生效，线上 Vercel 没有本地代理，不受影响。
- **Vercel 部署报错：`api/social-image` 超过 1MB Edge Function 限制**：该路由原来用 `runtime = 'edge'`，加上 `notion-client` 依赖后打包体积超过 Hobby 计划上限。这个接口只被社交平台爬虫偶尔请求，不需要 edge 低延迟，改成默认 Node.js serverless runtime（无 1MB 限制）。同时修了两处只在 edge runtime 下才成立的写法：`req.url` 从绝对 URL 改成按 `host` header 解析相对路径、`return new Response()` 改成 `res.status().send()` 管道。
- **首页 hydration mismatch**（"Blog Posts" 附近报错）：根因是这个页面是从模板 Duplicate 来的，Notion 后端还在把内容从原模板异步复制进用户自己的 space，复制收敛完成前，同一个 block 的请求可能返回不一致的数据（有时带内容、有时是空的），导致 SSR/CSR 渲染出的 DOM 对不上。删除了一个确认没有实际内容、纯占位的空 block（`e1884660-...`）。其余不稳定属于 Notion 后端过渡态，会自愈，不是代码 bug，也不该在代码层面强行掩盖。

### 设计优化（对照经典个人博客做了一轮走查后落地）
- **URL 结构**：`pageUrlOverrides` 把 About / Contact 从带 Notion ID 的路径清理成 `/about`、`/contact`。
- **导航**：`navigationStyle: 'custom'` + `navigationLinks`，首页顶部常驻 About / Contact 导航，不用再翻内页找链接。
- **图片组件现代化**：`nextLegacyImage` → `nextImage`，用 `next/image` 替换已弃用的 `next/legacy/image`，消除 dev 环境的 deprecation 警告。

### 视觉设计复刻（参照 lipreadingmom.com 的 WordPress "Fresh & Clean" 主题）
从目标站点实抓的 `style.css` 里取了具体设计 token，映射到 `react-notion-x` 的 CSS 变量体系：
- **画布/卡片布局**：`body` 浅灰底 `#f6f6f6`，`.notion-frame` 变成居中白色卡片（`max-width:960px`、边框、圆角、阴影），导航栏 `.notion-header` 从原来的毛玻璃固定悬浮改成卡片内 `sticky` 定位、纯色浅灰底。
- **字体**：`next/font/google` 引入三套字体（`lib/fonts.ts`）——站点标题用手写体 `Pacifico`（对应目标站的 `#site-title`），标题/文章标题用 `Noto Serif`（`Droid Serif` 已被 Google Fonts 废弃，用同源近似字体替代），正文/导航用 `Noto Sans`（替代 `Droid Sans`）。
- **配色**：链接改成纯蓝 `#0099ff`、正文文字改成柔和灰 `#707070`（覆盖 `.notion` 作用域下的 `--fg-color`）、引用块改成浅灰底+灰边框。
- **首页布局**：`.notion-gallery-grid` 从多列卡片网格改成纵向文章列表（缩略图左、标题摘要右），条目间用细分割线，对应目标站的博客列表样式。
- **暗色模式**：目标站是纯浅色站点，因此移除了本项目原有的暗色模式切换（`NotionPageHeader`/`Footer` 里的切换按钮、`NotionPage.tsx` 的 `dark-mode` 逻辑、`_document.tsx` 里的 noflash 脚本），并删除了不再使用的 `lib/use-dark-mode.ts`、`lib/icons/{sun,moon}.tsx` 和 `@fisch0920/use-dark-mode` 依赖。

---

## 待办 / 后续优化

### 信息架构（已识别，需要先在 Notion 内容结构上做决定，再回来动代码）
- 标签 / 分类体系
- 按年份的归档视图
- "精选文章" 或"从这里开始看"入口
- 视具体内容需求再确定要不要加 `/now` 之类的页面

### 其他待办
- 品牌信息未填：`site.config.ts` 里 `description`、`twitter`、`github`、`linkedin` 仍是空字符串；`public/favicon.*` 还是模板作者原装图标，需要换成自己的。
- 排版细节：正文阅读的字体/行宽/字号目前是模板默认值，没有针对长文阅读专门调优过。
