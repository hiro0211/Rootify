const fs = require('fs');
const path = require('path');

const CONTENTS_PATH = path.join(__dirname, '../documents/contents.md');
const ETYMOLOGY_JSON_PATH = path.join(__dirname, '../src/data/etymologies.json');
const WORDS_JSON_PATH = path.join(__dirname, '../src/data/words.json');

const content = fs.readFileSync(CONTENTS_PATH, 'utf-8');
const existingEtymologies = JSON.parse(fs.readFileSync(ETYMOLOGY_JSON_PATH, 'utf-8'));
const existingWords = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf-8'));

// Parse Helper Functions
function parseTable(markdown, headerStart) {
  const lines = markdown.split('\n');
  const startIndex = lines.findIndex(line => line.includes(headerStart));
  if (startIndex === -1) return [];

  const tableData = [];
  let i = startIndex + 1;
  // Skip separator line if exists (starts with |--)
  if (lines[i] && lines[i].trim().startsWith('|')) i++; // header
  if (lines[i] && lines[i].trim().startsWith('|')) i++; // separator, but content.md uses tab separated or space separated?
  // Check format. contents.md seems to use tab or space separated lines for lists, but "TOEIC頻出単語と語源の対応表" looks like a table but printed as text lines in the view_file output.
  // The view_file output shows:
  // 397: 英単語	品詞	日本語意味	接頭辞	語根	接尾辞	語源ロジック	TOEIC頻出度
  // 398: project	動詞/名詞	計画する/映し出す	pro	ject	-	前に投げる → 計画する、映し出す	★★★
  // It seems tab-separated or aligned space.
  
  // Let's assume tab separated based on line 397.
  
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('Tier') || line.startsWith('カタカナ語')) break; // End of table
    const columns = line.split('\t');
    if (columns.length < 5) continue; 
    tableData.push(columns);
  }
  return tableData;
}

function parseRootSummary(markdown) {
  const lines = markdown.split('\n');
  const startIndex = lines.findIndex(line => line.includes('語根サマリー'));
  const roots = [];
  if (startIndex === -1) return roots;

  // Header: 語根	コア意味	語源	派生語数	Tier
  let i = startIndex + 2; // Skip header
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('接尾辞リスト')) break;
    const cols = line.split('\t');
    if (cols.length < 5) continue;
    roots.push({
      root: cols[0],
      core_meaning: cols[1],
      origin: cols[2],
      count: cols[3],
      tier: cols[4]
    });
  }
  return roots;
}

function parsePrefixList(markdown) {
    const lines = markdown.split('\n');
    const startIndex = lines.findIndex(line => line.includes('接頭辞リスト'));
    const prefixes = [];
    if (startIndex === -1) return prefixes;
  
    // Header: prefix	core_meaning	language	variants	tier
    let i = startIndex + 2; // Skip header
    for (; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('語根サマリー')) break;
      const cols = line.split('\t');
      if (cols.length < 5) continue;
      prefixes.push({
        prefix: cols[0].replace(/-$/, ''), // remove trailing dash
        meaning: cols[1],
        tier: cols[4]
      });
    }
    return prefixes;
}

function parseSuffixList(markdown) {
    const lines = markdown.split('\n');
    const startIndex = lines.findIndex(line => line.includes('接尾辞リスト'));
    const suffixes = [];
    if (startIndex === -1) return suffixes;
    let i = startIndex + 2; 
    for (; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('語源ツリー')) break;
        const cols = line.split('\t');
        if (cols.length < 4) continue;
        suffixes.push({
            suffix: cols[0],
            meaning: cols[2]
        });
    }
    return suffixes;
}

// Data Processing
const rootsData = parseRootSummary(content);
const wordsTable = parseTable(content, 'TOEIC頻出単語と語源の対応表');
const suffixData = parseSuffixList(content);
const prefixData = parsePrefixList(content);

// Update Etymologies
const newEtymologies = [...existingEtymologies];

