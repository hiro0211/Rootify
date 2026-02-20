
## 7. 実装構成案（続き）

### 7.0 アーキテクチャ設計原則

本プロジェクトは以下の原則を遵守し、保守性・可読性・変更容易性を最大化する。

#### 7.0.1 SRP（単一責任原則）

| レイヤー | 責務 | 禁止事項 |
|---------|------|---------|
| Screen（画面） | レイアウト配置・ナビゲーション遷移のみ | ビジネスロジック・データ加工を書かない |
| Component（UIコンポーネント） | 見た目の描画・ユーザー操作の受付のみ | AsyncStorage / API呼び出しを直接行わない |
| Hook（カスタムフック） | 状態管理・副作用処理・ビジネスロジック | UI描画を行わない |
| Service（サービス層） | データの永続化・外部APIとの通信 | UIやHookの状態に依存しない |
| Repository（リポジトリ層） | ストレージアクセスの抽象化 | ビジネスロジックを含まない |

#### 7.0.2 レイヤー依存ルール

```
Screen → Component → Hook → Service → Repository → AsyncStorage / JSON
  ↓                    ↓
  └── Navigation ──────┘

依存方向: 上位 → 下位 のみ（逆方向の依存は禁止）
```

**鉄則：**
- Screen は Hook を呼ぶ。Component を配置する。それ以外はしない。
- Component は props で受け取った値を表示し、コールバックを呼ぶ。それ以外はしない。
- Hook は Service を呼んで状態を管理する。UIの描画には関与しない。
- Service は Repository を呼んでデータの永続化・取得を行う。
- Repository は AsyncStorage / JSON の読み書きのみを行う。

#### 7.0.3 変更容易性のための設計指針

| 指針 | 具体的ルール |
|------|------------|
| インターフェース分離 | Repository は interface（型定義）を先に定義し、実装を後から差し替え可能にする。将来 Supabase に移行する際、Repository 実装のみ変更すればよい設計とする |
| 定数の一元管理 | マジックナンバー禁止。全定数を `constants/` 配下に配置 |
| Feature ベース構成 | 機能単位でディレクトリを分割し、機能追加・削除がディレクトリ単位で完結する |
| 型安全 | TypeScript strict モード。`any` 型禁止。全 props に型定義必須 |
| テスタビリティ | Hook / Service / Repository は純粋関数またはDI可能な構成にする |

---

### 7.1 ディレクトリ構成（Feature ベース / Frontend・lib 分離）

```
src/
├── app/                          # Expo Router（画面ルーティング）
│   ├── (tabs)/                   # タブナビゲーション
│   │   ├── _layout.tsx           # タブバーレイアウト定義
│   │   ├── index.tsx             # D-001 ダッシュボード
│   │   ├── etymology.tsx         # L-001 語源ツリー一覧
│   │   ├── quiz.tsx              # Q-001 クイズモード選択
│   │   └── progress.tsx          # H-001 学習データ
│   ├── onboarding/
│   │   ├── index.tsx             # S-002 オンボーディング
│   │   └── goal-setting.tsx      # S-003 目標設定
│   ├── etymology/
│   │   ├── [id].tsx              # L-002 語源ツリー詳細
│   │   └── word/[id].tsx         # L-003 単語詳細カード
│   ├── quiz/
│   │   ├── play.tsx              # Q-002 クイズ出題画面
│   │   ├── result.tsx            # Q-003 クイズ結果画面
│   │   └── review.tsx            # Q-004 語源分解表示
│   ├── mix/
│   │   ├── select.tsx            # M-001 ミックスモード選択
│   │   ├── play.tsx              # M-002 ミックスモード出題
│   │   └── result.tsx            # M-003 ミックスモード結果
│   ├── settings/
│   │   ├── index.tsx             # T-001 設定画面
│   │   ├── profile.tsx           # T-002 目標・プロフィール
│   │   ├── notifications.tsx     # T-003 通知設定
│   │   └── upgrade.tsx           # T-004 Proアップグレード
│   └── _layout.tsx               # ルートレイアウト
│
├── features/                     # 機能単位モジュール（ビジネスロジック中心）
│   ├── auth/
│   │   ├── hooks/
│   │   │   └── useUser.ts
│   │   ├── services/
│   │   │   └── userService.ts
│   │   └── types.ts
│   ├── etymology/
│   │   ├── hooks/
│   │   │   ├── useEtymologyList.ts
│   │   │   ├── useEtymologyDetail.ts
│   │   │   └── useEtymologyProgress.ts
│   │   ├── services/
│   │   │   └── etymologyService.ts
│   │   ├── components/
│   │   │   ├── EtymologyTable.tsx        # 語源テーブル（図鑑風）
│   │   │   ├── EtymologyArrowFlow.tsx    # 矢印フローアニメーション
│   │   │   ├── WordCard.tsx              # 単語カード（図鑑風）
│   │   │   ├── WordDecomposition.tsx     # 語源分解表示
│   │   │   └── EtymologyTreeCard.tsx     # 一覧用カード
│   │   └── types.ts
│   ├── quiz/
│   │   ├── hooks/
│   │   │   ├── useQuizSession.ts         # クイズセッション管理
│   │   │   ├── useQuizTimer.ts           # タイマー制御
│   │   │   ├── useQuizChoiceGenerator.ts # 4択生成ロジック
│   │   │   └── useQuizResult.ts          # 結果集計
│   │   ├── services/
│   │   │   ├── quizService.ts            # クイズデータ操作
│   │   │   └── quizChoiceEngine.ts       # 選択肢生成エンジン
│   │   ├── components/
│   │   │   ├── QuizProgressBar.tsx       # 進捗バー（正解=緑/不正解=赤）
│   │   │   ├── QuizWordDisplay.tsx       # 出題単語表示
│   │   │   ├── QuizChoiceButton.tsx      # 4択ボタン
│   │   │   ├── QuizTimer.tsx             # タイマー表示
│   │   │   ├── QuizFeedback.tsx          # 正解/不正解フィードバック
│   │   │   ├── QuizHint.tsx              # 語源ヒント（Pro）
│   │   │   └── QuizResultSummary.tsx     # 結果サマリー
│   │   └── types.ts
│   ├── review/
│   │   ├── hooks/
│   │   │   └── useSpacedRepetition.ts    # 間隔反復アルゴリズム
│   │   ├── services/
│   │   │   └── reviewService.ts
│   │   └── types.ts
│   ├── mix/
│   │   ├── hooks/
│   │   │   ├── useMixSession.ts
│   │   │   └── useMixAnalysis.ts         # 苦手語源分析
│   │   ├── services/
│   │   │   └── mixService.ts
│   │   └── types.ts
│   ├── progress/
│   │   ├── hooks/
│   │   │   ├── useStreak.ts              # ストリーク管理
│   │   │   ├── useLearningStats.ts       # 学習統計
│   │   │   └── useMasteryDistribution.ts # 習熟度分布
│   │   ├── services/
│   │   │   └── progressService.ts
│   │   ├── components/
│   │   │   ├── StreakDisplay.tsx
│   │   │   ├── WeeklyCalendar.tsx
│   │   │   ├── MasteryChart.tsx
│   │   │   └── StatsCards.tsx
│   │   └── types.ts
│   ├── subscription/
│   │   ├── hooks/
│   │   │   └── useSubscription.ts
│   │   ├── services/
│   │   │   └── subscriptionService.ts
│   │   └── types.ts
│   └── notification/
│       ├── hooks/
│       │   └── useNotification.ts
│       ├── services/
│       │   └── notificationService.ts
│       └── types.ts
│
├── shared/                       # 機能横断の共通モジュール
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── AdBanner.tsx
│   │   ├── ProGate.tsx           # Pro機能ゲートコンポーネント
│   │   └── TabBar.tsx
│   ├── hooks/
│   │   ├── useHaptics.ts         # 触覚フィードバック
│   │   └── useAudio.ts           # 音声再生
│   ├── constants/
│   │   ├── colors.ts             # カラーパレット
│   │   ├── spacing.ts            # スペーシング定数
│   │   ├── typography.ts         # フォントサイズ・ウェイト
│   │   ├── quiz.ts               # クイズ関連定数
│   │   ├── mastery.ts            # 習熟度レベル定数
│   │   └── admob.ts              # AdMob広告ID
│   ├── utils/
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   └── types/
│       └── common.ts
│
├── lib/                          # インフラ層（外部依存の抽象化）
│   ├── storage/
│   │   ├── types.ts              # IStorageRepository interface
│   │   ├── asyncStorageRepository.ts  # AsyncStorage実装
│   │   └── index.ts              # エクスポート
│   ├── audio/
│   │   └── speechService.ts      # expo-speech ラッパー
│   ├── haptics/
│   │   └── hapticsService.ts     # expo-haptics ラッパー
│   ├── notifications/
│   │   └── notificationClient.ts # expo-notifications ラッパー
│   ├── admob/
│   │   └── admobClient.ts        # react-native-google-mobile-ads ラッパー
│   └── purchase/
│       └── purchaseClient.ts     # RevenueCat ラッパー
│
└── data/                         # 静的マスターデータ
    ├── etymologies.json          # 語源マスター（80〜100語源）
    ├── words.json                # 単語マスター（500〜800単語）
    └── schema.ts                 # マスターデータの型定義・バリデーション
```

