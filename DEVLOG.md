# DEVLOG — kotoba-web

---

## 2026-04-29

### 単語学習フロー実装 — レベル選択 → DAYリスト → 単語リスト + ブックマーク

- `useWordDays(level)` / `useWords(level, dayNumber)` / `useBookmarkToggle(initialWords)` の3フックを新規追加
- `StudyPage` を3段階ビュー（レベル選択 / DAYリスト / 単語リスト）に分岐。`useParams` でルート判定
- `useWords` 内で `Promise.allSettled` を採用。`getWordDays`（セッション更新用）の失敗が単語表示をブロックしないよう分離
- `useBookmarkToggle` は `overrides` マップパターンで楽観的更新を実装。`useEffect` 不使用でstaleなし
- `getWordDays` / `getWords` に `signal?: AbortSignal` パラメータを追加し、アンマウント時にHTTPリクエスト自体をキャンセル可能に
- ローディング表示を `if (loading) return <LoadingSpinner />` のearly returnパターンに統一（DashboardPage準拠）

---

## 2026-04-26

### コードレビュー対応 — AbortSignal修正・streak_days導入・UIリファクタ

- `getDailyStory` / `getStudySession` にAbortSignalパラメータを追加。abort()が実際のHTTPリクエストをキャンセルするように修正
- `useStreak`のerrorをDashboardPageで消費。API失敗時のsilent failureを解消
- `StudySession`に`streak_days: number`を追加。バックエンドに同フィールドの実装が必要
- 連続学習日の表示ロジックを変更: 連続中（today/yesterday）はAPI値をそのまま表示、未学習・途切れはデフォルト1日表示。✓/×記号を廃止し数値表示に統一
- `streakLabel`のdead codeを削除し`isActive`フラグに集約

---

### DashboardPage 実装 — API連携・AI ストーリーカード・連続学習日

- `useDailyStory` / `useStreak` フックを新規作成。loading / error / data の3点返却パターンに統一
- `WordDetailModal` を新規作成。ESC キー・backdrop クリックで閉じる。`role="dialog"` / `aria-modal` でアクセシビリティ対応
- `DashboardPage` を placeholder から実際のAPI連携に差し替え

**設計判断・トレードオフ**

- ストリーク判定はAPIが正確な日数を返さないため、`StudySession.updated_at` を基準にローカルカレンダー差分で今日/昨日/途切れの3段階のみ表示。N日カウントは意図的に断念
- 「이어서 학습」ボタンのURL: `word_day_id`（DB FK）ではなく `day_number` を使用。Phase 2 StudyPage が `GET /api/v1/words?day_number=` を呼ぶため、URLパラメータは `day_number` に統一する必要があった
- `onClose` を `useCallback` でメモ化し、WordDetailModal内のESCハンドラーが毎レンダーで再登録されるのを防止
- AbortController によるクリーンアップを両フックに追加。アンマウント後の setState 呼び出しを抑制
- モーダルオープン時に `document.body.style.overflow = 'hidden'` でスクロールロック、クローズボタンへ自動フォーカス移動（WCAG 2.1 AA 最低限準拠）

---

### 二次レビューによる修正

- `ProtectedRoute`: `apiClient.post` → raw `axios.post` に変更。`apiClient` 経由だとresponse interceptorが401に反応して二重refreshが発生するため
- `BottomTabNav`: `aria-label="モバイルナビゲーション"` 追加
- `SidebarNav`: `aria-label="サイドバーナビゲーション"` 追加。同一ページに `<nav>` が複数ある場合、スクリーンリーダーの識別のためlabelが必要 (WCAG)

---

### App.tsxルーティングを実装

- `src/App.tsx`, `src/main.tsx` を書き換え
- `ProtectedRoute` → `AppShell` の2段ネストで認証ガードとレイアウトを分離
- `path="*"` → `/dashboard` へリダイレクト: 未認証なら ProtectedRoute が `/login` へ続けて転送
- `StrictMode` 維持: 本番はno-op、開発時の副作用検出のため標準設定

---

### 4つのメインページの基本構造を実装

- `DashboardPage`, `StudyPage`, `BookmarkPage`, `ProfilePage` の基本構造を実装 (機能は次フェーズ)
- `ProfilePage.handleLogout`: API失敗時も `finally` で必ずローカル状態をクリアする設計
- `<button>` に `type="button"` を明示: form 外でもデフォルト type は `submit` のため明示が標準

