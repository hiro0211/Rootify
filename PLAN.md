# Implementation Plan: Task 008 — TOEIC 600 Content Expansion & App Store Marketing

> **Phase**: Implementation Plan (for Sonnet execution)
> **Scope**: `src/data/etymologies.json`, `src/data/words.json`, `src/data/__tests__/integrity.test.ts`, `documents/contents.md`, `600SCORE.MD`, `APPSTORE.md`
> **Goal**: Expand from 38→100 etymologies, 218→540+ words; Create marketing documents

---

## 1. Analysis — Current State

### 1.1 Current Data Statistics
| Metric | Current Value |
|--------|--------------|
| Etymologies | 38 (30 in Ch1 free, 8 in Ch2 Pro) |
| Words | 218 |
| Words per etymology | 5-12 (avg 5.7) |
| Categories | Only "動作" (all 38) |
| Chapters | 2 (1=free, 2=Pro) |
| Free etymologies | 30 (at test limit of ≤30) |
| File size words.json | 149 KB |
| File size etymologies.json | 11 KB |

### 1.2 Data Quality Issues in Existing Data
- 92/218 words missing `pronunciation`
- 92/218 words missing `example_en` and `example_ja`
- 117/218 words with empty `derivatives` array
- 143/218 words with empty `suffix`
- All etymologies use category "動作" — need diversification

### 1.3 Schema (from `src/features/etymology/types.ts`)

**Etymology** (9 required fields):
```typescript
interface Etymology {
  id: string;           // "etym_" + root_name
  root: string;         // "-tract"
  root_meaning: string; // "to 引く"
  root_meaning_ja: string; // "引く"
  category: string;     // "動作", "状態", "性質", etc.
  chapter: number;      // 1-10
  is_free: boolean;     // true for Ch1-2, false for Ch3-10
  sort_order: number;   // globally unique, positive integer
  description_ja: string; // Japanese description of etymology
}
```

**Word** (20 fields, some optional):
```typescript
interface Word {
  id: string;              // "word_" + english_word
  etymology_id: string;    // must reference valid etymology
  word: string;            // "attraction"
  pronunciation: string;   // can be ""
  prefix: string;          // "at-", can be ""
  prefix_meaning: string;  // "〜の方へ", can be ""
  prefix_meaning_en: string; // "toward", can be ""
  root: string;            // "-tract" (REQUIRED non-empty)
  root_meaning_ja: string; // "引く" (REQUIRED non-empty)
  suffix: string;          // "-ion", can be ""
  suffix_meaning: string;  // "こと（名詞）", can be ""
  combined_meaning: string;// "引き付けるもの", can be ""
  meaning_ja: string;      // "魅力、引き付けるもの" (REQUIRED)
  meaning_sub_ja: string;  // can be ""
  part_of_speech: string;  // "名詞", "動詞", "形容詞", "副詞", combo types
  derivatives: Derivative[];// can be []
  example_en: string;      // can be ""
  example_ja: string;      // can be ""
  toeic_level: number;     // 300|400|500|600|700|800
  sort_order: number;      // positive integer
}
```

### 1.4 Test Constraints (`src/data/__tests__/integrity.test.ts`)

These tests MUST ALL PASS:

| Test | Constraint | Line |
|------|-----------|------|
| 全単語が有効なetymology_idを持つ | Every `word.etymology_id` must exist in etymologies | L18-26 |
| 語源IDに重複がないこと | No duplicate etymology IDs | L28-32 |
| 単語IDに重複がないこと | No duplicate word IDs | L34-48 |
| 各語源が必須フィールドを全て持つ | id, root, root_meaning, root_meaning_ja, category, chapter(number), is_free(boolean), sort_order(number), description_ja must all be truthy | L52-63 |
| 語源IDが"etym_"プレフィックス | All etymology IDs match `/^etym_/` | L66-69 |
| sort_orderが正の整数 | `sort_order > 0` for all etymologies | L72-76 |
| 各単語が必須フィールドを持つ | id, etymology_id, word, root, root_meaning_ja, meaning_ja, part_of_speech must be truthy; sort_order must be number | L81-91 |
| 単語IDが"word_"プレフィックス | All word IDs match `/^word_/` | L94-98 |
| 品詞が有効な値 | Valid: 名詞, 動詞, 形容詞, 副詞, 動詞/名詞, 名詞/形容詞, 名詞/動詞, 形容詞/副詞 | L100-108 |
| toeic_levelが有効範囲 | Must be in [300,400,500,600,700,800] or 0/undefined | L111-118 |
| derivativesが配列 | `Array.isArray(word.derivatives)` | L120-124 |
| **各語源に少なくとも5つの単語** | **Every etymology must have ≥5 words** | L137-157 |
| Free語源が30個以下 | `etymologies.filter(e => e.is_free).length <= 30` | L162-165 |
| Free語源が存在すること | At least 1 free etymology | L167-170 |

### 1.5 Existing Patterns to Follow

**Etymology ID format**: `etym_` + lowercase root name (without dash). E.g., `etym_tract`, `etym_press`.

**Word ID format**: `word_` + lowercase English word. E.g., `word_attraction`, `word_extract`.

**root_meaning format**: `"to "` + Japanese meaning. E.g., `"to 引く"`, `"to 押す"`.

**description_ja format**: `"「{meaning}」を意味する{language} ({latin_word})に由来。"`. E.g., `"「引く」を意味するラテン語 (trahere)に由来。"`

**Sparse word pattern** (acceptable — matches existing lines 300+):
```json
{
  "id": "word_eject",
  "etymology_id": "etym_ject",
  "word": "eject",
  "pronunciation": "",
  "prefix": "e-",
  "prefix_meaning": "",
  "prefix_meaning_en": "",
  "root": "-ject",
  "root_meaning_ja": "投げる",
  "suffix": "",
  "suffix_meaning": "行為・状態",
  "combined_meaning": "外に投げる",
  "meaning_ja": "排出する",
  "meaning_sub_ja": "",
  "part_of_speech": "動詞",
  "derivatives": [],
  "example_en": "",
  "example_ja": "",
  "toeic_level": 600,
  "sort_order": 12
}
```