---

### 7.2 レイヤー間のデータフローパターン

#### クイズ出題の例（Q-002）

```
[Screen: quiz/play.tsx]
  │ useQuizSession() を呼び出し
  │
  ▼
[Hook: useQuizSession.ts]
  │ 1. quizService.generateQuestions(etymologyId, 10) を呼び出し
  │ 2. 状態管理: currentIndex, answers, isFinished
  │ 3. タイマー制御: useQuizTimer() を内部で利用
  │
  ▼
[Service: quizService.ts]
  │ 1. etymologyRepository.getWordsByEtymology(etymologyId)
  │ 2. quizChoiceEngine.generateChoices(correctWord, allWords)
  │ 3. 問題配列を組み立てて返却
  │
  ▼
[Service: quizChoiceEngine.ts]
  │ 正解+不正解3つの選択肢を生成
  │ 同一語源の単語を優先的に誤答に使用（学習効果を高める）
  │
  ▼
[Repository: asyncStorageRepository.ts]
  │ AsyncStorage から WordMastery データを読み書き
```

#### 語源学習の例（L-002）

```
[Screen: etymology/[id].tsx]
  │ useEtymologyDetail(id) を呼び出し
  │
  ▼
[Hook: useEtymologyDetail.ts]
  │ 1. etymologyService.getEtymologyWithWords(id)
  │ 2. etymologyService.markAsStudied(id)
  │ 3. 表示用データを整形して返却
  │
  ▼
[Service: etymologyService.ts]
  │ 1. JSON マスターから語源データ取得
  │ 2. 関連単語を取得
  │ 3. EtymologyProgress を更新
  │
  ▼
[Repository: asyncStorageRepository.ts]
  │ EtymologyProgress の永続化
```

---

### 7.3 Screen 層の実装ルール

| ルール | 説明 |
|--------|------|
| ロジック禁止 | Screen 内に `if` 分岐によるビジネスロジックを書かない。Hook に委譲する |
| 状態管理禁止 | `useState` は UI のトグル（モーダル開閉等）にのみ使用可。データ状態は Hook 経由 |
| 関心事 | レイアウト配置、ナビゲーション遷移、Hook の呼び出し、Component への props 受け渡し |
| ファイルサイズ目安 | 100行以内。超える場合は Component への分割を検討 |

**Screen のテンプレート構造：**

```
1. Hook 呼び出し（データ取得・状態管理）
2. ローディング / エラー分岐
3. レイアウト（ScrollView / FlatList + Component 配置）
4. ナビゲーション遷移のコールバック定義
```

---

### 7.4 Component 層の実装ルール

| ルール | 説明 |
|--------|------|
| Pure Component | props のみに依存。内部状態は UI トグルのみ（アコーディオン開閉等） |
| コールバック | ユーザー操作は `onPress`, `onSelect` 等のコールバック props で親に通知 |
| スタイル | StyleSheet.create() を使用。インラインスタイル禁止 |
| 再利用性 | 特定の Screen に依存しない。features/ 配下の Component は feature 内で閉じてよい |

---

### 7.5 Hook 層の実装ルール

| ルール | 説明 |
|--------|------|
| 命名規約 | `use` + 動詞/名詞（例: `useQuizSession`, `useStreak`） |
| 返却値 | `{ data, isLoading, error, actions }` パターンを推奨 |
| 副作用 | `useEffect` 内で Service を呼び出す。直接 AsyncStorage にアクセスしない |
| テスタビリティ | Service をパラメータとして受け取れるようにし、テスト時にモックを注入可能にする |

---

### 7.6 Service / Repository 層の実装ルール

| ルール | 説明 |
|--------|------|
| Service | ビジネスロジックを担当。Repository を呼び出してデータを取得・加工する |
| Repository | ストレージへの読み書きのみ。ビジネスロジック禁止 |
| Interface | Repository は interface（型定義）を先に定義。実装を差し替え可能にする |
| 非同期 | 全メソッドは `async` / `Promise` を返す。同期的な JSON 読み込みも将来の API 化に備え async にする |

**Repository Interface の例（将来の Supabase 移行を見据えた設計）：**

```
// lib/storage/types.ts（概念）
interface IWordMasteryRepository {
  getByWordId(userId: string, wordId: string): Promise<WordMastery | null>
  getByUserId(userId: string): Promise<WordMastery[]>
  getDueForReview(userId: string, now: Date): Promise<WordMastery[]>
  save(mastery: WordMastery): Promise<void>
}

// MVP: asyncStorageRepository.ts が実装
// 将来: supabaseRepository.ts に差し替え
```

