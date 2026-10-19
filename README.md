# Decision Studio

中英双语决策辅助网站，支持自动识别选项、偏好调整、本地决策日志和可选塔罗入口。

A bilingual decision companion with a persistent local journal and optional tarot invitation.

线上演示 / Live demo: https://effervescent-sprinkles-f61a67.netlify.app/

## 开源与贡献 / Open source and contributions

本项目采用 [MIT License](LICENSE)，允许任何人使用、复制、修改和分发代码，包括商业用途，需保留原版权与许可声明。欢迎 Fork 后修改，并通过 Pull Request 贡献到主仓库；主仓库的写入权限由维护者管理。详见 [贡献指南](CONTRIBUTING.md)。

Licensed under the [MIT License](LICENSE): anyone may use, copy, modify, and redistribute the code, including commercially, while retaining the copyright and license notice. Fork the repository to make changes and submit a pull request to contribute them back. Maintainers manage direct write access. See [CONTRIBUTING.md](CONTRIBUTING.md).

第三方依赖和外部服务保留各自的许可证与条款；本仓库的 MIT 许可证不授予 TUTTO TAROT 网站或其素材的使用权。 / Third-party dependencies and external services retain their own licenses and terms. This repository's MIT License does not grant rights to the TUTTO TAROT website or its assets.

## Run

Use Node.js 22.12 or newer (Node 24 LTS recommended).

从此文件夹运行 / From this folder:

```bash
npm ci
npm run dev
```

Open the local URL Vite prints. For a production check, use `npm run build`.

## Demo mode

The app starts in clearly labeled **Demo mode** with no API key required. Describe your dilemma with its choices in a single text box, then select **Review and confirm options**. The app extracts explicitly written alternatives and fills the options for review. From there, **See my clarity** generates the analysis, or **Keep refining** lets you adjust context and priorities.

The local parser supports common Chinese and English alternatives, including “旅行还是买相机”, “travel or buy a camera”, explicit lists, and yes/no questions. It does not use a live AI service. If it cannot identify 2–4 different choices, you can add or adjust them on the options page.

输入一段包含选择的文字，识别结果会显示在输入框下方。第一步仅保留「查看并确认选项」入口，查看自动填入的选项后，点击「查看决策分析」；也可继续按需调整背景和偏好。

To check extraction behavior, run `node --test src/decisionInput.test.js`.

## Persistent history

Analyses save automatically to this browser's LocalStorage. Open **My Journal** to search, filter, sort, revisit, edit, reanalyze, mark a final choice, archive, print, copy, or delete a decision. Data stays on this device and browser.

## Optional tarot reading / 可选塔罗占卜

After reviewing an analysis, choose an option and select **Confirm my choice**. The app saves it as **Decided** and immediately asks **Want a tarot reading?**. The invitation is also available when confirming a choice in the journal. **Go to TUTTO TAROT** opens https://tuttotarot.com/ in a new tab; **Not now**, Escape, or the close button dismisses it. Revisiting a saved choice does not show the invitation again automatically. Use **Try a tarot reading** to reopen it.

用户确认最终选项后，会立即看到「要不要占卜一下？」。点击「去占卜」在新页面打开 TUTTO TAROT，也可以选择「暂时不用」。选择已保存到本地日志；再次打开日志不会重复弹窗，可点击「占卜一下」重新打开。界面支持中英文，决策文本不会发送给塔罗网站。

## Secure AI configuration

The shipped MVP uses deterministic Demo mode so it works without credentials. To add live AI, put a server-side endpoint behind the `generate` action in `src/main.jsx`; keep provider keys in server environment variables and return a validated analysis object. Never place a provider key in frontend code or LocalStorage.

## 中英双语 / Bilingual UI

页面右上角的 `中文 / EN` 按钮可以切换中文和英文。语言偏好会保存在当前浏览器中；决策内容和历史记录会继续保留。

Use the `中文 / EN` control in the top bar to switch languages. The preference is saved in this browser, while decision inputs and history remain intact.

## Deployment / 部署

Run `npm run build` and publish the generated `dist/` folder to a static hosting service such as Netlify. The existing public site is hosted on Netlify; storing this source on GitHub does not change that site.

执行 `npm run build` 后，将生成的 `dist/` 目录部署到 Netlify 等静态网站平台。源码仓库不包含用户在浏览器中保存的决策记录。