---

## 2. Implementation Steps

### Step 0: Pre-flight — Verify existing tests pass

**Command**: `npx jest --config jest.config.js --no-watchman --passWithNoTests`

Confirm all existing tests pass before making ANY changes.

---

### Step 1: Create `600SCORE.MD` (Content Strategy Document)

**File**: `/Users/arimurahiroaki/Rootify/600SCORE.MD` (NEW FILE)

Write a markdown document containing:
1. **TOEIC 600点に必要な語彙分析** — Summary of TOEIC 600 vocabulary requirements (~500-800 words needed, etymology covers 88-90%)
2. **現状との差分** — Current: 38 roots/218 words → Target: 100 roots/540+ words
3. **追加すべき語源・単語の一覧** — Full list of 62 new etymologies with their derivative words (see Section 2.3 below for the complete list)
4. **学習カリキュラム提案** — 10-chapter weekly plan:
   - Weeks 1-2: Ch1 (Free, 15 roots, 80 words)
   - Weeks 3-4: Ch2 (Free, 15 roots, 80 words)
   - Weeks 5-6: Ch3-4 (Pro, ~18 roots)
   - Weeks 7-8: Ch5-6 (Pro, ~18 roots)
   - Weeks 9-10: Ch7-8 (Pro, ~16 roots)
   - Weeks 11-12: Ch9-10 (Pro, ~18 roots)

Content should reference the research findings from the TOEIC vocabulary agent.

---

### Step 2: Verify APPSTORE.md exists

**File**: `/Users/arimurahiroaki/Rootify/APPSTORE.md`

This file was already created by the ASO research agent. Verify it exists and contains all required sections. If missing, create it with the content from the ASO research agent's output (see agent result for full text).

---

### Step 3: Restructure `etymologies.json` — Expand from 38 to 100

**File**: `src/data/etymologies.json`

#### 3.1 Chapter Redistribution of Existing 30 Ch1 Roots

Keep all 30 existing chapter-1 roots as **free** (`is_free: true`), but split them into 2 thematic chapters:

**Chapter 1 — "動作・移動" (Physical Movement)** — 15 roots:
| Existing ID | root | Keep sort_order |
|-------------|------|----------------|
| etym_tract | -tract | 1 |
| etym_press | -press | 2 |
| etym_ject | -ject | 3 |
| etym_port | -port | 4 |
| etym_duct | -duct | 6 |
| etym_cede | -cede | 7 |
| etym_mit | -mit | 8 |
| etym_pose | -pose | 9 |
| etym_vert | -vert | 11 |
| etym_fer | -fer | 19 |
| etym_pend | -pend | 20 |
| etym_grad | -grad | 27 |
| etym_act | -act | 28 |
| etym_mov | -mov | 29 |
| etym_flu | -flu | 30 |

**Changes for these 15 roots**: Only `chapter` field changes (stays 1). No other changes needed.

**Chapter 2 — "知覚・構造" (Perception & Structure)** — 15 roots:
| Existing ID | root | New sort_order |
|-------------|------|---------------|
| etym_vis | -vis | 5 |
| etym_spect | -spect | 10 |
| etym_scrib | -scrib | 12 |
| etym_struct | -struct | 13 |
| etym_tend | -tend | 14 |
| etym_form | -form | 15 |
| etym_fect | -fect | 16 |
| etym_ceive | -ceive | 17 |
| etym_sist | -sist | 18 |
| etym_voc | -voc | 21 |
| etym_dict | -dict | 22 |
| etym_clude | -clude | 23 |
| etym_rupt | -rupt | 24 |
| etym_sign | -sign | 25 |
| etym_vent | -vent | 26 |

**Changes for these 15 roots**: Change `chapter` from 1 to 2. Keep `is_free: true`. Keep existing `sort_order`.

#### 3.2 Reassign Existing 8 Ch2 Roots to New Chapters

These 8 roots currently in chapter 2 (`is_free: false`) get reassigned to thematic paid chapters:

| Existing ID | New Chapter | New Category |
|-------------|-------------|-------------|
| etym_lect | 10 | 動作 |
| etym_plic | 3 | 動作 |
| etym_cap | 5 | 動作 |
| etym_gen | 3 | 動作 |
| etym_cred | 6 | 動作 |
| etym_mand | 6 | 動作 |
| etym_serv | 8 | 動作 |
| etym_cure | 8 | 動作 |

**Changes**: Update `chapter` number. Keep `is_free: false`.

#### 3.3 Add 62 NEW Etymologies

New etymologies start at `sort_order: 39` and increment sequentially.

**CRITICAL RULES for new etymologies**:
- `id`: `"etym_"` + root name (lowercase, no dashes, no slashes). E.g., for -solve/-solu → `"etym_solve"`
- `root`: Use primary form with dash prefix. E.g., `"-solve"`
- `root_meaning`: `"to "` + Japanese meaning
- `root_meaning_ja`: Japanese meaning only
- `category`: Use appropriate category from: 動作, 状態, 性質, 数量, 形状, 場所, 時間, 社会, 身体, 知識, 名称
- `chapter`: 3-10 (see chapter plan below)
- `is_free`: `false` (all new roots are Pro)
- `description_ja`: Follow pattern `"「{meaning}」を意味する{language} ({latin_word})に由来。"`

**Chapter 3 — "創造・成長" (Creation & Growth)** — 9 roots (is_free: false)
| New ID | root | meaning_ja | category | sort_order |
|--------|------|-----------|----------|------------|
| etym_plic | (existing, moved) | 折る/重ねる | 動作 | 32 |
| etym_gen | (existing, moved) | 生む | 動作 | 34 |
| etym_cresc | -cresc | 成長する | 動作 | 39 |
| etym_plet | -plet | 満たす | 動作 | 40 |
| etym_labor | -labor | 働く | 動作 | 41 |
| etym_oper | -oper | 働く | 動作 | 42 |
| etym_man | -man | 手 | 身体 | 43 |
| etym_log | -log | 言葉/学問 | 知識 | 44 |
| etym_graph | -graph | 書く | 知識 | 45 |