---

### 7.7 主要ライブラリ

| カテゴリ | ライブラリ | 用途 | 選定理由 |
|---------|-----------|------|---------|
| フレームワーク | `expo` (~52) | 開発基盤 | React Native の標準的なツールチェーン |
| ルーティング | `expo-router` | 画面遷移 | ファイルベースルーティング。Next.js に近い開発体験 |
| 状態管理 | `zustand` | グローバル状態 | 軽量・型安全・ボイラープレートが少ない |
| ストレージ | `@react-native-async-storage/async-storage` | ローカル永続化 | MVP のデバイスローカル保存に最適 |
| アニメーション | `react-native-reanimated` | UIアニメーション | 語源矢印フロー・クイズフィードバックに必須 |
| 音声 | `expo-speech` | 発音再生 | ネイティブTTS。追加APIキー不要 |
| 触覚 | `expo-haptics` | バイブレーション | クイズ正解/不正解のフィードバック |
| 通知 | `expo-notifications` | ローカル通知 | 学習リマインド・ストリーク通知 |
| 広告 | `react-native-google-mobile-ads` | AdMob | バナー・インタースティシャル広告 |
| 課金 | `react-native-purchases`（RevenueCat） | In-App Purchase | サブスクリプション・買い切り管理 |
| グラフ | `react-native-svg` + `victory-native` | 進捗グラフ | 週間推移グラフ（H-001 Pro機能） |
| テスト | `jest` + `@testing-library/react-native` | 単体・UIテスト | Hook / Service の単体テストに使用 |

---

### 7.8 状態管理設計（Zustand）

#### ストア分割方針

| ストア | 管理する状態 | 永続化 |
|--------|------------|--------|
| `useUserStore` | ニックネーム・TOEICスコア・目標・Pro状態 | AsyncStorage |
| `useStreakStore` | 連続学習日数・最終学習日 | AsyncStorage |
| `useQuizStore` | 現在のクイズセッション状態（一時的） | なし（メモリのみ） |
| `useMasteryStore` | 単語習熟度データのキャッシュ | AsyncStorage（Repository経由） |
| `useSettingsStore` | 通知設定・タイマー設定・アプリ設定 | AsyncStorage |

#### Zustand 設計ルール

| ルール | 説明 |
|--------|------|
| ストアの粒度 | 機能ドメインごとに分割。1ストアは1つの関心事に集中 |
| セレクタ使用 | コンポーネントは必要なフィールドのみセレクタで取得し、不要な再レンダリングを防ぐ |
| 永続化 | `zustand/middleware` の `persist` を使用し、AsyncStorage と同期 |
| 非同期アクション | ストア内の action で Service を呼び出す場合は `async` にする |
| 初期化 | アプリ起動時に `_layout.tsx` で永続化データをロードする |

---

### 7.9 汎用型定義

```
// shared/types/common.ts（概念的な型定義）

// 全エンティティの基底型
type BaseEntity = {
  id: string
  created_at: string
}

// API / Repository の返却パターン
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

// Hook の返却パターン
type HookState<T> = {
  data: T | null
  isLoading: boolean
  error: string | null
}

// クイズの問題型
type QuizQuestion = {
  word: Word
  choices: QuizChoice[]
  correctIndex: number
  etymology: Etymology
}

type QuizChoice = {
  text: string      // 日本語意味
  wordId: string
  isCorrect: boolean
}

// クイズセッション結果型
type QuizSessionResult = {
  totalQuestions: number
  correctCount: number
  timeSpentSec: number
  answers: QuizAnswerRecord[]
  weakEtymologies: string[]  // 苦手語源IDリスト
}
```

---

### 7.10 ファイル命名規約

| 種別 | 命名規約 | 例 |
|------|---------|-----|
| Screen | kebab-case | `goal-setting.tsx` |
| Component | PascalCase | `QuizChoiceButton.tsx` |
| Hook | camelCase（use-prefix） | `useQuizSession.ts` |
| Service | camelCase（-Service suffix） | `quizService.ts` |
| Repository | camelCase（-Repository suffix） | `asyncStorageRepository.ts` |
| 型定義 | `types.ts`（各 feature 内） | `features/quiz/types.ts` |
| 定数 | camelCase | `colors.ts`, `mastery.ts` |
| テスト | 対象ファイル名 + `.test.ts` | `quizService.test.ts` |

---

## 8. 語源学習モード詳細仕様

### 8.1 語源ツリー一覧（L-001）

#### 表示仕様

| 要素 | 仕様 |
|------|------|
| レイアウト | 2カラムグリッド（カード形式） |
| カード内容 | 語根 + 日本語意味 + 関連単語数 + 学習状態バッジ |
| ソート | デフォルト: チャプター順。切り替え: 学習状態順 |
| フィルター | 「すべて」「未学習」「学習中」「完了」 |
| ロック表示 | Free ユーザーは31個目以降にロックアイコン表示 |
| 広告 | リスト下部にAdMobバナー（320×50） |

#### カードの学習状態バッジ

| 状態 | 表示 | 条件 |
|------|------|------|
| 未学習 | グレーバッジ「NEW」 | 語源詳細を一度も開いていない |
| 学習中 | 青バッジ「学習中」 | 語源詳細を開いたが、関連単語の正答率80%未満 |
| 完了 | 緑バッジ「完了」 | 関連単語の正答率80%以上 |

---

### 8.2 語源ツリー詳細（L-002）— 語源図鑑風UI

#### 画面構成（上から順に）

**セクション1: 語源テーブル（図鑑風）**

添付画像1（-tractテーブル）を忠実に再現するUI。

| 行 | 内容 | スタイル |
|----|------|---------|
| 行1: 接頭辞 | `at-(〜の方へ)`, `con-(共に)`, `ex-(外に)`, `dis-(離れて)` | テキスト色: `#E74C8B`（ピンク）、フォントサイズ: 14pt |
| 行2: 語根 | `-tract(引く)` が全列に繰り返し表示 | テキスト色: `#1C1C1C`（黒）、フォントサイズ: 14pt、太字 |
| 行3: 接尾辞 | `-ion` など（該当する列のみ表示） | テキスト色: `#888888`（グレー）、フォントサイズ: 12pt |
| 矢印 | 接頭辞→語根→接尾辞→単語の流れを示すピンク矢印 | 色: `#E74C8B`。`react-native-reanimated` でフェードイン |
| 行4: 単語 | `attraction`, `contract`, `extract`, `distraction` | フォントサイズ: 16pt、太字 |
| 行5: 合成意味 | `(引き付けるもの)`, `(引き合う)`, `(外に引く)`, `(引き離すもの)` | テキスト色: `#E74C8B`、フォントサイズ: 12pt |
| 行6: 日本語訳 | `魅力`, `契約する`, `引き出す`, `気晴らし` | フォントサイズ: 14pt、太字 |

