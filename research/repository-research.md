# 明史网页游戏：开源底座调研

核实日期：2026-11-07（Asia/Shanghai）。以下结论来自项目官方 GitHub 仓库、README、许可文件和发布页；未依据第三方仓库推荐文章。

## 本项目采用的方案

采用 **固定版本 Phaser 3.90.0 + 原创 HTML/CSS/JavaScript 应用**。Phaser 用于地图或战术画布、动画和输入；剧情、人物、经营、存档、结局和分享界面由本项目实现。作为结构参考，选择 Phaser 官方无打包模板 [phaserjs/template-importmap](https://github.com/phaserjs/template-importmap)。该模板当前 README 明确列出 Phaser 3.90.0，说明可直接静态部署，也允许把引擎放在本地。

本项目没有克隆完整模板，也没有导入现成游戏的剧情或图片。实际复用的是从官方固定标签下载的 Phaser 引擎。使用本地 UMD 文件通过普通 `<script>` 加载，而非照搬模板的 ESM import map，因此避免增加打包器，同时保持引擎文件可核查、运行时不依赖第三方 CDN。这是一项针对本项目体量的工程选择，不代表已经验证所有浏览器或完成游戏测试。

没有直接采用官方 Vite 模板当前主分支：其仓库简介仍写 Phaser 3，但当前 [README](https://github.com/phaserjs/template-vite/blob/main/README.md) 和 [package.json](https://github.com/phaserjs/template-vite/blob/main/package.json) 已是 Phaser 4.0.0 / Vite 6.3.1。首版固定 3.90.0，避免把不匹配的示例 API 和主版本混用。3.90.0 的官方发布页日期为 2025-05-23；这里的“固定版本”不表示它是最新版本。

## 候选对比

| 仓库 | 已核实许可 | 适合复用的部分 | 本项目取舍 |
| --- | --- | --- | --- |
| [phaserjs/template-importmap](https://github.com/phaserjs/template-importmap) | [MIT](https://github.com/phaserjs/template-importmap/blob/main/LICENSE) | 无打包开发结构、场景组织、静态资源加载；README 固定 Phaser 3.90.0 | **最贴合本次部署结构，作为参考。** 原模板需 ESM 构建，本项目改用本地 UMD 引擎，不复制模板 |
| [phaserjs/template-vite](https://github.com/phaserjs/template-vite) | [MIT](https://github.com/phaserjs/template-vite/blob/main/LICENSE) | 维护中的官方工程模板，热更新、场景组织、生成静态 `dist` | 未来工程扩展可采用；当前主分支升级到 Phaser 4，首版不直接克隆 |
| [y-lohse/inkjs](https://github.com/y-lohse/inkjs) | [MIT](https://github.com/y-lohse/inkjs/blob/master/LICENSE.md) | 分支故事、条件与变量；浏览器零依赖运行；附带 [无服务器模板](https://github.com/y-lohse/inkjs/tree/master/templates/browser_serverless) | **叙事扩展的首选备选。** 当前事件规模可用原生数据驱动，暂不增加另一套运行时 |
| [Monogatari/Monogatari](https://github.com/Monogatari/Monogatari) | [MIT](https://github.com/Monogatari/Monogatari/blob/develop/LICENSE) | 视觉小说、对话、存读档、移动适配、离线 PWA、多媒体 | 适合故事占主导的替代方案；战斗和经营需自行扩展，不作为本次主底座 |
| [boardgameio/boardgame.io](https://github.com/boardgameio/boardgame.io) | [MIT](https://github.com/boardgameio/boardgame.io/blob/main/LICENSE) | 回合状态、阶段、机器人、联机同步、房间和行动日志 | 单人首版无需其联网栈；后续好友对弈可再评估 |
| [VickScarlet/remake](https://github.com/VickScarlet/remake) | [MIT](https://github.com/VickScarlet/remake/blob/main/LICENSE) | 人生重开类的事件和重复游玩形式，可参考结果卡的传播思路 | 原 `lifeRestart` 地址已重定向；当前为 pnpm + bun 多包工程。仅作为产品与机制参考，不整仓改造 |

这些仓库提供引擎、叙事系统或机制参考，并不提供已授权的《明朝那些事儿》完整改编游戏。“角色图鉴、明史剧情、资源经营、战役、每日挑战、结局分享”均需由本项目独立制作，不能写成上述模板自带功能。

## 已下载的引擎与校验信息

官方仓库：[phaserjs/phaser](https://github.com/phaserjs/phaser)

固定标签：[v3.90.0](https://github.com/phaserjs/phaser/tree/v3.90.0)

发布说明：[Phaser v3.90.0 / Tsugumi](https://github.com/phaserjs/phaser/releases/tag/v3.90.0)

| 本地文件 | 官方下载源 | 字节数 | SHA-256 |
| --- | --- | ---: | --- |
| `dist/vendor/phaser.min.js` | [固定标签下的 dist/phaser.min.js](https://raw.githubusercontent.com/phaserjs/phaser/v3.90.0/dist/phaser.min.js) | 1,196,122 | `e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7` |
| `dist/vendor/PHASER-LICENSE.txt` | [固定标签下的 LICENSE.md](https://raw.githubusercontent.com/phaserjs/phaser/v3.90.0/LICENSE.md) | 1,100 | `c3123cd25de4eccf1fd5a5a0a6fc872299116d1dbbb48b00f2554a4c35220a65` |

两个文件均在下载后检查了内容和 SHA-256；JavaScript 中存在 `3.90.0` 版本字样，许可文件包含 MIT。哈希由本地下载内容计算，用于后续完整性比对，并非作者另行提供的签名。

## 素材与许可处理

Phaser 引擎遵循 MIT，随分发保留已下载的完整许可与版权声明。模板代码的 MIT 许可不等于演示素材、书籍正文、人物画像或音乐全部可自由复用。

Phaser 官方模板 README 另行说明演示 Logo 和角色保留权利，因而本项目不复制这些演示图像。Vite 模板默认脚本还会运行 `log.js` 匿名统计；本项目没有引入该脚本。若未来整合 Vite 模板，可使用其官方 `dev-nolog` / `build-nolog` 脚本。

人物使用明朝真实历史人物；游戏文本和造型单独创作。本报告没有下载或复制当代书籍全文，也不构成书籍改编权的授权证明。

## 验证边界

已完成仓库和许可查阅、官方无打包方案查阅、固定版引擎与许可文件下载、文件版本字样与哈希检查。未因本次调研而声称整个应用已完成、全本故事已获授权、已经浏览器测试或已经上线。提交记录页面存在缓存差异，故未把页面可见日期当作仓库“最新提交时间”。