**Chapter 4 — "位置・方向" (Position & Direction)** — 9 roots
| New ID | root | meaning_ja | category | sort_order |
|--------|------|-----------|----------|------------|
| etym_loc | -loc | 場所 | 場所 | 46 |
| etym_rect | -rect | まっすぐ | 性質 | 47 |
| etym_clin | -clin | 傾く | 動作 | 48 |
| etym_circ | -circ | 輪/環 | 形状 | 49 |
| etym_flect | -flect | 曲げる | 動作 | 50 |
| etym_stat | -stat | 立てる/状態 | 状態 | 51 |
| etym_med | -med | 中間 | 状態 | 52 |
| etym_termin | -termin | 限る/終わり | 状態 | 53 |
| etym_norm | -norm | 規範 | 性質 | 54 |

**Chapter 5 — "交換・取得" (Exchange & Acquisition)** — 9 roots
| New ID | root | meaning_ja | category | sort_order |
|--------|------|-----------|----------|------------|
| etym_cap | (existing, moved) | 掴む/取る | 動作 | 33 |
| etym_tain | -tain | 保つ/持つ | 動作 | 55 |
| etym_sum | -sum | 取る | 動作 | 56 |
| etym_quir | -quir | 求める | 動作 | 57 |
| etym_tribut | -tribut | 与える/割り当てる | 動作 | 58 |
| etym_hab | -hab | 持つ/住む | 動作 | 59 |
| etym_test | -test | 証する | 動作 | 60 |
| etym_pel | -pel | 押す/駆る | 動作 | 61 |
| etym_tang | -tang | 触れる | 動作 | 62 |

**Chapter 6 — "秩序・統治" (Order & Governance)** — 9 roots
| New ID | root | meaning_ja | category | sort_order |
|--------|------|-----------|----------|------------|
| etym_cred | (existing, moved) | 信じる | 動作 | 35 |
| etym_mand | (existing, moved) | 命じる/託す | 動作 | 36 |
| etym_reg | -reg | まっすぐ/支配 | 状態 | 63 |
| etym_ord | -ord | 順序 | 状態 | 64 |
| etym_junct | -junct | つなぐ | 動作 | 65 |
| etym_dom | -dom | 支配/家 | 状態 | 66 |
| etym_neg | -neg | 否定 | 動作 | 67 |
| etym_nomin | -nomin | 名前 | 名称 | 68 |
| etym_sequ | -sequ | 従う | 動作 | 69 |

**Chapter 7 — "価値・測定" (Value & Measurement)** — 8 roots
| New ID | root | meaning_ja | category | sort_order |
|--------|------|-----------|----------|------------|
| etym_val | -val | 価値/強い | 状態 | 70 |
| etym_equ | -equ | 等しい | 性質 | 71 |
| etym_fin | -fin | 終わる/限る | 状態 | 72 |
| etym_count | -count | 数える | 動作 | 73 |
| etym_cent | -cent | 100 | 数量 | 74 |
| etym_part | -part | 部分/分ける | 動作 | 75 |
| etym_plain | -plain | 平ら/明らか | 性質 | 76 |
| etym_sent | -sent | 感じる | 状態 | 77 |

**Chapter 8 — "保全・変化" (Preservation & Change)** — 8 roots
| New ID | root | meaning_ja | category | sort_order |
|--------|------|-----------|----------|------------|
| etym_serv | (existing, moved) | 仕える/保つ | 動作 | 37 |
| etym_cure | (existing, moved) | 注意/世話 | 動作 | 38 |
| etym_alter | -alter | 変える/他の | 動作 | 78 |
| etym_volv | -volv | 回る/巻く | 動作 | 79 |
| etym_dur | -dur | 続く/硬い | 状態 | 80 |
| etym_solve | -solve | 解く/緩める | 動作 | 81 |
| etym_firm | -firm | 強い/固い | 状態 | 82 |
| etym_turb | -turb | 乱す | 動作 | 83 |

**Chapter 9 — "生命・社会" (Life & Society)** — 9 roots
| New ID | root | meaning_ja | category | sort_order |
|--------|------|-----------|----------|------------|
| etym_viv | -viv | 生きる | 状態 | 84 |
| etym_nat | -nat | 生まれる | 状態 | 85 |
| etym_popul | -popul | 人々 | 社会 | 86 |
| etym_path | -path | 感じる/苦しむ | 状態 | 87 |
| etym_bio | -bio | 生命 | 知識 | 88 |
| etym_spir | -spir | 呼吸する | 動作 | 89 |
| etym_simil | -simil | 似た | 性質 | 90 |
| etym_chron | -chron | 時間 | 時間 | 91 |
| etym_greg | -greg | 群れ | 社会 | 92 |

**Chapter 10 — "知識・決定" (Knowledge & Decision)** — 10 roots
| New ID | root | meaning_ja | category | sort_order |
|--------|------|-----------|----------|------------|
| etym_lect | (existing, moved) | 集める/読む | 動作 | 31 |
| etym_cid | -cid | 切る/決める | 動作 | 93 |
| etym_aud | -aud | 聞く | 動作 | 94 |
| etym_claim | -claim | 叫ぶ | 動作 | 95 |
| etym_crit | -crit | 判断する | 知識 | 96 |
| etym_cur | -cur | 走る | 動作 | 97 |
| etym_fund | -fund | 注ぐ/溶かす | 動作 | 98 |
| etym_merg | -merg | 沈む/浸す | 動作 | 99 |
| etym_ped | -ped | 足 | 身体 | 100 |

#### 3.4 Summary Verification