rootsData.forEach(r => {
    // r.root might be "duct/duce"
    // We should normalize or handle primary root name.
    // Existing data uses "etym_tract" for "-tract".
    // Let's use the first part of "duct/duce" -> "duct" as the ID base? Or keep "duct"
    // "duct/duce" -> root name in file is "duct/duce"?
    // If json uses "etym_duct", we should match.
    // Let's check if we can find an existing one.
    
    // The existing "root" field in etymologies.json is like "-tract".
    // r.root is "duct/duce".
    
    // We'll split by '/' and check if any match.
    const rootVariants = r.root.split('/');
    const mainRoot = rootVariants[0];
    const id = `etym_${mainRoot}`;
    
    const existingIndex = newEtymologies.findIndex(e => e.id === id);
    const chapter = r.tier === 'Tier1' ? 1 : r.tier === 'Tier2' ? 2 : 3;
    const is_free = r.tier === 'Tier1';
    
    const etymData = {
        id,
        root: `-${mainRoot}`, // Standardize with hyphen? Existing has hyphen.
        root_meaning: 'to ' + r.core_meaning, // Rough guess or leave blank?
        root_meaning_ja: r.core_meaning,
        category: '動作', // Default or logic needed?
        chapter,
        is_free,
        sort_order: existingIndex !== -1 ? newEtymologies[existingIndex].sort_order : newEtymologies.length + 1,
        description_ja: `「${r.core_meaning}」を意味する${r.origin}に由来。`
    };

    if (existingIndex !== -1) {
        // Merge
        newEtymologies[existingIndex] = { ...newEtymologies[existingIndex], ...etymData };
    } else {
        newEtymologies.push(etymData);
    }
});

// Update Words
const newWords = [...existingWords];

wordsTable.forEach(row => {
    // 0:project 1:動詞/名詞 2:計画する/映し出す 3:pro 4:ject 5:- 6:前に投げる → 計画する、映し出す 7:★★★
    const wordStr = row[0];
    const pos = row[1];
    const meaning = row[2];
    const prefix = row[3] !== '-' ? row[3] + '-' : '';
    const root = row[4];
    const suffix = row[5] !== '-' ? row[5] : '';
    const logic = row[6];
    const stars = row[7];
    
    const id = `word_${wordStr}`;
    const etymology_id = `etym_${root.split('/')[0]}`; // assuming root matches etymology root
    
    const existingIndex = newWords.findIndex(w => w.id === id);
    const existingWord = existingIndex !== -1 ? newWords[existingIndex] : {};
    
    const toeic_level = stars === '★★★' ? 800 : stars === '★★' ? 700 : 600;
    
    const wordData = {
        id,
        etymology_id,
        word: wordStr,
        pronunciation: existingWord.pronunciation || '',
        prefix,
        prefix_meaning: prefixData.find(p => p.prefix === row[3])?.meaning || '',
        prefix_meaning_en: '', // Need manual or look up
        root: `-${root}`,
        root_meaning_ja: rootsData.find(r => r.root === root || r.root.includes(root))?.core_meaning || '',
        suffix,
        suffix_meaning: suffixData.find(s => s.suffix.includes(row[5]))?.meaning || '',
        combined_meaning: logic.split('→')[0].trim(),
        meaning_ja: meaning.split('/')[0], // Take primary
        meaning_sub_ja: meaning.split('/')[1] || '',
        part_of_speech: pos.split('/')[0], // Take primary
        derivatives: existingWord.derivatives || [],
        example_en: existingWord.example_en || '',
        example_ja: existingWord.example_ja || '',
        toeic_level,
        sort_order: existingIndex !== -1 ? existingWord.sort_order : newWords.length + 1
    };

    if (existingIndex !== -1) {
        newWords[existingIndex] = { ...existingWord, ...wordData };
    } else {
        newWords.push(wordData);
    }
});

// Write structure check (optional)
console.log(`Etymologies: ${newEtymologies.length}`);
console.log(`Words: ${newWords.length}`);

fs.writeFileSync(ETYMOLOGY_JSON_PATH, JSON.stringify(newEtymologies, null, 2));
fs.writeFileSync(WORDS_JSON_PATH, JSON.stringify(newWords, null, 2));
