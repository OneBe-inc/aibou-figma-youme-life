# YOU & ME LIFE — Figma implementation

指定された Figma の PC / SP フレームを再現した静的プレビューです。

- [公開ページ](https://onebe-inc.github.io/aibou-figma-youme-life/)
- [Figma source](https://www.figma.com/design/Y5b1RHBkw5u21o0DEXwFcN/?node-id=38-948)
- PC: 1440 × 9810 / SP: 375 × 9763

## Run

```sh
npm ci
npm run build
npm run dev
```

http://127.0.0.1:4187 を開きます。公開に必要なファイルは index.html、styles.css、app.js、assets/ です。GitHub Pages は main ブランチのルートを配信します。

## Structure

- source/: Figma の各セクションをもとにした TSX
- design/metadata.xml: 対象キャンバスのレイアウト寸法
- build.mjs: 静的 HTML / CSS の生成
- custom.css: レスポンシブ表示・メニュー・SP調整
- app.js: メニュー、アンカー、ヒーロー切替、ニュース送り
- assets/: ローカル保存された画像・装飾・フォント

React はビルド時のみ使用します。実行時は静的 HTML / CSS / JavaScript です。375px と1440px の元デザイン寸法を基準に、画面幅に合わせて拡縮します。768px未満でSP版に切り替わります。

## Behavior and scope

対象は node 38:948 配下の YOU & ME LIFE トップページです。SPデザインのProject内の空白やフッターの余白も元フレームに合わせています。メニューはページ内の各セクションへ移動し、詳細・カテゴリ・記事は既存公式サイトへリンクします。ヒーローのFUTURE/SCENERYは提供された2状態を切り替え、SUPPORTは事業紹介へ移動します。検索エンジン向けに noindex を設定しています。

## Assets

画像・ロゴ・装飾は指定Figmaの原素材を使用しています。SNSアイコンは同ブランド公式サイトの原素材です。著作権は各権利者に帰属し、このリポジトリは素材の再利用ライセンスを付与しません。Noto Sans JP、Sen、Poppins のフォントライセンスは assets/fonts-license/ を参照してください。

## Verification

PC1440px / SP375px で元フレームと目視照合。画像ロード、横スクロール、メニュー開閉、Escキー、ニュース送りをブラウザーで確認しています。
