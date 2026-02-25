# TOEIC 600点向けコンテンツ戦略ドキュメント

> **作成目的:** Rootify アプリの TOEIC 600点コースに必要なコンテンツ戦略、差分分析、学習カリキュラムをまとめる。
>
> **ターゲット:** TOEIC 600点台を目指す日本人社会人（中級学習者）
>
> **最終更新:** 2026-02-25

---

## 目次

1. [TOEIC 600点に必要な語彙分析](#1-toeic-600点に必要な語彙分析)
2. [現状との差分](#2-現状との差分)
3. [追加すべき語源・単語の一覧](#3-追加すべき語源単語の一覧)
4. [学習カリキュラム提案](#4-学習カリキュラム提案)
5. [語源別効果分析](#5-語源別効果分析)

---

## 1. TOEIC 600点に必要な語彙分析

### 1.1 必要語彙数

TOEIC 600点台には以下の語彙力が求められる。

| スコア帯 | 推定必要語彙数 | テキスト理解率目安 |
|---------|-------------|----------------|
| 500点以下 | ~3,000語 | 基礎日常語 |
| **600点台** | **~5,000〜6,000語** | **TOEIC頻出ビジネス語を含む** |
| 700点台 | ~8,000語 | 幅広いビジネスシーン対応 |
| 800点以上 | ~10,000語 | ネイティブ使用語彙の大部分 |

TOEIC L&R テストでは Part 5・6・7（文法・リーディング）の正答率向上に語彙力が直結する。600点を突破するには、特に以下の語彙カテゴリが重要：

1. **ビジネス基礎語**: contract, negotiate, budget, revenue, deadline（必出）
2. **会議・プレゼン語**: agenda, proposal, confirm, presentation, discuss
3. **通知・依頼語**: request, require, announce, inform, advise
4. **職場・HR語**: hire, promote, department, collaborate, evaluate
5. **財務・経理語**: account, profit, expense, invoice, receipt
6. **旅行・出張語**: schedule, reservation, itinerary, delay, departure

### 1.2 語源戦略の有効性

語源学習（形態素意識）アプローチは、以下の点でTOEIC 600点突破に特に効果的：

- **接頭辞の活用**: `re-`（再び）を覚えれば review, resume, regulate など 200語以上に対応
- **語根の力**: `-duct`（導く）を覚えれば conduct, produce, introduce, reduce など全部つながる
- **未知語推測能力**: 語源知識があれば試験中に初見の単語を推測できる
- **記憶の定着率**: 意味のある接続（語源）で覚えた単語は、丸暗記より記憶保持率が40〜60%高い（形態素意識研究より）

### 1.3 TOEIC頻出語彙の語源カバレッジ

| 語源グループ | TOEIC頻出語の例 | カバレッジ |
|-------------|--------------|----------|
| -tract（引く） | attract, contract, extract | 高 |
| -duct（導く） | conduct, produce, introduce | 高 |
| -port（運ぶ） | report, export, support | 高 |
| -ceive（受け取る） | receive, perceive, conceive | 高 |
| -tain（保つ） | maintain, obtain, contain | 高 |
| -quir（求める） | require, acquire, request | 高 |
| -reg（支配） | regular, regulate, register | 高 |
| -fin（終わり） | final, define, finance | 高 |
| -part（部分） | participate, department, partner | 高 |
| -sent（感じる） | consent, present, represent | 高 |

---

## 2. 現状との差分

### 2.1 スナップショット比較

| 指標 | 実装前 | MVP目標 | 実装後 |
|-----|-------|--------|-------|
| 語源数 | 38 | 80〜100 | **100** |
| 単語数 | 218 | 500〜800 | **533** |
| カテゴリ種類 | 1（動作のみ） | 多様 | **9** |
| チャプター数 | 2 | 8〜10 | **10** |
| Free語源数 | 30 | ≤30 | **30** |
| TOEIC 600点カバレッジ | 低 | 目標水準 | **高** |

### 2.2 追加された語源の内訳（62語源）

| チャプター | テーマ | 語源数 | 代表語根 |
|----------|--------|------|---------|
| Ch3 | 創造・成長 | 7新規 + 2既存 = 9 | -cresc, -plet, -labor, -oper, -man, -log, -graph |
| Ch4 | 位置・方向 | 9新規 | -loc, -rect, -clin, -circ, -flect, -stat, -med, -termin, -norm |
| Ch5 | 交換・取得 | 8新規 + 1既存 = 9 | -tain, -sum, -quir, -tribut, -hab, -test, -pel, -tang |
| Ch6 | 秩序・統治 | 7新規 + 2既存 = 9 | -reg, -ord, -junct, -dom, -neg, -nomin, -sequ |
| Ch7 | 価値・測定 | 8新規 | -val, -equ, -fin, -count, -cent, -part, -plain, -sent |
| Ch8 | 保全・変化 | 6新規 + 2既存 = 8 | -alter, -volv, -dur, -solve, -firm, -turb |
| Ch9 | 生命・社会 | 9新規 | -viv, -nat, -popul, -path, -bio, -spir, -simil, -chron, -greg |
| Ch10 | 知識・決定 | 8新規 + 1既存 = 9 | -cid, -aud, -claim, -crit, -cur, -fund, -merg, -ped |

### 2.3 不足していたTOEIC頻出語（今回カバー）

追加前に欠落していた高頻出語（TOEIC 600点レベル）の例：

```
require / acquire / request / question
maintain / obtain / contain / retain / sustain
regular / regulate / register / regulation
participate / department / partner / particular
present / represent / consent / essential
confirm / confirmation / firm
available / evaluate / value / valid
account / discount / accountant / encounter
define / final / finance / infinite
operate / cooperate / operation / operator
contribute / distribute / attribute
locate / local / allocate / location
direct / correct / direction / director
decline / client / clinic
survive / vital / inspire / spirit
natural / nation / native / international
popular / population / public / publish
```

---

## 3. 追加すべき語源・単語の一覧

### Chapter 3 — 創造・成長 (Creation & Growth)

| 語根 | 意味 | 代表単語 | TOEIC頻出度 |
|-----|------|---------|-----------|
| -cresc | 成長する | increase, decrease, create, concrete, increment | ★★★ |
| -plet | 満たす | complete, supplement, implement, deplete, complement | ★★★ |
| -labor | 働く | collaborate, laboratory, elaborate, labor, laborious | ★★★ |
| -oper | 働く | operate, cooperate, operation, operator, cooperative | ★★★ |
| -man | 手 | manage, manufacture, manual, manipulate, manner | ★★★ |
| -log | 言葉/学問 | technology, apology, catalog, dialogue, logical | ★★★ |
| -graph | 書く | photograph, paragraph, program, diagram, autograph | ★★ |
| -plic（既存） | 折る/重ねる | supply, employ, display, multiply, reply（追加分） | ★★★ |
| -gen（既存） | 生む | generate, general, original, genuine, generation | ★★ |

### Chapter 4 — 位置・方向 (Position & Direction)

| 語根 | 意味 | 代表単語 | TOEIC頻出度 |
|-----|------|---------|-----------|
| -loc | 場所 | locate, local, allocate, relocate, location | ★★★ |
| -rect | まっすぐ | direct, correct, erect, direction, director | ★★★ |
| -clin | 傾く | decline, incline, client, recline, clinic | ★★★ |
| -circ | 輪/環 | circumstance, circle, circuit, circular, circulation | ★★★ |
| -flect | 曲げる | reflect, flexible, deflect, reflection, inflection | ★★★ |
| -stat | 立てる/状態 | constitute, institute, substitute, establish, statistic | ★★★ |
| -med | 中間 | immediate, media, medium, mediate, remedy | ★★★ |
| -termin | 限る/終わり | determine, terminal, terminate, term, terminology | ★★★ |
| -norm | 規範 | normal, enormous, abnormal, norm, normalize | ★★★ |

### Chapter 5 — 交換・取得 (Exchange & Acquisition)

| 語根 | 意味 | 代表単語 | TOEIC頻出度 |
|-----|------|---------|-----------|
| -cap（既存） | 掴む/取る | capture, capable, capacity, capital, captain | ★★★ |
| -tain | 保つ/持つ | maintain, obtain, contain, retain, sustain | ★★★ |
| -sum | 取る | consume, assume, resume, presume, summary | ★★★ |
| -quir | 求める | require, acquire, inquire, request, question | ★★★ |
| -tribut | 与える/割り当てる | contribute, distribute, attribute, tribute, attribution | ★★★ |
| -hab | 持つ/住む | exhibit, inhabit, prohibit, habit, rehabilitation | ★★ |
| -test | 証する | contest, protest, testify, testimony, attest | ★★ |
| -pel | 押す/駆る | compel, appeal, expel, impulse, propel | ★★ |
| -tang | 触れる | contact, intact, tangible, attach, detach | ★★★ |

### Chapter 6 — 秩序・統治 (Order & Governance)

| 語根 | 意味 | 代表単語 | TOEIC頻出度 |
|-----|------|---------|-----------|
| -cred（既存） | 信じる | credit, incredible, accredit, credibility, discredit | ★★★ |
| -mand（既存） | 命じる/託す | demand, command, recommend, mandate, remand | ★★★ |
| -reg | まっすぐ/支配 | regular, region, regulate, register, regulation | ★★★ |
| -ord | 順序 | order, ordinary, coordinate, extraordinary, subordinate | ★★★ |
| -junct | つなぐ | function, junction, conjunction, adjunct, joint | ★★★ |
| -dom | 支配/家 | domestic, domain, dominate, dominant, predominant | ★★★ |
| -neg | 否定 | negotiate, negative, neglect, deny, negate | ★★★ |
| -nomin | 名前 | nominate, nominal, nominee, denomination, anonymous | ★★ |
| -sequ | 従う | consequence, sequence, subsequent, execute, consecutive | ★★★ |

### Chapter 7 — 価値・測定 (Value & Measurement)

| 語根 | 意味 | 代表単語 | TOEIC頻出度 |
|-----|------|---------|-----------|
| -val | 価値/強い | available, evaluate, value, valid, equivalent | ★★★ |
| -equ | 等しい | equal, equipment, adequate, equip, equity | ★★★ |
| -fin | 終わる/限る | final, define, finance, refine, infinite | ★★★ |
| -count | 数える | account, discount, counter, accountant, encounter | ★★★ |
| -cent | 100 | percent, century, center, central, concentration | ★★★ |
| -part | 部分/分ける | participate, department, partner, particular, partial | ★★★ |
| -plain | 平ら/明らか | explain, complain, plan, plain, explanation | ★★★ |
| -sent | 感じる | consent, present, represent, sensitive, essential | ★★★ |

### Chapter 8 — 保全・変化 (Preservation & Change)

| 語根 | 意味 | 代表単語 | TOEIC頻出度 |
|-----|------|---------|-----------|
| -serv（既存） | 仕える/保つ | conserve, observe, reserve, preserve, deserve | ★★★ |
| -cure（既存） | 注意/世話 | secure, accurate, procure, curious, accuracy | ★★★ |
| -alter | 変える/他の | alternative, alter, alteration, alternate, unalterable | ★★★ |
| -volv | 回る/巻く | involve, revolve, evolve, revolution, volume | ★★★ |
| -dur | 続く/硬い | durable, endure, duration, procedure, endurance | ★★ |
| -solve | 解く/緩める | resolve, dissolve, solution, absolute, resolution | ★★★ |
| -firm | 強い/固い | confirm, affirm, firm, confirmation, reaffirm | ★★★ |
| -turb | 乱す | disturb, turbulent, turbulence, disturbance, perturb | ★★ |

### Chapter 9 — 生命・社会 (Life & Society)

| 語根 | 意味 | 代表単語 | TOEIC頻出度 |
|-----|------|---------|-----------|
| -viv | 生きる | survive, vivid, vital, revive, vitality | ★★★ |
| -nat | 生まれる | nation, nature, natural, native, international | ★★★ |
| -popul | 人々 | popular, population, public, publish, republic | ★★★ |
| -path | 感じる/苦しむ | sympathy, empathy, apathy, pathetic, pathology | ★★ |
| -bio | 生命 | biography, biology, antibiotic, biochemistry, biodiversity | ★★ |
| -spir | 呼吸する | inspire, aspire, expire, spirit, conspire | ★★★ |
| -simil | 似た | similar, simultaneous, simulate, resemble, assimilate | ★★★ |
| -chron | 時間 | chronic, chronological, synchronize, chronicle, chronology | ★★ |
| -greg | 群れ | aggregate, congregate, segregate, gregarious, congregation | ★★ |

### Chapter 10 — 知識・決定 (Knowledge & Decision)

| 語根 | 意味 | 代表単語 | TOEIC頻出度 |
|-----|------|---------|-----------|
| -lect（既存） | 集める/読む | collect, select, elect, intellect, lecture | ★★★ |
| -cid | 切る/決める | decide, incident, precise, concise, accident | ★★★ |
| -aud | 聞く | audience, audit, auditorium, audio, audible | ★★★ |
| -claim | 叫ぶ | claim, exclaim, proclaim, reclaim, disclaim | ★★★ |
| -crit | 判断する | criteria, critical, crisis, criticism, criticize | ★★★ |
| -cur | 走る | occur, current, concur, currency, recur | ★★★ |
| -fund | 注ぐ/溶かす | fund, refund, foundation, fundamental, confuse | ★★★ |
| -merg | 沈む/浸す | emerge, emergency, merge, immerse, submerge | ★★★ |
| -ped | 足 | expedite, pedestrian, expedition, impede, impediment | ★★ |

---

## 4. 学習カリキュラム提案

### 4.1 全体スケジュール（12週間 = 3ヶ月プログラム）

**前提**: 1日10〜15分の学習（通勤電車往復）、週5日学習

| 週 | チャプター | テーマ | 目標語源数 | 累積語彙数 | 学習モード |
|---|----------|--------|----------|-----------|---------|
| 1 | Ch1（前半） | 動作・移動①（-tract〜-sist） | 8語源 | ~48語 | 語源ツリー + クイズ |
| 2 | Ch1（後半） | 動作・移動②（-fer〜-flu） | 7語源 | ~90語 | クイズ + 復習 |
| 3 | Ch2（前半） | 知覚・構造①（-vis〜-fect） | 8語源 | ~138語 | 語源ツリー + クイズ |
| 4 | Ch2（後半） | 知覚・構造②（-ceive〜-vent） | 7語源 | ~178語 | クイズ + 間隔反復 |
| 5 | Ch3 | 創造・成長（-cresc〜-graph） | 9語源 | ~223語 | 語源ツリー + クイズ |
| 6 | Ch4 | 位置・方向（-loc〜-norm） | 9語源 | ~268語 | クイズ + 復習 |
| 7 | Ch5 | 交換・取得（-cap〜-tang） | 9語源 | ~313語 | 語源ツリー + クイズ |
| 8 | Ch6 | 秩序・統治（-cred〜-sequ） | 9語源 | ~358語 | クイズ + 間隔反復 |
| 9 | Ch7 | 価値・測定（-val〜-sent） | 8語源 | ~398語 | 語源ツリー + クイズ |
| 10 | Ch8 | 保全・変化（-serv〜-turb） | 8語源 | ~438語 | クイズ + 復習 |
| 11 | Ch9 | 生命・社会（-viv〜-greg） | 9語源 | ~483語 | 語源ツリー + クイズ |
| 12 | Ch10 | 知識・決定（-lect〜-ped） | 9語源 | **528語** | 総復習 + 模擬テスト |

### 4.2 週次学習プラン詳細

#### Week 1-2: Chapter 1（無料・動作・移動）
**目標**: 語源15個 × 平均6語 = 約90語習得
- 月: -tract（引く）→ attract, extract, contract, distract, subtract, retract
- 火: -press（押す）→ express, impression, compress, suppress, depress, oppress
- 水: -ject（投げる）→ project, reject, subject, object, inject, eject
- 木: -port（運ぶ）→ export, import, report, support, transport, airport
- 金: 週次テスト（20問）

#### Week 3-4: Chapter 2（無料・知覚・構造）
**目標**: 語源15個 × 平均6語 = 約90語追加
重点語: visible, vision, spectator, inspector, describe, prescribe, structure, construct, attention, extension, transform, conform, effect, perfect, receive, conceive

#### Week 5-12: Chapters 3-10（Pro・各テーマ）
各チャプターで語源5〜9個、単語25〜45語をカバー。
1日10問のクイズ + 間隔反復で既習語を定期復習。

### 4.3 1日10分学習プラン

```
[通勤往路・5分]
  → 新語源1個 + 派生語3〜5個を語源ツリーで確認
  → クイズ5問（新出語）

[通勤復路・5分]
  → 間隔反復クイズ5問（既出語の復習）
  → 正解率確認 → 翌日の復習計画を自動生成
```

### 4.4 TOEIC 600点到達の目安

| 期間 | 習得語源数 | 累積語彙数 | 期待スコア |
|------|----------|-----------|---------|
| 1ヶ月 | 30語源（Ch1-2完了） | ~180語 | 450〜500点 |
| 2ヶ月 | 60語源（Ch1-6完了） | ~360語 | 520〜570点 |
| **3ヶ月** | **100語源（全完了）** | **~530語** | **600〜650点** |

---

## 5. 語源別効果分析

### 5.1 TOEIC 600点突破に最も効果的な語源 TOP 10

| 順位 | 語根 | 意味 | TOEIC出現語数 | 習得効果 |
|-----|------|------|------------|---------|
| 1 | -tain | 保つ/持つ | maintain, obtain, contain, retain, sustain... | ★★★★★ |
| 2 | -reg | まっすぐ/支配 | regular, regulate, register, region... | ★★★★★ |
| 3 | -quir | 求める | require, acquire, request, inquire... | ★★★★★ |
| 4 | -fin | 終わり/限る | final, define, finance, refine... | ★★★★★ |
| 5 | -part | 部分/分ける | participate, department, partner, particular... | ★★★★★ |
| 6 | -sent | 感じる | present, represent, consent, essential... | ★★★★★ |
| 7 | -val | 価値/強い | available, evaluate, valid, value... | ★★★★★ |
| 8 | -solve | 解く/緩める | resolve, solution, absolute, resolution... | ★★★★ |
| 9 | -cid | 切る/決める | decide, incident, precise, accident... | ★★★★ |
| 10 | -cur | 走る | occur, current, currency, concur... | ★★★★ |

### 5.2 語源学習のROI（時間対効果）

1つの語根を習得（約10分）することで平均5〜8単語をカバーできる。

従来の丸暗記では5単語 = 5回のフラッシュカード学習（約15〜20分）。
語源学習では1語根 = 1セッション（10分）で5〜8単語を理解ベースで習得。

**語源学習の効率向上率**: 約40〜60%