**テーブルのアニメーション仕様：**

| タイミング | アニメーション | duration |
|-----------|-------------|----------|
| 画面表示時 | 接頭辞行がフェードイン | 0ms → 300ms |
| 300ms後 | 語根行がフェードイン | 300ms → 600ms |
| 600ms後 | 矢印が上から下にスライドイン | 600ms → 900ms |
| 900ms後 | 単語行 + 合成意味がフェードイン | 900ms → 1200ms |
| 1200ms後 | 日本語訳がフェードイン | 1200ms → 1500ms |

**水平スクロール：** 語源に紐づく単語が5個以上の場合、テーブルは水平スクロール可能とする。画面内には最大4列を表示し、スクロールインジケータを表示。

---

**セクション2: 関連単語カードリスト**

添付画像2（press系: impress, express, suppress）を参考にした単語カードUI。

各カードの構成要素:

| 要素 | 表示例 | スタイル |
|------|--------|---------|
| 英単語（大きく） | `impress` | フォントサイズ: 24pt、太字、色: 黒 |
| 発音記号 | `[imprés]` | フォントサイズ: 12pt、色: グレー |
| 語源分解 | `im(上を) + press(押す)` | 接頭辞部分: ピンク、語根部分: 黒 |
| 合成イメージ（矢印付き） | `→ 心に押しつける` | 色: `#E74C8B`（ピンク）、矢印アイコン付き |
| 品詞・日本語意味 | `動 印象を与える、感動させる` | 品詞バッジ＋日本語意味 |
| 派生語 | `impression 名 印象` / `impressive 形 印象的な` | フォントサイズ: 12pt、グレー |
| 例文 | `I was impressed by his paintings.` | イタリック体 |
| 例文和訳 | `彼の絵画に感動した` | フォントサイズ: 12pt |

**カードのインタラクション：**
- タップ → L-003 単語詳細カードに遷移
- 発音アイコンタップ → `expo-speech` でネイティブ発音再生
- 習熟度バッジ表示（覚えた / ほぼ覚えた / うろ覚え / 苦手 / 未学習）

---

**セクション3: CTAボタン**

| 要素 | 仕様 |
|------|------|
| ボタンテキスト | 「この語源でクイズに挑戦」 |
| 遷移先 | Q-002（etymology_filter にこの語源IDを渡す） |
| スタイル | プライマリカラー、角丸、影付き、横幅100% |
| 位置 | 画面下部固定（Sticky CTA） |

---

### 8.3 単語詳細カード（L-003）

語源図鑑の1単語分の詳細ページ。L-002 の単語カードをタップした際に遷移する。

| セクション | 内容 |
|-----------|------|
| ヘッダー | 英単語 + 発音記号 + 発音再生ボタン |
| 語源分解（ビジュアル） | 接頭辞 + 語根 + 接尾辞の分解図。矢印アニメーション付き。Q-004と同じコンポーネントを再利用 |
| 意味 | 品詞 + 日本語訳（メイン意味 + サブ意味） |
| 派生語リスト | 関連する派生語（名詞形、形容詞形等） |
| 例文 | 英語例文 + 日本語訳。単語部分をハイライト |
| 同じ語根の仲間 | 同一語根を持つ他の単語をチップ表示。タップで遷移 |
| 習熟度 | 現在の習熟度レベル + クイズ正答履歴 |

---

## 9. クイズモード詳細仕様

### 9.1 クイズモード一覧（Q-001）

| モード名 | 画面ID | 問題数 | 出題範囲 | Free/Pro |
|---------|--------|--------|---------|----------|
| 語源別クイズ | Q-002 | 10問 | 特定の語源（接頭辞単位）に紐づく単語のみ | Free |
| 復習クイズ | R-001 | 10問 | 間隔反復アルゴリズムで選出された単語 | Free(1日1回)/Pro |
| ミックスクイズ | M-002 | 10問 | 全語源からランダム選出 | Pro |
| まとめテスト | M-002 | 20問 | 学習済み全語源からごちゃ混ぜ出題 | Pro |

#### 語源別クイズの出題単位（接頭辞ベース）

語源別クイズでは、接頭辞を軸に出題範囲を絞り込む。以下は出題単位の例：

| 接頭辞 | 意味 | 出題例（10問） |
|--------|------|--------------|
| `at-` | 〜の方へ | attract, attach, attend, attempt, attain, attribute, attack, attention, attitude, attorney |
| `ex-` | 外に | extract, express, export, expose, exclude, expand, expect, explain, explore, extend |
| `con-/com-` | 共に | contract, compress, compose, combine, connect, contain, confirm, compare, compete, conclude |
| `dis-` | 離れて | distraction, discover, display, discuss, dismiss, distance, disagree, disappoint, disturb, distribute |
| `pre-` | 前に | predict, prepare, prevent, present, preserve, prefer, prefix, previous, pressure, pretend |
| `re-` | 再び・戻す | return, review, repeat, replace, report, reduce, reflect, recover, remind, remove |
| `in-/im-` | 中に・上に | impress, import, include, increase, influence, inform, inspire, install, introduce, invest |
| `sub-/sup-` | 下に | suppress, support, submit, succeed, suffer, suggest, supply, suppose, surprise, survive |
| `pro-` | 前へ | produce, progress, project, promote, propose, protect, provide, process, program, promise |
| `trans-` | 越えて | transfer, transform, translate, transport, transmit, transplant, transition, transparent, transaction, transcend |

**出題ルール：**
- 最低5単語が学習済み（L-002で閲覧済み）の語源のみクイズ対象とする
- 学習済み単語が10問に満たない場合は、学習済み単語数に合わせて出題数を調整（最低5問）
- 未学習の語源はクイズモード選択画面でグレーアウト＋「まず語源を学習しましょう」のガイドを表示

---

### 9.2 クイズ出題画面（Q-002）— mikan / スタディサプリ準拠

#### 出題UI仕様

| 要素 | 仕様 | 実装コンポーネント |
|------|------|------------------|
| 問題数インジケータ | 「Q 3/10」形式、上部左寄せ | `QuizProgressBar` |
| プログレスバー | 10セグメントのバー。正解=緑`#27AE60`、不正解=赤`#E74C3C`、未回答=グレー | `QuizProgressBar` |
| タイマー | カウントダウン表示（上部右寄せ）。設定: 5秒/8秒/10秒/無制限。デフォルト8秒 | `QuizTimer` |
| 英単語 | 画面中央に大きく表示。フォントサイズ: 32pt以上、太字 | `QuizWordDisplay` |
| 発音ボタン | スピーカーアイコン。タップで `expo-speech` 再生 | `QuizWordDisplay` |
| 語源ヒント | Proのみ表示。英単語下に小さく語源分解（例: `ex-(外に) + tract(引く)`） | `QuizHint` |
| 4択ボタン | 日本語意味の選択肢4つ。縦並び。高さ56dp以上（片手操作対応） | `QuizChoiceButton` |

