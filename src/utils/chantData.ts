import type { ChantLine, TableNumber } from '../types/game'

// 81 Cantonese multiplication chant lines (traditional 九因歌)
// Format follows the standard 九因歌 table: [table][multiplier][connective][result]
// Special connectives: 如 (jyu4), 得 (dak1), 歸 (gwai1), 中 (zung1)
// Table 9: 9 lines, Table 8: 8 lines, ... Table 1: 1 line
export const chantData: ChantLine[] = [
  // Table 9 (9 lines)
  { table: 9, multiplier: 1, cantonese: '九一如九', pinyin: 'gau2 jat1 jyu4 gau2', toneMarks: '9²1¹如¹9²', result: 9 },
  { table: 9, multiplier: 2, cantonese: '九二一十八', pinyin: 'gau2 ji6 jat1 sap6 baat3', toneMarks: '9²2⁶1¹10⁶8³', result: 18 },
  { table: 9, multiplier: 3, cantonese: '九三二十七', pinyin: 'gau2 saam1 ji6 sap6 cat1', toneMarks: '9²3¹2⁶10⁶7¹', result: 27 },
  { table: 9, multiplier: 4, cantonese: '九四三十六', pinyin: 'gau2 sei3 saam1 sap6 luk6', toneMarks: '9²4³3¹10⁶6⁶', result: 36 },
  { table: 9, multiplier: 5, cantonese: '九五四十五', pinyin: 'gau2 ng5 sei3 sap6 ng5', toneMarks: '9²5⁵4³10⁶5⁵', result: 45 },
  { table: 9, multiplier: 6, cantonese: '九六五十四', pinyin: 'gau2 luk6 ng5 sap6 sei3', toneMarks: '9²6⁶5⁵10⁶4³', result: 54 },
  { table: 9, multiplier: 7, cantonese: '九七六十三', pinyin: 'gau2 cat1 luk6 sap6 saam1', toneMarks: '9²7¹6⁶10⁶3¹', result: 63 },
  { table: 9, multiplier: 8, cantonese: '九八七十二', pinyin: 'gau2 baat3 cat1 sap6 ji6', toneMarks: '9²8³7¹10⁶2⁶', result: 72 },
  { table: 9, multiplier: 9, cantonese: '九九八十一', pinyin: 'gau2 gau2 baat3 sap6 jat1', toneMarks: '9²9²8³10⁶1¹', result: 81 },

  // Table 8 (8 lines)
  { table: 8, multiplier: 1, cantonese: '八一如八', pinyin: 'baat3 jat1 jyu4 baat3', toneMarks: '8³1¹如¹8³', result: 8 },
  { table: 8, multiplier: 2, cantonese: '八二一十六', pinyin: 'baat3 ji6 jat1 sap6 luk6', toneMarks: '8³2⁶1¹10⁶6⁶', result: 16 },
  { table: 8, multiplier: 3, cantonese: '八三二十四', pinyin: 'baat3 saam1 ji6 sap6 sei3', toneMarks: '8³3¹2⁶10⁶4³', result: 24 },
  { table: 8, multiplier: 4, cantonese: '八四三十二', pinyin: 'baat3 sei3 saam1 sap6 ji6', toneMarks: '8³4³3¹10⁶2⁶', result: 32 },
  { table: 8, multiplier: 5, cantonese: '八五中四十', pinyin: 'baat3 ng5 zung1 sei3 sap6', toneMarks: '8³5⁵中¹4³10⁶', result: 40 },
  { table: 8, multiplier: 6, cantonese: '八六四十八', pinyin: 'baat3 luk6 sei3 sap6 baat3', toneMarks: '8³6⁶4³10⁶8³', result: 48 },
  { table: 8, multiplier: 7, cantonese: '八七五十六', pinyin: 'baat3 cat1 ng5 sap6 luk6', toneMarks: '8³7¹5⁵10⁶6⁶', result: 56 },
  { table: 8, multiplier: 8, cantonese: '八八六十四', pinyin: 'baat3 baat3 luk6 sap6 sei3', toneMarks: '8³8³6⁶10⁶4³', result: 64 },

  // Table 7 (7 lines)
  { table: 7, multiplier: 1, cantonese: '七一如七', pinyin: 'cat1 jat1 jyu4 cat1', toneMarks: '7¹1¹如¹7¹', result: 7 },
  { table: 7, multiplier: 2, cantonese: '七二一十四', pinyin: 'cat1 ji6 jat1 sap6 sei3', toneMarks: '7¹2⁶1¹10⁶4³', result: 14 },
  { table: 7, multiplier: 3, cantonese: '七三二十一', pinyin: 'cat1 saam1 ji6 sap6 jat1', toneMarks: '7¹3¹2⁶10⁶1¹', result: 21 },
  { table: 7, multiplier: 4, cantonese: '七四二十八', pinyin: 'cat1 sei3 ji6 sap6 baat3', toneMarks: '7¹4³2⁶10⁶8³', result: 28 },
  { table: 7, multiplier: 5, cantonese: '七五三十五', pinyin: 'cat1 ng5 saam1 sap6 ng5', toneMarks: '7¹5⁵3¹10⁶5⁵', result: 35 },
  { table: 7, multiplier: 6, cantonese: '七六四十二', pinyin: 'cat1 luk6 sei3 sap6 ji6', toneMarks: '7¹6⁶4³10⁶2⁶', result: 42 },
  { table: 7, multiplier: 7, cantonese: '七七四十九', pinyin: 'cat1 cat1 sei3 sap6 gau2', toneMarks: '7¹7¹4³10⁶9²', result: 49 },

  // Table 6 (6 lines)
  { table: 6, multiplier: 1, cantonese: '六一如六', pinyin: 'luk6 jat1 jyu4 luk6', toneMarks: '6⁶1¹如¹6⁶', result: 6 },
  { table: 6, multiplier: 2, cantonese: '六二一十二', pinyin: 'luk6 ji6 jat1 sap6 ji6', toneMarks: '6⁶2⁶1¹10⁶2⁶', result: 12 },
  { table: 6, multiplier: 3, cantonese: '六三一十八', pinyin: 'luk6 saam1 jat1 sap6 baat3', toneMarks: '6⁶3¹1¹10⁶8³', result: 18 },
  { table: 6, multiplier: 4, cantonese: '六四二十四', pinyin: 'luk6 sei3 ji6 sap6 sei3', toneMarks: '6⁶4³2⁶10⁶4³', result: 24 },
  { table: 6, multiplier: 5, cantonese: '六五中三十', pinyin: 'luk6 ng5 zung1 saam1 sap6', toneMarks: '6⁶5⁵中¹3¹10⁶', result: 30 },
  { table: 6, multiplier: 6, cantonese: '六六三十六', pinyin: 'luk6 luk6 saam1 sap6 luk6', toneMarks: '6⁶6⁶3¹10⁶6⁶', result: 36 },

  // Table 5 (5 lines)
  { table: 5, multiplier: 1, cantonese: '五一如五', pinyin: 'ng5 jat1 jyu4 ng5', toneMarks: '5⁵1¹如¹5⁵', result: 5 },
  { table: 5, multiplier: 2, cantonese: '五二得一十', pinyin: 'ng5 ji6 dak1 jat1 sap6', toneMarks: '5⁵2⁶得¹1¹10⁶', result: 10 },
  { table: 5, multiplier: 3, cantonese: '五三一十五', pinyin: 'ng5 saam1 jat1 sap6 ng5', toneMarks: '5⁵3¹1¹10⁶5⁵', result: 15 },
  { table: 5, multiplier: 4, cantonese: '五四中二十', pinyin: 'ng5 sei3 zung1 ji6 sap6', toneMarks: '5⁵4³中¹2⁶10⁶', result: 20 },
  { table: 5, multiplier: 5, cantonese: '五五二十五', pinyin: 'ng5 ng5 ji6 sap6 ng5', toneMarks: '5⁵5⁵2⁶10⁶5⁵', result: 25 },

  // Table 4 (4 lines)
  { table: 4, multiplier: 1, cantonese: '四一如四', pinyin: 'sei3 jat1 jyu4 sei3', toneMarks: '4³1¹如¹4³', result: 4 },
  { table: 4, multiplier: 2, cantonese: '四二如八', pinyin: 'sei3 ji6 jyu4 baat3', toneMarks: '4³2⁶如¹8³', result: 8 },
  { table: 4, multiplier: 3, cantonese: '四三一十二', pinyin: 'sei3 saam1 jat1 sap6 ji6', toneMarks: '4³3¹1¹10⁶2⁶', result: 12 },
  { table: 4, multiplier: 4, cantonese: '四四一十六', pinyin: 'sei3 sei3 jat1 sap6 luk6', toneMarks: '4³4³1¹10⁶6⁶', result: 16 },

  // Table 3 (3 lines)
  { table: 3, multiplier: 1, cantonese: '三一如三', pinyin: 'saam1 jat1 jyu4 saam1', toneMarks: '3¹1¹如¹3¹', result: 3 },
  { table: 3, multiplier: 2, cantonese: '三二如六', pinyin: 'saam1 ji6 jyu4 luk6', toneMarks: '3¹2⁶如¹6⁶', result: 6 },
  { table: 3, multiplier: 3, cantonese: '三三歸九', pinyin: 'saam1 saam1 gwai1 gau2', toneMarks: '3¹3¹歸¹9²', result: 9 },

  // Table 2 (2 lines)
  { table: 2, multiplier: 1, cantonese: '二一如二', pinyin: 'ji6 jat1 jyu4 ji6', toneMarks: '2⁶1¹如¹2⁶', result: 2 },
  { table: 2, multiplier: 2, cantonese: '二二如四', pinyin: 'ji6 ji6 jyu4 sei3', toneMarks: '2⁶2⁶如¹4³', result: 4 },

  // Table 1 (1 line)
  { table: 1, multiplier: 1, cantonese: '一一如一', pinyin: 'jat1 jat1 jyu4 jat1', toneMarks: '1¹1¹如¹1¹', result: 1 },
]

// Helper function to get all chants for a specific table
export function getChantsByTable(table: TableNumber): ChantLine[] {
  return chantData.filter((chant) => chant.table === table)
}

// Helper function to get a specific chant
export function getChant(table: TableNumber, lineIndex: number): ChantLine | undefined {
  const chants = getChantsByTable(table)
  return chants[lineIndex]
}

// Export total line count for each table
export const tableLengths: Record<TableNumber, number> = {
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
  1: 1,
}
