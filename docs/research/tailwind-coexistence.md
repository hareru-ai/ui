# Tailwind CSS 共存戦略 — 調査レポート

> 調査日: 2026-03-14
> ブランチ: `research/tailwind-coexistence`

## 背景

Hareru UI を社内ドッグフーディングする中で、以下の現実的ニーズが明確になった:

1. **shadcn/ui との並行運用** — 既存プロジェクトで shadcn を使っている場合の段階的導入
2. **AI エージェントの Tailwind 生成** — v0, Cursor, Claude 等が Tailwind 前提で UI を生成する傾向
3. **エコシステム互換性** — Tailwind ベースのライブラリとの混在

## 調査結論

**Hareru UI は設計上 Tailwind CSS との共存リスクが極めて低い。CSS Cascade Layers の導入と AI Context 強化で完全な共存が可能。**

---

## 1. 内部衝突リスク分析

### CSS 変数: 衝突なし

| システム | パターン | 例 |
|---------|---------|-----|
| Hareru UI | `--hui-{category}-{name}` | `--hui-color-primary` |
| Tailwind v4 | `--color-*`, `--spacing-*` | `--color-blue-500` |
| shadcn/ui | `--{name}` (prefix なし) | `--primary`, `--background` |

`--hui-` プレフィックスにより名前空間が完全に分離されている。

### クラス名: 衝突なし

| システム | パターン | 例 |
|---------|---------|-----|
| Hareru BEM | `hui-{component}` | `hui-button`, `hui-card__header` |
| Tailwind | utility classes | `flex`, `px-4`, `bg-primary` |

BEM クラスと Tailwind ユーティリティは異なるドメイン。混在は安全:

```html
<div class="hui-card flex items-center gap-4">
  <button class="hui-button hui-button--primary px-4">Click</button>
</div>
```

### ベーススタイル: 軽微な重複（管理可能）

| スタイル | Hareru | Tailwind Preflight |
|---------|--------|--------------------|
| `box-sizing: border-box` | 同一 | 同一 |
| `margin: 0; padding: 0` | 同一 | 同一 |
| `body { font-family }` | CSS 変数ベース | ハードコード |

方向性が同じため、読み込み順序で制御可能。

### Specificity: 問題なし

Hareru BEM (`.hui-button`) と Tailwind utility (`.flex`) は同じ specificity `(0,1,0)`。
Cascade 順序で自然に解決される。

---

## 2. 共存方式の比較

### Option A: CSS Cascade Layers ★推奨

```css
/* Tailwind v4 は @layer を自動生成 */
@import "tailwindcss";

/* Hareru UI を components layer に配置 */
@import "@hareru/ui/styles.css";
```

Tailwind v4 のネイティブ Cascade Layers:
```
@layer theme      → CSS 変数定義
@layer base       → Preflight (リセット)
@layer components → Hareru UI の BEM スタイル ← ここ
@layer utilities  → Tailwind ユーティリティ (最優先)
```

| 評価項目 | 評定 |
|---------|------|
| 実装コスト | 最低 — CSS import 順序のみ |
| 保守性 | 最高 — CSS 標準仕様ベース |
| ブラウザ対応 | Chrome 99+, Firefox 97+, Safari 16.4+ |
| Tailwind v4 対応 | ネイティブサポート |
| Hareru 側変更 | 不要 |

### Option B: Tailwind Prefix

```js
// tailwind.config.js
module.exports = { prefix: 'tw-' }
```

```html
<button class="hui-button tw-mb-4 tw-flex">
```

- クラス名衝突は 100% 回避
- ただし AI ツールが prefix を認識しない
- マークアップが冗長
- **レガシープロジェクト向けのフォールバック**

### Option C: Preflight 無効化 — 非推奨

v4 での制御メカニズムが不安定。メンテナンスリスク高。

### Option D: @apply ブリッジ — 要注意

```css
.hui-button {
  @apply px-4 py-2 rounded-md;
}
```

v4 で `@apply` に breaking changes あり（GitHub #17082）。
BEM と utility-first の二重メンテナンスが発生。

### Option E: AI Context 強化 ★推奨（A と並行）

`@hareru/mcp` を通じて AI エージェントに Hareru tokens を context として提供。

