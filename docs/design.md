
# 設計


## 概要

単語データを AI で生成する英単語帳


## 機能

- 英単語の登録
  - 綴り間違いの自動修正提案
  - 複数形や過去形などの活用形を入力した場合でも原型をベースにデータを登録
- 豊富な単語情報
  - 発音記号、品詞、活用形など
- 合わせて覚えるべき単語を自動で網羅
  - 意味の似ている語、対となる語など
- ケース別の例文も登録
  - 日常会話（もっとも基本的な使い方）
  - ゲームプレイ中によく使われる場合、その中で使う表現
  - プログラミング関連など IT 分野でよく使用される場合、その中で使う表現


## データ構造

[scheme.prisma](../prisma/schema.prisma) を参照


## データ生成フロー

1. ユーザーが単語を入力
  - 存在しない単語の場合、綴り間違いの可能性を考慮
    - 綴り間違い（hello/hallo）の可能性があれば正しい単語の候補を提示
    - 綴り間違いの可能性がない、または正しい単語の候補を拒否した場合は終了
2. 単語データ（Word）を生成
3. 例文データ（Example）を生成
   - slot=1: 日常（文脈により意味が大きく変わる場合はいくつか生成
   - slot=2: ゲーム（ない場合は生成しない）
   - slot=3: プログラミング（ない場合は生成しない）
4. 類義語があれば類義語データ（SynonymGroup, SynonymGroupEntry）を生成
5. 対義語があれば対義語データ（AntonymGroup, AntonymGroupEntry）を生成
6. 生成したデータを DB へ登録


## データ生成例

### run

#### Word

動詞のため、過去形なども網羅する

```json
{
  headword: 'run',
  pronunciation: 'rʌn',
  pos: '動詞',
  definition: '走る、逃げる、動作する、実行する',
  past: 'ran',
  past_participle: 'run',
  present_participle: 'running',
  third_person_singular: 'runs',
}
```

#### Example

ゲーム、プログラミングどちらの文脈でも頻繁に使用されるため、それらの例文を生成する

```json
// 最も一般的な使い方（単純に、"走る" こと）
{
  slot: 1,
  sentence_en: 'I run every morning',
  sentence_ja: '私は毎朝走る',
},
// ゲームならではの使い方（"逃げろ" というニュアンス）
{
  slot: 2,
  sentence_en: 'Run!',
  sentence_ja: '逃げろ！',
},
// プログラミング特有の使い方（"プログラムの実行" という意味）
{
  slot: 3,
  sentence_en: 'I ran the script again',
  sentence_ja: '私はスクリプトを再実行した',
}
```

#### SynonymGroup / SynonymGroupEntry

走ることを表す語は run 以外にとくにないため、類義語の生成は不要

#### AntonymGroup / AntonymGroupEntry

stop と対になって使われがちなため、その情報を生成する

```json
{
  title: '動作と停止',
  description: '動き続ける状態と止まる状態の対比',
  entries: {
    createMany: {
      data: [
        {
          word: 'run',
          pos: '動詞',
          description: '動作している状態',
          sentence_en: 'The program is running',
          sentence_ja: 'プログラムの実行中',
          order: 1,
        },
        {
          word: 'stop',
          pos: '動詞',
          description: '動作をやめる状態',
          sentence_en: 'The program suddenly stopped',
          sentence_ja: 'プログラムが突然停止した',
          order: 2,
        },
      ],
    },
  },
},
```

### look

#### Word

run と同じように生成

#### Example

ゲームやプログラミング特有の用法はないため一般例文のみ生成
ただし look は文脈によって意味が大きく異なるため、日常会話例文（スロット 1）を複数生成する

```json
// 最も基本的な "見る" という意味
{
  slot: 1,
  sentence_en: 'Look at that!',
  sentence_ja: 'あれ見て！',
}
// "探す" を表現するケース
{
  slot: 1,
  sentence_en: 'I'm looking for my keys',
  sentence_ja: '鍵を探している',
}
// "～に見える" を表現するケース
{
  slot: 1,
  sentence_en: 'You look happy',
  sentence_ja: '君は幸せそうに見える',
}
```

#### SynonymGroup / SynonymGroupEntry

「～にみえる」という表現に使う単語は複数あるため、類義語として合わせて登録

```json
{
  title: '〜にみえるを表す語',
  description: '見え方の違いによって使い分ける語',
  entries: {
    createMany: {
      data: [
        {
          word: 'look',
          pos: '動詞',
          description: '客観的にそう見える',
          sentence_en: 'She looks cute',
          sentence_ja: '彼女はかわいく見える',
          order: 1,
        },
        {
          word: 'appear',
          pos: '動詞',
          description: '一見そう見えるが実際は不明',
          sentence_en: 'She appears to be rich',
          sentence_ja: '彼女はお金持ちに見える',
          order: 2,
        },
        {
          word: 'seem',
          pos: '動詞',
          description: '話し手の主観としてそう見える',
          sentence_en: 'She seems to have a lot of fun',
          sentence_ja: '彼女はとても楽しんでいるように見える',
          order: 3,
        },
      ],
    },
  },
}
```

#### AntonymGroup / AntonymGroupEntry

対義語やセットで使われがちな対になる表現は特にないため生成しない
