# 参与贡献 / Contributing

欢迎修复问题、改进界面或补充中英翻译。任何人都可以 Fork 此仓库，在自己的副本中修改代码，并提交 Pull Request。主仓库由维护者审查后合并。

Bug fixes, UI improvements, and Chinese/English translation updates are welcome. Anyone can fork this repository, edit their copy, and open a pull request. A maintainer reviews changes before merging them into this repository.

## 开始修改 / Make a change

1. 点击仓库右上角 **Fork**，复制到自己的 GitHub 账号。 / Fork the repository to your own GitHub account.
2. 在自己的副本创建分支并修改代码；小修改可直接使用 GitHub 网页编辑器。 / Create a branch in your fork and make your changes. For small edits, the GitHub web editor is enough.
3. 本地开发使用 Node.js 24，执行以下命令。 / For local development, use Node.js 24 and run:

```bash
npm ci
npm run dev
```

4. 提交前运行检查，并在涉及界面时检查中英文与手机布局。 / Before submitting, run the checks below and verify both languages and mobile layouts when changing the UI.

```bash
node --test src/decisionInput.test.js
npm run build
```

5. 从自己的分支向本仓库的 `main` 分支提交 **Pull Request**，说明改动、原因和验证结果。界面变动可附截图。 / Open a pull request from your branch to this repository's `main` branch. Explain what changed, why, and how you checked it. Screenshots help for UI changes.

## 报告问题 / Report an issue

通过 [Issues](https://github.com/rernmm-oss/decision-studio/issues) 提供复现步骤、期望结果和实际结果；示例请使用虚构的决策内容。 / Use [Issues](https://github.com/rernmm-oss/decision-studio/issues) to share reproduction steps, expected behavior, and actual behavior. Use fictional decisions in examples.

请勿提交 API 密钥、个人决策记录、`node_modules/` 或 `dist/`。 / Do not commit API keys, personal decision records, `node_modules/`, or `dist/`.

本项目采用 [MIT License](LICENSE)。请仅提交你有权以该许可证提供的代码。 / This project uses the [MIT License](LICENSE). Submit only code you have the right to provide under that license.