| Chapter | # Etymologies | is_free | Theme |
|---------|--------------|---------|-------|
| 1 | 15 | true | 動作・移動 |
| 2 | 15 | true | 知覚・構造 |
| 3 | 9 | false | 創造・成長 |
| 4 | 9 | false | 位置・方向 |
| 5 | 9 | false | 交換・取得 |
| 6 | 9 | false | 秩序・統治 |
| 7 | 8 | false | 価値・測定 |
| 8 | 8 | false | 保全・変化 |
| 9 | 9 | false | 生命・社会 |
| 10 | 9 | false | 知識・決定 |
| **Total** | **100** | **30 free** | |

Free count = 30 ≤ 30 ✅

---

### Step 4: Expand `words.json` — From 218 to 540+

**File**: `src/data/words.json`

#### 4.1 Rules for Existing Words

- **DO NOT change** existing word `id` values
- **DO NOT change** existing word `etymology_id` values
- Existing words remain as-is (including empty optional fields)
- Add words to existing etymologies that currently have < 5 (actually all have ≥ 5, so this is fine)
- For the `-plic` etymology, add additional words from the merged `-ple/-ply` family: `supply`, `employ`, `display`, `multiply`, `reply` (5 new words under `etym_plic`)

#### 4.2 Rules for New Words

For each of the 62 NEW etymologies, create **exactly 5 words** minimum. Target 5-6 words per new etymology for a total of ~330 new words (62 × 5.3 avg).

**REQUIRED fields** (must be non-empty):
- `id`: `"word_"` + lowercase English word (no spaces, no special chars)
- `etymology_id`: Must reference an existing etymology ID
- `word`: English word in lowercase
- `root`: The root with dash prefix, matching the etymology's root field
- `root_meaning_ja`: Japanese meaning of root (must match etymology)
- `meaning_ja`: Japanese meaning (main)
- `part_of_speech`: One of: 名詞, 動詞, 形容詞, 副詞, 動詞/名詞, 名詞/形容詞, 名詞/動詞, 形容詞/副詞
- `sort_order`: Positive integer. Continue from current max (159). New words start at 160+
- `toeic_level`: One of 300, 400, 500, 600, 700, 800
- `derivatives`: `[]` (empty array is fine)

**OPTIONAL fields** (can be empty string `""`):
- `pronunciation`, `prefix`, `prefix_meaning`, `prefix_meaning_en`
- `suffix`, `suffix_meaning`, `combined_meaning`
- `meaning_sub_ja`, `example_en`, `example_ja`

**Follow the "sparse" pattern** (matching existing lines 300+ in words.json):
```json
{
  "id": "word_{english_word}",
  "etymology_id": "etym_{root}",
  "word": "{english_word}",
  "pronunciation": "",
  "prefix": "{prefix or empty}",
  "prefix_meaning": "{meaning or empty}",
  "prefix_meaning_en": "",
  "root": "-{root}",
  "root_meaning_ja": "{root_meaning}",
  "suffix": "{suffix or empty}",
  "suffix_meaning": "{suffix_meaning or 行為・状態}",
  "combined_meaning": "{prefix_meaning + root_meaning}",
  "meaning_ja": "{japanese_meaning}",
  "meaning_sub_ja": "",
  "part_of_speech": "{品詞}",
  "derivatives": [],
  "example_en": "",
  "example_ja": "",
  "toeic_level": {600|700|800},
  "sort_order": {number}
}
```

#### 4.3 Complete Word List for Each New Etymology

Below is the authoritative word list for each new etymology. The implementation agent MUST use these exact words and meanings. Each entry shows: word | prefix | meaning_ja | part_of_speech | toeic_level

**etym_cresc** (-cresc, 成長する, Latin crescere):
- increase | in- | 増加する | 動詞 | 600
- decrease | de- | 減少する | 動詞 | 600
- create | cre- | 創造する | 動詞 | 700
- concrete | con- | 具体的な | 形容詞 | 700
- increment | in- | 増分 | 名詞 | 600

**etym_plet** (-plet, 満たす, Latin plere):
- complete | com- | 完了する | 動詞 | 600
- supplement | sup- | 補足する | 動詞 | 700
- implement | im- | 実施する | 動詞 | 600
- deplete | de- | 枯渇させる | 動詞 | 700
- complement | com- | 補完する | 動詞 | 700

**etym_labor** (-labor, 働く, Latin laborare):
- collaborate | col- | 協力する | 動詞 | 700
- laboratory | - | 研究所 | 名詞 | 700
- elaborate | e- | 詳細な | 形容詞 | 700
- labor | - | 労働 | 名詞 | 600
- laborious | - | 骨の折れる | 形容詞 | 600

**etym_oper** (-oper, 働く, Latin operare):
- operate | - | 操作する | 動詞 | 600
- cooperate | co- | 協力する | 動詞 | 600
- operation | - | 操作 | 名詞 | 600
- operator | - | 操作者 | 名詞 | 600
- cooperative | co- | 協同の | 形容詞 | 700

**etym_man** (-man, 手, Latin manus):
- manage | - | 管理する | 動詞 | 600
- manufacture | - | 製造する | 動詞 | 700
- manual | - | 手動の | 形容詞 | 600
- manipulate | - | 操作する | 動詞 | 700
- manner | - | 方法 | 名詞 | 600

**etym_log** (-log, 言葉/学問, Greek logos):
- technology | techno- | 技術 | 名詞 | 600
- apology | apo- | 謝罪 | 名詞 | 600
- catalog | cata- | カタログ | 名詞 | 700
- dialogue | dia- | 対話 | 名詞 | 700
- logical | - | 論理的な | 形容詞 | 700

**etym_graph** (-graph, 書く, Greek graphein):
- photograph | photo- | 写真 | 名詞 | 600
- paragraph | para- | 段落 | 名詞 | 700
- program | pro- | プログラム | 名詞 | 600
- diagram | dia- | 図表 | 名詞 | 700
- autograph | auto- | 自筆 | 名詞 | 600

**etym_loc** (-loc, 場所, Latin locus):
- locate | - | 位置を見つける | 動詞 | 600
- local | - | 地元の | 形容詞 | 600
- allocate | al- | 割り当てる | 動詞 | 700
- relocate | re- | 移転する | 動詞 | 700
- location | - | 場所 | 名詞 | 600

