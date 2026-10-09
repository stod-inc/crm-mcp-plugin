# 接続の設定と、つながらない時

MCPサーバーへ、利用を認められた本人がブラウザでログインしてつなぐ。接続先はPluginの `.mcp.json` を正とし、鍵やトークンを端末・repository・会話へ書かない。

## Codex

```bash
codex plugin marketplace add https://github.com/stod-inc/crm-mcp-plugin.git --ref main
codex plugin add stod-crm@stod-crm
```

Codexが `stod-crm` の認証を表示したら Authenticate する。ブラウザで本人のログインを終えたら、最初に `crm_guide` を呼ぶ。

## Claude Code

```bash
claude plugin marketplace add https://github.com/stod-inc/crm-mcp-plugin.git
claude plugin install stod-crm@stod-crm --scope user
```

`/mcp` から `stod-crm` を選んで Authenticate する。ブラウザで本人のログインを終えたら、最初に `crm_guide` を呼ぶ。

## 以前の版（読み取り専用）を入れている時

名前が変わったので、古いPluginを外してから入れ直す。古いPluginの名前は、導入済みのPluginの一覧で確かめる。

## つながらない時

| 起きたこと                       | すること                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| ブラウザのログインが始まらない   | Pluginが入っているか、MCPの接続状態を確認する。Authenticate をやり直す。                 |
| 401                              | ログインの期限が切れている。Authenticate をやり直す。                                    |
| 403                              | ログインはできたが、使う許可が無い。管理者へ知らせる。                                   |
| 404                              | Pluginが古いか、サーバーの更新中。Pluginを更新してやり直す。                             |
| 503                              | サーバー側の設定の問題。管理者へ知らせる。                                               |
| ツールがエラーを返す             | 一時的な問題のことがある。少し待ってやり直す。続く時は管理者へ知らせる。                 |
| 使えるツールが思ったより少ない   | できることは本人のCRMのアカウントで決まる。`crm_guide` が返す理由を管理者へ知らせる。    |
| 書き込みの結果が分からないと出た | 送り直す前に、書き込む先の記録を読んで、書けたかを確かめる。分からない時は管理者へ聞く。 |

つながらない間は、数字を「取得できなかった」と伝える。古い資料や記憶の数字を現在の値として使わない。