#### 4択選択肢の生成ロジック（quizChoiceEngine.ts）

| ルール | 説明 |
|--------|------|
| 正解 | 出題単語の `meaning_ja`（メイン意味） |
| 誤答1 | 同一語根の別単語の意味（最優先。学習効果が高い） |
| 誤答2 | 同一チャプターの別語根の単語の意味 |
| 誤答3 | ランダムな別単語の意味 |
| 重複排除 | 同じ日本語意味の選択肢が重複しないようにする |
| 並び替え | 4択をランダムシャッフルして表示 |
| 品詞一致 | 可能な限り、正解と同じ品詞の単語から誤答を選出する |

#### フィードバック仕様

**正解時：**

| 要素 | 仕様 |
|------|------|
| ボタン色変化 | 選択したボタンが緑（`#27AE60`）に変化 |
| アイコン | ✅チェックマークがフェードイン |
| 触覚 | `expo-haptics`: `ImpactFeedbackStyle.Light` |
| 効果音 | 短い正解SE（任意、設定でON/OFF） |
| 自動遷移 | 0.5秒後に自動で次の問題へフェードトランジション |
| タイマー | 正解と同時にタイマー停止 |

**不正解時：**

| 要素 | 仕様 |
|------|------|
| ボタン色変化 | 選択ボタン=赤（`#E74C3C`）、正解ボタン=緑（`#27AE60`） |
| 触覚 | `expo-haptics`: `NotificationFeedbackType.Error` |
| 語源分解ポップアップ | Q-004相当の語源分解をボトムシートで表示 |
| 遷移 | ユーザーがボトムシートの「次へ」をタップするまで待機 |
| タイマー | 不正解と同時にタイマー停止 |

**タイムアウト時：**

| 要素 | 仕様 |
|------|------|
| 扱い | 不正解と同じ扱い |
| 表示 | 「時間切れ」テキスト表示 + 正解のボタンが緑にハイライト |
| 語源分解 | 不正解時と同じくボトムシートで表示 |

---

### 9.3 クイズ結果画面（Q-003）

| セクション | 内容 | 備考 |
|-----------|------|------|
| 結果ヘッダー | 正解数 / 全問数、正答率（%）、学習時間 | 正答率80%以上で「🎉」演出 |
| 間違えた単語リスト | 英単語→正解の日本語意味。タップでQ-004へ遷移 | 最大表示数制限なし |
| アクションボタン | 「もう一度挑戦」「ホームに戻る」 | 2ボタン縦並び |
| 広告 | インタースティシャル広告（Freeユーザーのみ） | 結果確認後に表示 |
| シェア | SNSシェアボタン（任意。MVP後の検討事項） | 「10問中8問正解！」的な文言 |

#### 結果に応じた演出

| 正答率 | 演出 | メッセージ |
|--------|------|----------|
| 100% | 紙吹雪アニメーション + バイブ | 「パーフェクト！語源マスターですね」 |
| 80%〜99% | 小さな拍手アニメーション | 「素晴らしい！この調子で続けましょう」 |
| 50%〜79% | なし | 「復習で定着させましょう」 |
| 0%〜49% | なし | 「語源をもう一度確認してみましょう」 |

---

### 9.4 語源分解表示（Q-004）

クイズで間違えた単語の語源を視覚的に分解表示する画面。不正解時のボトムシート、および結果画面からの遷移先。

**`WordDecomposition` コンポーネントの仕様：**

| 要素 | 表示例 | スタイル |
|------|--------|---------|
| 英単語 | `extract` | 32pt、太字、中央配置 |
| カタカナ表記 | `エクストラクト` | 14pt、グレー、中央配置 |
| 分解図 | `ex-` + `tract` | 接頭辞=ピンク背景ラベル、語根=黒背景ラベル |
| 接頭辞意味 | `(外に)` | 12pt、ピンク |
| 語根意味 | `(引く)` | 12pt、黒 |
| 矢印 | ↓ | ピンク矢印アニメーション |
| 合成イメージ | `外に引く → 引き出す` | ピンク太字 |
| 品詞 | `動詞` | バッジ形式 |
| 例文 | `Extract the data` | 16pt、単語部分をハイライト |
| 例文和訳 | `データを引き出す` | 14pt、グレー |
| 同根単語 | `attract / contract / distraction` | チップ形式、タップ可能 |

**アニメーション：**
- 分解図の各要素が上から順にフェードインする（0ms→200ms→400ms→600ms）
- 矢印はスライドダウンアニメーション

---

### 9.5 復習クイズ（R-001）— 間隔反復アルゴリズム

#### 間隔反復のルール

| パラメータ | 値 |
|-----------|-----|
| 初回間隔 | 1日 |
| 正解後の間隔倍率 | ×2.5（1日→3日→7日→14日→30日）※端数切り上げ |
| 不正解後 | 間隔リセット（翌日再出題） |
| 最大間隔 | 30日 |
| 出題対象 | `next_review_at` ≦ 現在日時 の単語 |
| 出題数 | 10問（対象が10問未満の場合はその数） |
| 優先順位 | `next_review_at` が古い順（長く放置された単語を優先） |

#### Free / Pro の制限

| ユーザー | 制限 |
|---------|------|
| Free | 1日1回（0:00リセット）。2回目以降はT-004へ誘導 |
| Pro | 無制限。復習対象がある限り何度でも実行可能 |

---

### 9.6 ミックスモード（M-001 〜 M-003）

#### ミックスクイズ（Pro）

| 項目 | 仕様 |
|------|------|
| 出題数 | 10問 |
| 出題範囲 | 全学習済み語源からランダム選出 |
| 選択肢生成 | quizChoiceEngine と同じルール |
| UI | Q-002 と完全に同じコンポーネントを再利用 |

#### まとめテスト（Pro）

| 項目 | 仕様 |
|------|------|
| 出題数 | 20問（固定） |
| 出題範囲 | ユーザーが選択（全語源 or 特定チャプター） |
| 出題ロジック | 各語源から均等に出題（偏りを防ぐ）。苦手語源からの出題比率を高める |
| 結果画面（M-003） | 正答率に加え、「苦手語源ランキング」を表示 |
| 苦手語源ランキング | 語源ごとの正答率を算出し、正答率が低い順に表示。タップでL-002へ遷移 |

---

## 10. 継続設計（mikan参考）

### 10.1 ストリーク（連続学習）システム

#### ストリーク定義

| 項目 | 仕様 |
|------|------|
| カウント条件 | 1日1回以上クイズを完了する（語源別/復習/ミックスいずれか） |
| リセット条件 | 日付が変わるまでにクイズを1回も完了しなかった場合 |
| 日付の区切り | ローカルタイムゾーンの 0:00 |
| 最大表示 | 制限なし（999日+まで表示可能） |
| 復活機能 | MVP では未実装。将来検討（Pro 特典として1回/月の復活権など） |