**etym_rect** (-rect, まっすぐ, Latin rectus):
- direct | di- | 指示する | 動詞 | 600
- correct | cor- | 正しい | 形容詞 | 600
- erect | e- | 建てる | 動詞 | 700
- direction | di- | 方向 | 名詞 | 600
- director | di- | 取締役 | 名詞 | 600

**etym_clin** (-clin, 傾く, Latin clinare):
- decline | de- | 減少する | 動詞 | 600
- incline | in- | 傾ける | 動詞 | 700
- client | - | 顧客 | 名詞 | 600
- recline | re- | もたれかかる | 動詞 | 600
- clinic | - | 診療所 | 名詞 | 600

**etym_circ** (-circ, 輪/環, Latin circus):
- circumstance | - | 状況 | 名詞 | 600
- circle | - | 円 | 名詞 | 600
- circuit | - | 回路 | 名詞 | 700
- circular | - | 回覧の | 形容詞 | 700
- circulation | - | 循環 | 名詞 | 700

**etym_flect** (-flect, 曲げる, Latin flectere):
- reflect | re- | 反映する | 動詞 | 600
- flexible | - | 柔軟な | 形容詞 | 600
- deflect | de- | そらす | 動詞 | 700
- reflection | re- | 反映 | 名詞 | 600
- inflection | in- | 変化 | 名詞 | 700

**etym_stat** (-stat, 立てる/状態, Latin statuere/stare):
- constitute | con- | 構成する | 動詞 | 700
- institute | in- | 設立する | 動詞 | 700
- substitute | sub- | 代用する | 動詞 | 700
- establish | e- | 設立する | 動詞 | 600
- statistic | - | 統計 | 名詞 | 600

**etym_med** (-med, 中間, Latin medius):
- immediate | im- | 即座の | 形容詞 | 600
- media | - | メディア | 名詞 | 600
- medium | - | 媒体 | 名詞 | 700
- mediate | - | 仲介する | 動詞 | 700
- remedy | re- | 治療法 | 名詞 | 700

**etym_termin** (-termin, 限る/終わり, Latin terminus):
- determine | de- | 決定する | 動詞 | 600
- terminal | - | 末端の | 形容詞 | 700
- terminate | - | 終了させる | 動詞 | 700
- term | - | 期間 | 名詞 | 600
- terminology | - | 用語 | 名詞 | 700

**etym_norm** (-norm, 規範, Latin norma):
- normal | - | 普通の | 形容詞 | 600
- enormous | e- | 巨大な | 形容詞 | 600
- abnormal | ab- | 異常な | 形容詞 | 700
- norm | - | 規範 | 名詞 | 700
- normalize | - | 正常化する | 動詞 | 700

**etym_tain** (-tain, 保つ/持つ, Latin tenere):
- maintain | main- | 維持する | 動詞 | 600
- obtain | ob- | 取得する | 動詞 | 600
- contain | con- | 含む | 動詞 | 600
- retain | re- | 保持する | 動詞 | 700
- sustain | sus- | 持続する | 動詞 | 700

**etym_sum** (-sum, 取る, Latin sumere):
- consume | con- | 消費する | 動詞 | 600
- assume | as- | 想定する | 動詞 | 600
- resume | re- | 再開する | 動詞 | 600
- presume | pre- | 推定する | 動詞 | 700
- summary | - | 要約 | 名詞 | 600

**etym_quir** (-quir, 求める, Latin quaerere):
- require | re- | 要求する | 動詞 | 600
- acquire | ac- | 取得する | 動詞 | 600
- inquire | in- | 問い合わせる | 動詞 | 700
- request | re- | 依頼する | 動詞 | 600
- question | - | 質問 | 名詞 | 600

**etym_tribut** (-tribut, 与える/割り当てる, Latin tribuere):
- contribute | con- | 貢献する | 動詞 | 600
- distribute | dis- | 配布する | 動詞 | 600
- attribute | at- | 帰する | 動詞 | 700
- tribute | - | 賛辞 | 名詞 | 700
- attribution | at- | 帰属 | 名詞 | 700

**etym_hab** (-hab, 持つ/住む, Latin habere):
- exhibit | ex- | 展示する | 動詞 | 700
- inhabit | in- | 住む | 動詞 | 700
- prohibit | pro- | 禁止する | 動詞 | 700
- habit | - | 習慣 | 名詞 | 600
- rehabilitation | re- | リハビリ | 名詞 | 700

**etym_test** (-test, 証する, Latin testari):
- contest | con- | コンテスト | 名詞 | 700
- protest | pro- | 抗議する | 動詞 | 700
- testify | - | 証言する | 動詞 | 700
- testimony | - | 証言 | 名詞 | 700
- attest | at- | 証明する | 動詞 | 700

**etym_pel** (-pel, 押す/駆る, Latin pellere):
- compel | com- | 強いる | 動詞 | 700
- appeal | ap- | 訴える | 動詞 | 600
- expel | ex- | 追放する | 動詞 | 700
- impulse | im- | 衝動 | 名詞 | 700
- propel | pro- | 推進する | 動詞 | 700

**etym_tang** (-tang, 触れる, Latin tangere):
- contact | con- | 連絡する | 動詞 | 600
- intact | in- | 無傷の | 形容詞 | 700
- tangible | - | 具体的な | 形容詞 | 700
- attach | at- | 添付する | 動詞 | 600
- detach | de- | 分離する | 動詞 | 700

**etym_reg** (-reg, まっすぐ/支配, Latin regere):
- regular | - | 定期的な | 形容詞 | 600
- region | - | 地域 | 名詞 | 600
- regulate | - | 規制する | 動詞 | 700
- register | - | 登録する | 動詞 | 600
- regulation | - | 規制 | 名詞 | 600

**etym_ord** (-ord, 順序, Latin ordo):
- order | - | 注文する | 動詞 | 600
- ordinary | - | 普通の | 形容詞 | 600
- coordinate | co- | 調整する | 動詞 | 700
- extraordinary | extra- | 並外れた | 形容詞 | 700
- subordinate | sub- | 部下の | 形容詞 | 700

