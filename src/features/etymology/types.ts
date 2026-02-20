export interface Etymology {
  id: string;
  root: string;
  root_meaning: string;
  root_meaning_ja: string;
  category: string;
  chapter: number;
  is_free: boolean;
  sort_order: number;
  description_ja: string;
}

export interface Word {
  id: string;
  etymology_id: string;
  word: string;
  pronunciation: string;
  prefix: string;
  prefix_meaning: string;
  prefix_meaning_en: string; // "out"
  root: string;
  root_meaning_ja: string;
  suffix: string;
  suffix_meaning: string;
  combined_meaning: string;
  meaning_ja: string; // Main meaning
  meaning_sub_ja: string;
  part_of_speech: string;
  derivatives: Derivative[];
  example_en: string;
  example_ja: string;
  toeic_level: number;
  sort_order: number;
}

export interface Derivative {
  word: string;
  pos: string;
  meaning: string;
}

export interface EtymologyWithWords extends Etymology {
  words: Word[];
}
