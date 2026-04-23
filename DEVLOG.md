# DEVLOG — kotoba-web

---

## 2026-04-23

### TailwindCSS・ESLint・Prettier設定を追加

- `vite.config.ts`: `@tailwindcss/vite` プラグイン追加、`@` → `src/` パスエイリアス設定
- `tsconfig.app.json`: `baseUrl`・`paths` 追加、`DOM.Iterable` 追加（業界標準、DOM APIイテラブル型に必要）
- `src/index.css`: Vite デフォルトスタイル削除 → TailwindCSS v4 インラインモード + Noto Sans フォント設定
- `.prettierrc.json` 新規作成
- `eslint-config-prettier` 導入: ESLint・Prettier ルール競合防止のため（業界標準）
- `package.json` に `format`・`format:check` スクリプト追加

---

### Viteプロジェクト初期化・依存関係インストール

- Vite + React + TypeScript テンプレートで初期化
- `.gitignore` に `node_modules/`, `dist/`, `.env.local`, `.claude/` を追加
- `package.json` の name を `kotoba-web` に修正
- runtime: `react-router-dom`, `axios`, `zustand`, `lucide-react`, `clsx`
- dev: `@tailwindcss/vite`, `tailwindcss`, `prettier`, `typescript-eslint`

---

### フロントエンド初期スキャフォールディング計画

#### 技術スタック確定

| カテゴリ | 採用技術 | 理由 |
|----------|----------|------|
| ビルド | Vite + React + TypeScript | SPA標準構成 |
| スタイリング | TailwindCSS v4 (インライン) | 業界標準。`tailwind.config.ts`不要、CSS内`@theme`で設定 |
| 状態管理 | Zustand | 軽量、boilerplate少、SPAの規模に適合 |
| HTTP | axios | interceptorでトークン自動更新が実装しやすい |
| ルーティング | React Router v7 | |
| アイコン | lucide-react | |
| ユーティリティ | clsx | 条件付きclassName結合用 |

#### ディレクトリ構造

```
src/
├── api/
│   ├── client.ts        # axiosインスタンス + interceptors
│   ├── auth.ts
│   ├── words.ts
│   ├── bookmarks.ts
│   ├── wordDays.ts
│   ├── studySession.ts
│   ├── profile.ts
│   └── dailyStory.ts
├── stores/
│   └── authStore.ts     # Zustand: accessToken + isInitialized
├── types/
│   └── index.ts         # 全API応答型定義 (snake_case、バックエンドと1:1対応)
├── hooks/
│   └── useAuth.ts
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── BottomTabNav.tsx   # モバイル下部タブ
│   │   └── SidebarNav.tsx     # デスクトップサイドバー
│   ├── ProtectedRoute.tsx
│   └── ui/
│       ├── Button.tsx
│       └── LoadingSpinner.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── StudyPage.tsx
│   ├── BookmarkPage.tsx
│   └── ProfilePage.tsx
├── App.tsx
├── main.tsx
└── index.css            # @import "tailwindcss" のみ
```

#### ルーティング設計

```
/login              → LoginPage  (非認証専用)
/signup             → SignupPage (非認証専用)
/dashboard          → DashboardPage (認証必須)
/study              → StudyPage - レベル選択
/study/:level       → StudyPage - DAYリスト
/study/:level/:dayId → StudyPage - 単語リスト
/bookmarks          → BookmarkPage
/profile            → ProfilePage
/                   → /dashboard or /login へリダイレクト
```

#### 認証トークン戦略

- **Access token**: Zustandストア (メモリ)。リロード時消滅 → refreshで復元
- **Refresh token**: localStorage。7日有効
- **isInitialized**: アプリ初回ロード時、localStorage のrefreshToken検証完了まで`false`。`false`の間はLoadingSpinnerのみ表示し「認証の空白」を防ぐ

#### axios Race Condition対応

同時に複数の401が発生した場合のrefresh重複リクエスト防止:
- モジュールレベルの `isRefreshing: boolean` フラグ
- `failedQueue: {resolve, reject}[]` パターン
- 最初の401のみrefreshを実行し、後続はqueue待機 → refresh完了後に一括再試行

#### コミット単位 (ブランチ: `feat/initial-scaffold`)

1. `chore: Viteプロジェクトを初期化し依存関係をインストール`
2. `chore: TailwindCSS・ESLint・Prettier設定を追加`
3. `feat: TypeScript型定義を追加`
4. `feat: Zustand認証Storeを実装`
5. `feat: axiosクライアントとトークン自動更新を実装`
6. `feat: ドメイン別API関数を実装`
7. `feat: ログイン・会員登録ページを実装`
8. `feat: ProtectedRouteとAppShellレイアウトを実装`
9. `feat: 4つのメインページの基本構造を実装`