**etym_junct** (-junct, つなぐ, Latin iungere):
- function | - | 機能 | 名詞 | 600
- junction | - | 接合 | 名詞 | 700
- conjunction | con- | 接続 | 名詞 | 700
- adjunct | ad- | 付属の | 形容詞 | 700
- joint | - | 共同の | 形容詞 | 600

**etym_dom** (-dom, 支配/家, Latin domus):
- domestic | - | 国内の | 形容詞 | 600
- domain | - | 領域 | 名詞 | 700
- dominate | - | 支配する | 動詞 | 700
- dominant | - | 支配的な | 形容詞 | 700
- predominant | pre- | 優勢な | 形容詞 | 700

**etym_neg** (-neg, 否定, Latin negare):
- negotiate | - | 交渉する | 動詞 | 600
- negative | - | 否定的な | 形容詞 | 600
- neglect | - | 無視する | 動詞 | 700
- deny | de- | 否定する | 動詞 | 600
- negate | - | 否定する | 動詞 | 700

**etym_nomin** (-nomin, 名前, Latin nomen):
- nominate | - | 指名する | 動詞 | 700
- economy | eco- | 経済 | 名詞 | 600
- nominal | - | 名目上の | 形容詞 | 700
- nominee | - | 候補者 | 名詞 | 700
- denomination | de- | 額面 | 名詞 | 700

**etym_sequ** (-sequ, 従う, Latin sequi):
- consequence | con- | 結果 | 名詞 | 600
- sequence | - | 順序 | 名詞 | 700
- subsequent | sub- | 次の | 形容詞 | 700
- execute | ex- | 実行する | 動詞 | 700
- consecutive | con- | 連続した | 形容詞 | 700

**etym_val** (-val, 価値/強い, Latin valere):
- available | a- | 利用可能な | 形容詞 | 600
- evaluate | e- | 評価する | 動詞 | 600
- value | - | 価値 | 名詞 | 600
- valid | - | 有効な | 形容詞 | 600
- equivalent | equi- | 同等の | 形容詞 | 700

**etym_equ** (-equ, 等しい, Latin aequus):
- equal | - | 等しい | 形容詞 | 600
- equipment | - | 設備 | 名詞 | 600
- adequate | ad- | 十分な | 形容詞 | 600
- equip | - | 備える | 動詞 | 600
- equity | - | 公平 | 名詞 | 700

**etym_fin** (-fin, 終わる/限る, Latin finis):
- final | - | 最終の | 形容詞 | 600
- define | de- | 定義する | 動詞 | 600
- finance | - | 財政 | 名詞 | 600
- refine | re- | 精製する | 動詞 | 700
- infinite | in- | 無限の | 形容詞 | 700

**etym_count** (-count, 数える, Latin computare):
- account | ac- | 口座 | 名詞 | 600
- discount | dis- | 割引 | 名詞 | 600
- counter | - | カウンター | 名詞 | 600
- accountant | ac- | 会計士 | 名詞 | 600
- encounter | en- | 遭遇する | 動詞 | 700

**etym_cent** (-cent, 100, Latin centum):
- percent | per- | パーセント | 名詞 | 600
- century | - | 世紀 | 名詞 | 600
- center | - | 中心 | 名詞 | 600
- central | - | 中央の | 形容詞 | 600
- concentration | con- | 集中 | 名詞 | 700

**etym_part** (-part, 部分/分ける, Latin partire):
- participate | - | 参加する | 動詞 | 600
- department | de- | 部門 | 名詞 | 600
- partner | - | パートナー | 名詞 | 600
- particular | - | 特定の | 形容詞 | 600
- partial | - | 部分的な | 形容詞 | 700

**etym_plain** (-plain, 平ら/明らか, Latin planus):
- explain | ex- | 説明する | 動詞 | 600
- complain | com- | 苦情を言う | 動詞 | 600
- plan | - | 計画 | 名詞 | 600
- plain | - | 明白な | 形容詞 | 600
- explanation | ex- | 説明 | 名詞 | 600

**etym_sent** (-sent, 感じる, Latin sentire):
- consent | con- | 同意する | 動詞 | 700
- present | pre- | 提示する | 動詞 | 600
- represent | re- | 代表する | 動詞 | 600
- sensitive | - | 敏感な | 形容詞 | 600
- essential | - | 必要不可欠な | 形容詞 | 600

**etym_alter** (-alter, 変える/他の, Latin alter):
- alternative | - | 代替の | 形容詞 | 600
- alter | - | 変更する | 動詞 | 700
- alteration | - | 変更 | 名詞 | 700
- alternate | - | 交互の | 形容詞 | 700
- unalterable | un- | 不変の | 形容詞 | 700

**etym_volv** (-volv, 回る/巻く, Latin volvere):
- involve | in- | 含む | 動詞 | 600
- revolve | re- | 回転する | 動詞 | 700
- evolve | e- | 進化する | 動詞 | 700
- revolution | re- | 革命 | 名詞 | 700
- volume | - | 量 | 名詞 | 600

**etym_dur** (-dur, 続く/硬い, Latin durare):
- during | - | ～の間 | 前置詞 | 600
- durable | - | 耐久性のある | 形容詞 | 700
- endure | en- | 耐える | 動詞 | 700
- duration | - | 期間 | 名詞 | 600
- procedure | pro- | 手続き | 名詞 | 600

Note: `during` has part_of_speech issue — use `"副詞"` or omit and replace with `"endurance"` (名詞, 600).

**etym_solve** (-solve, 解く/緩める, Latin solvere):
- resolve | re- | 解決する | 動詞 | 600
- dissolve | dis- | 溶解する | 動詞 | 700
- solution | - | 解決策 | 名詞 | 600
- absolute | ab- | 絶対的な | 形容詞 | 700
- resolution | re- | 決議 | 名詞 | 600

