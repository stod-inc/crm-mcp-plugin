# StoD CRM Plugin

CodexとClaude Codeから、StoDのCRMを本人として読み、本人のアカウントで許されている範囲で更新するための配布用repositoryです。

このrepositoryに、CRMのデータ、数字の定義、顧客・案件の情報、認証情報は含まれません。PluginはMCPの接続先とSkillだけを導入します。何が読めるか・何を書けるか・言葉の定義は、利用を認められた本人がブラウザでログインした後に、サーバーが返します。

AIへ設定を任せる場合は、[セットアッププロンプト](SETUP_PROMPT.md)をCodexまたはClaude Codeへ貼り付けてください。

## Codex

```bash
codex plugin marketplace add https://github.com/stod-inc/crm-mcp-plugin.git --ref main
codex plugin add stod-crm@stod-crm
```

Codexが`stod-crm`の認証を求めたら、ブラウザでログインを完了します。その後、Codexへ「CRMで自分に何ができるか確認して」と依頼します。

## Claude Code

```bash
claude plugin marketplace add https://github.com/stod-inc/crm-mcp-plugin.git
claude plugin install stod-crm@stod-crm --scope user
```

Claude Codeが`stod-crm`の認証を求めたら、`/mcp`から認証を開始し、ブラウザでログインを完了します。その後、Claude Codeへ「CRMで自分に何ができるか確認して」と依頼します。

## できること

できることは人によって違い、本人のCRMのアカウントで決まります。Pluginの側では決めていません。

- 書き込みは、ログインした本人の名前でCRMに残ります。
- AIは、書く前に内容を本人へ見せて了承を取り、書いた後に読み直して確かめます。

## 配布するもの

このrepositoryに置くのは、次の情報だけです。

- Codex・Claude Code用のmarketplace manifest
- MCPの接続定義
- 読む時・書く時の一般的な決まりを定めるSkill
- 導入・検証・セキュリティ報告の手順

サーバーのソース、数字の定義、運用手順は別の非公開repositoryで管理し、このrepositoryへ複製しません。Pluginを取得できても、利用を認められていない人は何も読めず、何も書けません。

## 更新

Pluginの版と、数字の新しさは別です。Pluginを更新していなくても、数字は読むたびに最新です。CRMの側に新しい操作が増えた時も、Pluginの更新は要りません。

## Security

脆弱性や認証境界の問題は、Issueへ詳細を書かず、GitHubのPrivate vulnerability reportingから報告してください。[SECURITY.md](SECURITY.md)も確認してください。