#### ストリーク表示箇所

| 画面 | 表示形式 |
|------|---------|
| D-001 ダッシュボード | 🔥アイコン + 大きな数字「12日目」 + 自己ベスト表示 |
| H-001 学習データ | 現在のストリーク + 自己ベスト + 週間カレンダー |
| Q-003 クイズ結果 | ストリーク継続メッセージ（「今日もクリア！🔥 12日目」） |

#### ストリーク祝福イベント

| 達成日数 | 演出 | 通知テキスト |
|---------|------|------------|
| 3日 | 小さなバッジ表示 | 「3日連続！良いスタートです」 |
| 7日 | バッジ + 軽いアニメーション | 「1週間達成！習慣が作られています」 |
| 14日 | バッジ + 紙吹雪 | 「2週間連続。語源学習が日課になりましたね」 |
| 30日 | 特別バッジ + フルアニメーション | 「30日連続達成。語源の力が身についてきました」 |
| 60日 | ゴールドバッジ | 「60日連続。もう立派な語源マスターです」 |
| 90日 | プラチナバッジ | 「90日連続。誰もが羨む継続力です」 |
| 100日 | ダイヤモンドバッジ + 特別演出 | 「100日達成！あなたの語彙力は別次元です」 |
| 365日 | レジェンドバッジ | 「1年間連続。伝説の学習者です」 |

---

### 10.2 習熟度可視化（mikan準拠）

#### 4段階分布表示

H-001 進捗画面に表示する習熟度分布バー。mikan の「テスト結果」画面を完全に参考にする。

| レベル | 名称 | 色 | アイコン |
|--------|------|-----|---------|
| 4 | 覚えた | `#27AE60`（緑） | ✅ |
| 3 | ほぼ覚えた | `#F39C12`（オレンジ） | 🟡 |
| 2 | うろ覚え | `#E67E22`（ダークオレンジ） | 🔶 |
| 1 | 苦手 | `#E74C3C`（赤） | ❌ |
| 0 | 未学習 | `#BDC3C7`（グレー） | ⬜ |

**表示形式：**
- 横棒グラフ（スタック型）: 全体に対する各レベルの比率を色で表現
- 各レベルの語数と比率（%）をテキストでも表示
- Free ユーザーは直近7日間のデータのみ。Pro は全期間

---

### 10.3 目標設定・達成システム

#### 月間目標

| 項目 | 仕様 |
|------|------|
| 設定内容 | 「今月学習する語源の数」（5個 / 10個 / 20個 / カスタム） |
| プログレス表示 | D-001 のプログレスバーに反映 |
| 達成時 | 祝福アニメーション + バッジ付与 |
| リセット | 毎月1日に自動リセット |

#### 日次目標

| 項目 | 仕様 |
|------|------|
| 設定内容 | 「1日のクイズ回答数」（10問 / 20問 / 30問） |
| プログレス表示 | D-001 の今日のサマリーに反映 |
| 達成時 | 「今日の目標達成！」メッセージ |

---

### 10.4 学習リマインド通知

#### 通知戦略（段階的エスカレーション）

| 段階 | タイミング | 条件 | 文言例 |
|------|-----------|------|--------|
| 1次リマインド | ユーザー指定時刻（デフォルト8:00） | 毎日 | 「今日の語源クイズ、10問やりませんか」 |
| 2次リマインド | 指定時刻 + 3時間 | 1次リマインド後に未学習 | 「今日はまだ学習していません。1問だけでも」 |
| ストリーク危機通知 | 21:00 | 当日未学習 かつ ストリーク3日以上 | 「連続12日目が途切れそうです。あと3時間」 |
| 復習通知 | 12:00 | 復習待ち単語が5語以上 | 「復習待ちの単語が溜まっています」 |

**通知トーン：**
- 絶対に説教しない。命令しない。
- 「〜しませんか」「〜が完成しました」「〜が溜まっています」など提案・報告型
- 絵文字は通知テキスト内では使わない
- 否定的な表現（「できない」「苦手」）は使わない
- ストリーク危機通知は切迫感を出すが、罪悪感を与えない

---

### 10.5 ウィークリーカレンダー

H-001 に表示する週間学習カレンダー。mikan の「学習データ」画面を参考。

| 要素 | 仕様 |
|------|------|
| 表示範囲 | 今週（月〜日） |
| 学習済みの日 | 緑の丸 `✅` |
| 未学習の日（過去） | 赤の丸 `❌` |
| 未学習の日（未来） | グレーの丸 `●` |
| 今日（未学習） | グレーの丸 + パルスアニメーション |
| 今日（学習済み） | 緑の丸 + チェックマーク |

---

### 10.6 レベル / 称号システム（MVP後の拡張検討）

MVP では未実装とするが、将来的な拡張として以下を検討する。

| レベル | 必要累計語源数 | 称号 |
|--------|-------------|------|
| 1 | 0 | 語源ビギナー |
| 2 | 5 | 語源アプレンティス |
| 3 | 15 | 語源エクスプローラー |
| 4 | 30 | 語源マスター |
| 5 | 50 | 語源プロフェッサー |
| 6 | 80 | 語源レジェンド |

---

## 11. UIトーン＆ビジュアル指針

### 11.1 デザインコンセプト

「語源図鑑 × mikan」— 図鑑の知的で体系的な雰囲気と、mikanの親しみやすさ・軽快さを融合する。

### 11.2 カラーパレット

| 用途 | 色名 | HEXコード | 使用場面 |
|------|------|----------|---------|
| プライマリ | ディープブルー | `#1B4F72` | ヘッダー、タブバー、主要テキスト |
| セカンダリ | スカイブルー | `#2E86C1` | ボタン、リンク、アクティブ状態 |
| アクセント | ローズピンク | `#E74C8B` | 接頭辞、語源分解の矢印、ハイライト |
| 成功 | エメラルドグリーン | `#27AE60` | 正解、学習完了、ストリーク |
| エラー | コーラルレッド | `#E74C3C` | 不正解、未学習 |
| 警告 | サンフラワーイエロー | `#F39C12` | ほぼ覚えた、注意 |
| 背景 | スノーホワイト | `#FAFAFA` | メイン背景 |
| カード背景 | ピュアホワイト | `#FFFFFF` | カード、モーダル |
| テキスト（主） | チャコール | `#1C1C1C` | 本文テキスト |
| テキスト（副） | スレートグレー | `#5D6D7E` | サブテキスト、ラベル |
| ボーダー | ライトグレー | `#E5E5E5` | カード枠線、セパレータ |

### 11.3 タイポグラフィ