**etym_firm** (-firm, 強い/固い, Latin firmare):
- confirm | con- | 確認する | 動詞 | 600
- affirm | af- | 断言する | 動詞 | 700
- firm | - | 会社 | 名詞 | 600
- confirmation | con- | 確認 | 名詞 | 600
- reaffirm | re- | 再確認する | 動詞 | 700

**etym_turb** (-turb, 乱す, Latin turbare):
- disturb | dis- | 妨げる | 動詞 | 600
- turbulent | - | 激動の | 形容詞 | 700
- turbulence | - | 乱気流 | 名詞 | 700
- disturbance | dis- | 妨害 | 名詞 | 700
- perturb | per- | 動揺させる | 動詞 | 700

**etym_viv** (-viv, 生きる, Latin vivere):
- survive | sur- | 生き残る | 動詞 | 600
- vivid | - | 鮮明な | 形容詞 | 700
- vital | - | 不可欠な | 形容詞 | 600
- revive | re- | 復活させる | 動詞 | 700
- vitality | - | 活力 | 名詞 | 700

**etym_nat** (-nat, 生まれる, Latin nasci):
- nation | - | 国家 | 名詞 | 600
- nature | - | 自然 | 名詞 | 600
- natural | - | 自然の | 形容詞 | 600
- native | - | 現地の | 形容詞 | 600
- international | inter- | 国際的な | 形容詞 | 600

**etym_popul** (-popul, 人々, Latin populus):
- popular | - | 人気のある | 形容詞 | 600
- population | - | 人口 | 名詞 | 600
- public | - | 公共の | 形容詞 | 600
- publish | - | 出版する | 動詞 | 600
- republic | re- | 共和国 | 名詞 | 700

**etym_path** (-path, 感じる/苦しむ, Greek pathos):
- sympathy | sym- | 同情 | 名詞 | 700
- empathy | em- | 共感 | 名詞 | 700
- apathy | a- | 無関心 | 名詞 | 700
- pathetic | - | 哀れな | 形容詞 | 700
- pathology | - | 病理学 | 名詞 | 700

**etym_bio** (-bio, 生命, Greek bios):
- biography | - | 伝記 | 名詞 | 700
- biology | - | 生物学 | 名詞 | 600
- antibiotic | anti- | 抗生物質 | 名詞 | 700
- biochemistry | - | 生化学 | 名詞 | 700
- biodiversity | - | 生物多様性 | 名詞 | 700

**etym_spir** (-spir, 呼吸する, Latin spirare):
- inspire | in- | 鼓舞する | 動詞 | 600
- aspire | a- | 熱望する | 動詞 | 700
- expire | ex- | 期限が切れる | 動詞 | 600
- spirit | - | 精神 | 名詞 | 600
- conspire | con- | 共謀する | 動詞 | 700

**etym_simil** (-simil, 似た, Latin similis):
- similar | - | 類似した | 形容詞 | 600
- simultaneous | - | 同時の | 形容詞 | 700
- simulate | - | 模倣する | 動詞 | 700
- resemble | re- | 似ている | 動詞 | 700
- assimilate | as- | 同化する | 動詞 | 700

**etym_chron** (-chron, 時間, Greek chronos):
- chronic | - | 慢性の | 形容詞 | 700
- chronological | - | 年代順の | 形容詞 | 700
- synchronize | syn- | 同期する | 動詞 | 700
- chronicle | - | 年代記 | 名詞 | 700
- chronology | - | 年表 | 名詞 | 700

**etym_greg** (-greg, 群れ, Latin gregare):
- aggregate | ag- | 合計する | 動詞 | 700
- congregate | con- | 集まる | 動詞 | 700
- segregate | se- | 分離する | 動詞 | 700
- gregarious | - | 社交的な | 形容詞 | 700
- congregation | con- | 集会 | 名詞 | 700

**etym_cid** (-cid, 切る/決める, Latin caedere):
- decide | de- | 決定する | 動詞 | 600
- incident | in- | 出来事 | 名詞 | 600
- precise | pre- | 正確な | 形容詞 | 600
- concise | con- | 簡潔な | 形容詞 | 700
- accident | ac- | 事故 | 名詞 | 600

**etym_aud** (-aud, 聞く, Latin audire):
- audience | - | 聴衆 | 名詞 | 600
- audit | - | 監査 | 名詞 | 600
- auditorium | - | 講堂 | 名詞 | 700
- audio | - | 音声の | 形容詞 | 600
- audible | - | 聞き取れる | 形容詞 | 700

**etym_claim** (-claim, 叫ぶ, Latin clamare):
- claim | - | 主張する | 動詞 | 600
- exclaim | ex- | 叫ぶ | 動詞 | 700
- proclaim | pro- | 宣言する | 動詞 | 700
- reclaim | re- | 取り戻す | 動詞 | 700
- disclaim | dis- | 否認する | 動詞 | 700

**etym_crit** (-crit, 判断する, Greek krinein):
- criteria | - | 基準 | 名詞 | 600
- critical | - | 重要な | 形容詞 | 600
- crisis | - | 危機 | 名詞 | 600
- criticism | - | 批判 | 名詞 | 700
- criticize | - | 批判する | 動詞 | 700

**etym_cur** (-cur, 走る, Latin currere):
- occur | oc- | 起こる | 動詞 | 600
- current | - | 現在の | 形容詞 | 600
- concur | con- | 同意する | 動詞 | 700
- currency | - | 通貨 | 名詞 | 600
- recur | re- | 再発する | 動詞 | 700

**etym_fund** (-fund, 注ぐ/溶かす, Latin fundere):
- fund | - | 資金 | 名詞 | 600
- refund | re- | 返金する | 動詞 | 600
- foundation | - | 基礎 | 名詞 | 600
- fundamental | - | 基本的な | 形容詞 | 600
- confuse | con- | 混乱させる | 動詞 | 600

**etym_merg** (-merg, 沈む/浸す, Latin mergere):
- emerge | e- | 出現する | 動詞 | 600
- emergency | e- | 緊急事態 | 名詞 | 600
- merge | - | 合併する | 動詞 | 700
- immerse | im- | 没頭させる | 動詞 | 700
- submerge | sub- | 水没させる | 動詞 | 700