---

### ProtectedRouteとAppShellレイアウトを実装

- `src/components/ProtectedRoute.tsx`: マウント時にrefreshTokenで自動復元。`isInitialized`がfalseの間はLoadingSpinnerを表示し認証の空白を防ぐ
- `src/components/ui/LoadingSpinner.tsx`: `role="status"` + `aria-label` 追加 (WCAG準拠)
- `src/components/layout/AppShell.tsx`, `BottomTabNav.tsx`, `SidebarNav.tsx`: モバイル下部タブ / デスクトップサイドバーを `md:hidden` / `hidden md:flex` で切り替え
- `useEffect` 依存配列を `[isInitialized, setTokens, clearAuth, setInitialized]` に修正: ESLint `react-hooks/exhaustive-deps` 警告を解消。Zustand actionsは参照が安定しているため再実行されない

---

### ログイン・会員登録ページを実装

- `src/pages/auth/LoginPage.tsx`, `SignupPage.tsx` 新規作成
- `res.data.success` チェック後に discriminated union narrowing でトークン取得
- ログイン失敗時は固定メッセージ表示 (実際のAPIエラーを露出させない — セキュリティ標準)
- `label` に `htmlFor` + `input` に `id` を追加: クリックでフォーカス移動 + スクリーンリーダー対応 (WCAG 2.1)

---

### ドメイン別API関数を実装

- `src/api/{auth,words,bookmarks,wordDays,studySession,profile,dailyStory}.ts` 新規作成
- 全関数の戻り値に `ApiResponse<T>` ジェネリックを明示してレスポンス型を統一
- `signup` の `target_level` を `string` から `JlptLevel` に変更: 呼び出し元の型ガードを強化するため

---

### axiosクライアントとトークン自動更新を実装

- `src/api/client.ts` 新規作成
- request interceptor で全リクエストに `Authorization: Bearer <token>` を付与
- response interceptor で 401 時にrefreshを実行してリクエストをリトライ
- Race condition対応: `isRefreshing` フラグ + `failedQueue` パターンで同時多発401でもrefreshは1回だけ実行
- refresh 成功後に `failedQueue` の待機リクエストを一括再試行
- `Authorization` ヘッダーを refresh リクエストから除去: access token が null の場合に `Bearer null` になるため

---

## 2026-04-24

### Zustand認証Storeを実装

- `src/stores/authStore.ts` 新規作成
- `persist` ミドルウェア採用: localStorage の同期を Zustand に委譲（業界標準）
- `partialize` で `refreshToken` のみ永続化。`accessToken` はメモリ専用（セキュリティ上 localStorage に保存しない）
- インターフェースを `MemoryState` / `PersistedState` / `AuthActions` に分離して persist 対象を明示
- `STORAGE_KEY = 'kotoba-auth'`: アプリ固有 key でブラウザ内の他アプリとの衝突を防止
- `baseUrl` 廃止: TypeScript 6.0 で deprecated のため `paths` のみに移行（`./src/*`）
- `.prettierignore` 追加: `pnpm-lock.yaml`・`dist/` を Prettier 対象外に設定

---

## 2026-04-23

### TypeScript型定義を追加

- `src/types/index.ts` 新規作成
- `ApiResponse<T>`: Discriminated Union で success/failure を型安全に分岐
- `error: string | string[]`: Rails バリデーションエラーが配列で返るケースに対応
- `AiContent` を独立 interface に抽出（インライン匿名型は再利用不可のため）
- `DailyStoryWord`: `Word` の extends を廃止。API レスポンスに `bookmarked` が含まれないため独立定義。`example_sentence` は `string | null`（ai_content 未生成時は null）

---

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

| カテゴリ       | 採用技術                    | 理由                                                    |
| -------------- | --------------------------- | ------------------------------------------------------- |
| ビルド         | Vite + React + TypeScript   | SPA標準構成                                             |
| スタイリング   | TailwindCSS v4 (インライン) | 業界標準。`tailwind.config.ts`不要、CSS内`@theme`で設定 |
| 状態管理       | Zustand                     | 軽量、boilerplate少、SPAの規模に適合                    |
| HTTP           | axios                       | interceptorでトークン自動更新が実装しやすい             |
| ルーティング   | React Router v7             |                                                         |
| アイコン       | lucide-react                |                                                         |
| ユーティリティ | clsx                        | 条件付きclassName結合用                                 |

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