| 要素 | フォント | サイズ | ウェイト |
|------|---------|--------|---------|
| 画面タイトル | System Default (San Francisco / Noto Sans JP) | 24pt | Bold |
| セクション見出し | 同上 | 18pt | SemiBold |
| 本文 | 同上 | 16pt | Regular |
| 補足テキスト | 同上 | 14pt | Regular |
| キャプション | 同上 | 12pt | Regular |
| クイズ出題単語 | 同上 | 32pt | Bold |
| 語源テーブル内テキスト | 同上 | 14pt | Regular |
| ストリーク数字 | 同上 | 48pt | Bold |

### 11.4 コンポーネントスタイルルール

| 要素 | 仕様 |
|------|------|
| カード | 角丸: 12dp、影: `elevation: 2` / `shadowOpacity: 0.08`、背景: 白 |
| ボタン（プライマリ） | 角丸: 8dp、背景: セカンダリブルー、テキスト: 白、高さ: 48dp以上 |
| ボタン（セカンダリ） | 角丸: 8dp、背景: 透明、ボーダー: セカンダリブルー、テキスト: セカンダリブルー |
| 4択ボタン | 角丸: 8dp、背景: 白、ボーダー: ライトグレー、高さ: 56dp以上 |
| バッジ | 角丸: 4dp、パディング: 4×8dp、フォント: 10pt |
| プログレスバー | 角丸: 4dp、高さ: 8dp、背景: ライトグレー |
| タブバー | 背景: 白、影: 上方向、アイコン+ラベル |

### 11.5 アニメーション指針

| 場面 | アニメーション | ライブラリ | duration |
|------|-------------|-----------|----------|
| 画面遷移 | スライド（左右） | Expo Router デフォルト | 300ms |
| 語源テーブル表示 | 行ごとのフェードイン | react-native-reanimated | 1500ms (全体) |
| 語源分解表示 | 要素ごとのフェードイン | react-native-reanimated | 800ms (全体) |
| クイズ正解 | ボタン色変化 + チェックマークスケールイン | react-native-reanimated | 300ms |
| クイズ不正解 | ボタン色変化 + シェイクアニメーション | react-native-reanimated | 300ms |
| ストリーク達成 | 数字のカウントアップ + 紙吹雪 | react-native-reanimated | 1000ms |
| 結果画面 100% | 紙吹雪パーティクル | react-native-reanimated | 2000ms |

---

## 12. AdMob 広告設計方針

### 12.1 広告タイプと配置

| 広告タイプ | 配置画面 | 表示条件 |
|-----------|---------|---------|
| バナー（320×50） | D-001 ダッシュボード | CTAボタンの上。常時表示 |
| バナー（320×50） | L-001 語源ツリー一覧 | リスト下部。常時表示 |
| インタースティシャル（全画面） | Q-003 クイズ結果画面 | 結果確認後。毎回表示 |
| インタースティシャル（全画面） | L-001→L-002 遷移時 | 3回に1回表示（カウンタ管理） |

### 12.2 広告を絶対に出さない場所

| 画面 | 理由 |
|------|------|
| Q-002 クイズ出題中 | 集中を完全に破壊する。学習体験の品質を守る |
| Q-004 語源分解表示 | 「理解の瞬間」（アハ体験）を守る |
| L-002 語源ツリー詳細 | 学習中の没入感を阻害する |
| R-001 復習クイズ出題中 | 記憶定着の瞬間を邪魔しない |
| S-002 オンボーディング | 初回体験の印象を守る |
| S-003 目標設定 | 初回設定フローに広告は不適切 |

### 12.3 広告表示の技術ルール

| ルール | 説明 |
|--------|------|
| Proユーザー | 全広告非表示。`useSubscription().isPro` で制御 |
| ローディング | 広告の読み込み中はスペースを確保し、レイアウトシフトを防ぐ |
| エラーハンドリング | 広告の読み込み失敗時はスペースを非表示にする（空白を残さない） |
| インタースティシャルの事前読み込み | クイズ開始時に事前ロードし、結果画面表示時にすぐ表示できるようにする |
| 頻度制限 | インタースティシャルは最大5分に1回まで（ユーザー体験保護） |

### 12.4 Pro アップグレードへの導線

| 場面 | 表示 | 遷移先 |
|------|------|--------|
| 31個目以降の語源タップ | ロックアイコン + 「Proで全語源を解放」 | T-004 |
| 復習クイズ2回目（Free） | 「今日はここまで。Proなら無制限」 | T-004 |
| ミックスクイズ/まとめテスト選択 | Proバッジ + 「Proで解放」 | T-004 |
| 語源ヒント非表示状態 | 「Proなら語源ヒントが使える」テキスト | T-004 |
| 広告表示後 | 「広告を消してもっと快適に」テキストリンク | T-004 |

---

## 13. 語源データ構造仕様

### 13.1 Etymology（語源マスター）JSON構造

```json
{
  "id": "etym_tract",
  "root": "-tract",
  "root_meaning": "to pull, to draw",
  "root_meaning_ja": "引く",
  "category": "動作",
  "chapter": 1,
  "is_free": true,
  "sort_order": 1,
  "description_ja": "「引く」を意味するラテン語 trahere に由来。attract（引き付ける）、extract（引き出す）など多くの単語の語根。"
}
```

### 13.2 Word（単語マスター）JSON構造

```json
{
  "id": "word_attraction",
  "etymology_id": "etym_tract",
  "word": "attraction",
  "pronunciation": "ətrǽkʃən",
  "prefix": "at-",
  "prefix_meaning": "〜の方へ",
  "prefix_meaning_en": "toward",
  "root": "-tract",
  "root_meaning_ja": "引く",
  "suffix": "-ion",
  "suffix_meaning": "〜すること（名詞化）",
  "combined_meaning": "引き付けるもの",
  "meaning_ja": "魅力、引き付けるもの",
  "meaning_sub_ja": "観光名所、アトラクション",
  "part_of_speech": "名詞",
  "derivatives": [
    { "word": "attract", "pos": "動詞", "meaning": "引き付ける" },
    { "word": "attractive", "pos": "形容詞", "meaning": "魅力的な" }
  ],
  "example_en": "The main attraction of the city is its beautiful old town.",
  "example_ja": "その都市の一番の魅力は、美しい旧市街です。",
  "toeic_level": 600,
  "sort_order": 1
}
```

### 13.3 MVP 語源データ量の目標

| 項目 | MVP目標 | 備考 |
|------|--------|------|
| 語源数 | 80〜100語源 | Free: 30語源、Pro: 全語源 |
| 単語数 | 500〜800単語 | 1語源あたり平均5〜8単語 |
| チャプター数 | 8〜10チャプター | 語源を意味カテゴリでグループ化 |
| TOEIC対応レベル | 400〜700点レベル | メインターゲット（600点目標）に最適化 |

### 13.4 チャプター構成案