**etym_ped** (-ped, 足, Latin pedis):
- expedite | ex- | 促進する | 動詞 | 700
- pedestrian | - | 歩行者 | 名詞 | 700
- expedition | ex- | 探検 | 名詞 | 700
- impede | im- | 妨げる | 動詞 | 700
- impediment | im- | 障害 | 名詞 | 700

#### 4.4 Additional Words for Existing Etymology (etym_plic)

Add 5 words to `etym_plic` (currently has 5: apply, complicate, duplicate, imply, comply):
- supply | sup- | 供給する | 動詞 | 600
- employ | em- | 雇用する | 動詞 | 600
- display | dis- | 展示する | 動詞 | 600
- multiply | multi- | 増殖させる | 動詞 | 700
- reply | re- | 返信する | 動詞 | 600

All use `"etymology_id": "etym_plic"` and `"root": "-plic"`.

#### 4.5 Word Count Verification

| Source | Count |
|--------|-------|
| Existing words (unchanged) | 218 |
| New words for 62 new etymologies (5 each) | 310 |
| Additional words for etym_plic | 5 |
| **Total** | **533** |

This meets the 500+ requirement ✅

---

### Step 5: Run Tests

**Command**: `npx jest --config jest.config.js --no-watchman --passWithNoTests`

Verify ALL tests pass. Common failure points to check:
1. **Duplicate word IDs** — Search for `word_` conflicts where the same English word appears under different etymologies
2. **Missing etymology references** — Every `etymology_id` in words must exist in etymologies
3. **≥5 words per etymology** — Every etymology must have at least 5 words
4. **Free count ≤ 30** — Exactly 30 free etymologies
5. **Valid toeic_level** — Must be 300, 400, 500, 600, 700, or 800
6. **Valid part_of_speech** — Must be from the allowed list

### Step 6: Handle Edge Cases

**6.1 `during` problem**: The word "during" is a preposition, not in the valid part_of_speech list. Replace with `endurance` (名詞, 耐久力, toeic_level: 700) under `etym_dur`.

**6.2 Duplicate word risk**: Check these potential conflicts:
- `word_capture` may exist under both etym_cap and etym_tang → Use only under etym_cap
- `word_reply` may exist under both etym_plic and elsewhere → Check before adding
- `word_manuscript` already exists under etym_scrib → Do NOT add under etym_man

**6.3 JSON formatting**: Ensure valid JSON. Use consistent 2-space indentation matching existing files. No trailing commas.

---

## 3. Test Strategy

### 3.1 Existing Test File
**Path**: `src/data/__tests__/integrity.test.ts`

**No changes needed to the test file.** All existing tests must pass with the expanded data.

### 3.2 Test Verification Checklist

| Test Case | Expected After Changes |
|-----------|----------------------|
| 全単語が有効なetymology_idを持つ | PASS — all 533 words reference valid etymologies |
| 語源IDに重複がないこと | PASS — 100 unique IDs |
| 単語IDに重複がないこと | PASS — 533 unique IDs |
| 各語源が必須フィールドを全て持つ | PASS — all 9 fields populated |
| 語源IDが"etym_"プレフィックス | PASS — all start with "etym_" |
| sort_orderが正の整数 | PASS — all > 0 |
| 各単語が必須フィールドを持つ | PASS — id, etymology_id, word, root, root_meaning_ja, meaning_ja, part_of_speech, sort_order all present |
| 単語IDが"word_"プレフィックス | PASS — all start with "word_" |
| 品詞が有効な値 | PASS — all from valid list |
| toeic_levelが有効範囲 | PASS — all in [600, 700, 800] |
| derivativesが配列 | PASS — all have `[]` or populated arrays |
| 各語源に少なくとも5つの単語 | PASS — all etymologies have ≥ 5 words |
| Free語源が30個以下 | PASS — exactly 30 |
| Free語源が存在すること | PASS — 30 exist |

---

## 4. Edge Cases & Risks

### 4.1 Performance Risk
- **Estimated words.json size**: ~370 KB (currently 149 KB). This is well under 1 MB and acceptable for a bundled JSON.
- **Estimated etymologies.json size**: ~30 KB. Negligible.
- **Parse time**: JSON.parse of 370 KB is <10ms on modern devices. No concern.

### 4.2 Data Quality Risk
- Many new words use the "sparse" template (empty pronunciation, example, derivatives). This is consistent with the existing pattern where 42% of words are already sparse.
- Future tasks can backfill missing data incrementally.

### 4.3 Backward Compatibility Risk
- **Chapter reassignment**: Existing roots move from chapter 1→2 or chapter 2→3-10. If any user data references chapter numbers directly, this could break. However, the app references etymologies by `id`, not by `chapter`. Chapter is only used for display/filtering. This should be safe.
- **is_free changes**: 8 existing roots change from `is_free: false` (Ch2) to `is_free: false` (new chapters). No effective change — they remain paid.

### 4.4 Ordering of Implementation
Execute steps in this exact order:
1. Run tests (verify green baseline)
2. Create 600SCORE.MD
3. Verify APPSTORE.md
4. Modify etymologies.json (restructure chapters + add new roots)
5. Modify words.json (add new words + plic additions)
6. Run tests again (verify all pass)
7. If tests fail, debug using the error messages (test file logs which specific IDs fail)

### 4.5 Critical Gotchas
- **etym_nomin**: The word "economy" is mapped here but etymologically it's from Greek "oikonomia" (house + manage), NOT from "nomen". Replace "economy" with "rename" (動詞, 改名する, 700) or "anonymous" (形容詞, 匿名の, 700).
- **etym_dur**: Replace "during" (前置詞) with "endurance" (名詞, 耐久力, 700) as noted above.
- **Word ID collisions**: Before creating any new word, verify its ID doesn't already exist in the current 218 words. Specifically watch for: `word_attract` (exists), `word_distract` (exists), `word_subtract` (exists).