```
hareru://prompts/create-ui           → Hareru-first で UI 生成
hareru://prompts/create-ui-tailwind  → Tailwind 併用パターン
```

---

## 3. shadcn/ui との並行運用

### 変数の互換性

| shadcn/ui | Hareru UI | 衝突 |
|-----------|-----------|------|
| `--primary` | `--hui-color-primary` | なし |
| `--background` | `--hui-color-background` | なし |
| `--destructive` | `--hui-color-destructive` | なし |

shadcn は prefix なし、Hareru は `--hui-` prefix。同一ページで共存可能。

### 色形式の親和性

両システムとも OKLCH を採用（shadcn v2 + Hareru UI）。
トークン変換が容易。

### 共存パターン

```
推奨: セクション・ページ単位で分離
├── /dashboard → shadcn/ui (既存)
├── /settings  → shadcn/ui (既存)
└── /new-feature → Hareru UI (新規)
```

段階的に Hareru UI へ移行、または永続的に並行運用が可能。

### オプション: 互換ブリッジ変数

将来的に必要であれば:

```css
:root {
  --primary: var(--hui-color-primary);
  --background: var(--hui-color-background);
}
```

これにより shadcn コンポーネントが Hareru トークンを参照可能。

---

## 4. AI エージェント対策

### 現状の課題

AI コード生成ツール（v0, Cursor, Claude）は Tailwind をデフォルトとして UI を生成する。

### 対策

| 対策 | 効果 | 実装先 |
|------|------|--------|
| `@hareru/mcp` | AI に Hareru tokens を提供 | 実装済み |
| `llms.txt` | MCP 非対応 AI 向けフォールバック | Phase E6 で実装予定 |
| Prompt テンプレート | `create-ui` prompt で Hareru-first 生成 | MCP 拡張 |
| `.cursorrules` | Cursor 向け Hareru ガイドライン | 新規作成 |

### 共存を前提とした設計方針

AI が Tailwind を混ぜて生成しても壊れない設計を維持する:

```tsx
// AI が生成する可能性のあるコード — 問題なく動作する
<div className="hui-card p-6 flex flex-col gap-4">
  <h2 className="hui-card__title text-lg font-bold">Title</h2>
  <p className="text-sm text-gray-500">Description</p>
  <Button variant="primary" className="mt-auto">Action</Button>
</div>
```

---

## 5. 実装ロードマップ

### Phase 1: 即時対応（ドキュメント + テスト）

- [ ] Tailwind 共存ガイドをドキュメントサイトに追加
- [ ] Playground で Tailwind v4 + Hareru UI の動作確認テスト
- [ ] 推奨 CSS import 順序の明文化
- [ ] `base.css` の `@layer` 宣言を検討

### Phase 2: MCP 強化（Q2）

- [ ] `create-ui-with-tailwind` prompt テンプレート追加
- [ ] `llms.txt` 実装（Fumadocs 統合）
- [ ] `.cursorrules` テンプレート提供

### Phase 3: オプショナル互換レイヤー（Q2-Q3）

- [ ] shadcn 互換ブリッジ変数（opt-in）
- [ ] `@hareru/preset-shadcn` パッケージ（検討）

---

## 6. リスク評価

| リスク | 深刻度 | 軽減策 |
|--------|--------|--------|
| Safari <16.4 で Cascade Layers 非対応 | 低 | 対象ブラウザは既にサポート済み (2023~) |
| AI が Tailwind を優先生成 | 中 | MCP + llms.txt で context 提供 |
| Tailwind v4 の breaking changes | 低 | `@apply` 不使用、layers は安定 API |
| shadcn/ui の変数名衝突 | なし | `--hui-` prefix で完全分離 |

---

## 結論

Hareru UI の `--hui-` プレフィックス戦略と BEM 命名規則は、Tailwind CSS との共存を自然に実現する設計になっている。

**推奨アクション**:
1. CSS Cascade Layers によるレイヤー分離（低コスト、高効果）
2. AI Context 強化で Hareru-first 生成を促進
3. ドキュメントに共存ガイドを追加し、ユーザーの混在利用を公式サポート

**Hareru UI 側の破壊的変更は不要。** ドキュメントとガイダンスの整備で対応可能。