| チャプター | テーマ | 語源例 | 単語数目安 |
|-----------|--------|--------|----------|
| 1 | 動作・移動 | -tract(引く), -ject(投げる), -port(運ぶ), -mit(送る), -duct(導く) | 50〜80語 |
| 2 | 見る・知る | -spect(見る), -vis(見る), -sci(知る), -gno(知る), -clar(明らか) | 40〜60語 |
| 3 | 押す・引く・曲げる | -press(押す), -pul(押す/引く), -flect(曲がる), -vert(回る), -volv(回る) | 50〜70語 |
| 4 | 作る・壊す | -struct(組み立てる), -fact(作る), -rupt(壊れる), -gen(生む), -form(形) | 50〜70語 |
| 5 | つかむ・持つ | -cap(つかむ), -tain(保つ), -prehend(つかむ), -cept(取る), -sum(取る) | 40〜60語 |
| 6 | 書く・話す | -scrib(書く), -dict(言う), -log(言葉), -claim(叫ぶ), -voc(声) | 40〜60語 |
| 7 | 立つ・置く・座る | -sist(立つ), -pos(置く), -sed(座る), -stat(立つ), -loc(場所) | 40〜60語 |
| 8 | 行く・来る | -ced(行く), -ven(来る), -grad(歩む), -cur(走る), -sequ(続く) | 50〜70語 |
| 9 | 心・感覚 | -path(感情), -sens(感じる), -cord(心), -anim(心/命), -psych(心) | 40〜60語 |
| 10 | 数・量・大きさ | -numer(数), -plen(満ちる), -magn(大きい), -min(小さい), -equ(等しい) | 40〜60語 |

---

## 14. 非機能要件

### 14.1 パフォーマンス要件

| 項目 | 目標値 |
|------|--------|
| アプリ起動時間（コールドスタート） | 2秒以内 |
| 画面遷移 | 300ms以内 |
| クイズの問題間遷移 | 500ms以内（フィードバック含む） |
| AsyncStorage 読み書き | 100ms以内 |
| アニメーションフレームレート | 60fps |
| アプリサイズ（インストール後） | 50MB以内 |

### 14.2 対応プラットフォーム

| 項目 | 仕様 |
|------|------|
| OS | iOS のみ（MVP） |
| 最低バージョン | iOS 16.0 |
| デバイス | iPhone SE (2nd) 以降 |
| 画面サイズ | 375pt〜430pt 幅に対応（SE〜Pro Max） |
| 向き | 縦向き固定 |

### 14.3 データ整合性

| 項目 | 方針 |
|------|------|
| ストリークデータ | 日付変更時の不整合防止のため、UTC ではなくローカルタイムゾーンで管理 |
| 習熟度データ | クイズ完了時にまとめて保存（1問ごとの保存は行わない） |
| マスターデータ | アプリバンドルのJSON。アプリアップデートでのみ更新 |
| バックアップ | MVP では未対応。将来 Supabase 移行時にクラウド同期を実装 |

### 14.4 アクセシビリティ

| 項目 | 方針 |
|------|------|
| VoiceOver | 全ボタン・カードに `accessibilityLabel` を設定 |
| 動的フォントサイズ | iOS の Dynamic Type に対応（テキストのみ。レイアウトは固定） |
| コントラスト比 | WCAG 2.1 AA 準拠（4.5:1 以上） |
| タップターゲット | 最小 44×44 pt |

---

## 15. MVP スコープ外（将来検討）

以下は MVP では実装しないが、将来のバージョンで検討する機能。

| 機能 | 優先度 | 備考 |
|------|--------|------|
| Supabase バックエンド移行 | 高 | ユーザーデータのクラウド同期・機種変更対応 |
| Android 対応 | 高 | Expo の Cross-platform ビルドで対応 |
| ストリーク復活機能（Pro特典） | 中 | 月1回の復活権 |
| SNS シェア | 中 | クイズ結果のシェア |
| ランキング機能 | 中 | 週間学習量ランキング |
| レベル / 称号システム | 低 | セクション10.6 参照 |
| 音声認識クイズ | 低 | 英単語の発音をチェックするモード |
| 語源系統樹のビジュアル | 低 | 語源のつながりをツリーマップで表示 |
| ウィジェット（iOS） | 低 | ストリーク表示・今日の語源ウィジェット |
| Apple Watch 対応 | 低 | 簡易クイズモード |

---

## 付録A: 用語定義

| 用語 | 定義 |
|------|------|
| 語源（Etymology） | 英単語の語根（root）。接頭辞・語根・接尾辞の組み合わせで単語の意味を説明するもの |
| 語根（Root） | 単語の核となる部分（例: -tract, -press, -ject） |
| 接頭辞（Prefix） | 語根の前に付く部分で、方向や状態を示す（例: ex-, con-, in-） |
| 接尾辞（Suffix） | 語根の後に付く部分で、品詞を決定する（例: -tion, -ive, -ment） |
| ストリーク | 連続学習日数 |
| 習熟度（Mastery） | 単語の定着度を4段階（苦手→うろ覚え→ほぼ覚えた→覚えた）で表すレベル |
| 間隔反復（Spaced Repetition） | 忘却曲線に基づき、最適なタイミングで復習を行う学習法 |
| Pro ゲート | Free ユーザーに対してPro機能へのアクセスを制限し、アップグレード画面へ誘導するUI |

---

## 付録B: 画面遷移マトリクス

| 遷移元 | 遷移先 | トリガー | 備考 |
|--------|--------|---------|------|
| S-001 | S-002 | 1.5秒自動遷移 | 初回のみ |
| S-001 | D-001 | 1.5秒自動遷移 | 2回目以降 |
| S-002 | S-003 | 「始める」タップ | |
| S-003 | D-001 | 「完了」タップ | |
| D-001 | L-002 | おすすめ語源カードタップ | |
| D-001 | Q-001 | 「クイズに挑戦」タップ | |
| L-001 | L-002 | 語源カードタップ | |
| L-002 | L-003 | 単語カードタップ | |
| L-002 | Q-002 | 「この語源でクイズに挑戦」タップ | etymology_filter を渡す |
| Q-001 | Q-002 | 語源別クイズ選択 | |
| Q-001 | R-001 | 復習クイズ選択 | |
| Q-001 | M-001 | ミックスクイズ/まとめテスト選択 | Pro ゲートあり |
| Q-002 | Q-003 | 全問回答完了 | |
| Q-002 | Q-004 | 不正解時（ボトムシート） | |
| Q-003 | Q-002 | 「もう一度挑戦」タップ | |
| Q-003 | D-001 | 「ホームに戻る」タップ | |
| Q-003 | Q-004 | 間違えた単語タップ | |
| M-001 | M-002 | テスト開始 | |
| M-002 | M-003 | 全問回答完了 | |
| 各画面 | T-004 | Pro ゲートタップ | |
| T-004 | T-005 | 課金完了 | |
| T-005 | 元の画面 | 「完了」タップ | |

---

*以上、Rootify MVP 要件定義書*
