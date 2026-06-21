import type { ChantLine, TableNumber } from '../types/game'

// 81 Cantonese multiplication chant lines
// Format: 九一得九, 九二十八, etc.
// Table 9: 9 lines, Table 8: 8 lines, ... Table 1: 1 line
export const chantData: ChantLine[] = [
  // Table 9 (9 lines)
  { table: 9, multiplier: 1, cantonese: '九一得九', pinyin: 'jiǔ yī dé jiǔ', toneMarks: '9¹1¹得¹9', result: 9 },
  { table: 9, multiplier: 2, cantonese: '九二十八', pinyin: 'jiǔ èr shí bā', toneMarks: '9²2¹20⁸', result: 18 },
  { table: 9, multiplier: 3, cantonese: '九三二十七', pinyin: 'jiǔ sān èr shí qī', toneMarks: '9²3¹2⁴20⁷', result: 27 },
  { table: 9, multiplier: 4, cantonese: '九四三十六', pinyin: 'jiǔ sì sān shí liù', toneMarks: '9²4²3¹20⁶', result: 36 },
  { table: 9, multiplier: 5, cantonese: '九五四十五', pinyin: 'jiǔ wǔ sì shí wǔ', toneMarks: '9²5³4²20⁵', result: 45 },
  { table: 9, multiplier: 6, cantonese: '九六五十四', pinyin: 'jiǔ liù wǔ shí sì', toneMarks: '9²6⁴5³20⁴', result: 54 },
  { table: 9, multiplier: 7, cantonese: '九七六十三', pinyin: 'jiǔ qī liù shí sān', toneMarks: '9²7¹6⁴20³', result: 63 },
  { table: 9, multiplier: 8, cantonese: '九八七十二', pinyin: 'jiǔ bā qī shí èr', toneMarks: '9²8³7¹20²', result: 72 },
  { table: 9, multiplier: 9, cantonese: '九九八十一', pinyin: 'jiǔ jiǔ bā shí yī', toneMarks: '9²9³8¹20¹', result: 81 },

  // Table 8 (8 lines)
  { table: 8, multiplier: 1, cantonese: '八一得八', pinyin: 'bā yī dé bā', toneMarks: '8¹1¹得¹8', result: 8 },
  { table: 8, multiplier: 2, cantonese: '八二十六', pinyin: 'bā èr shí liù', toneMarks: '8¹2¹20⁶', result: 16 },
  { table: 8, multiplier: 3, cantonese: '八三二十四', pinyin: 'bā sān èr shí sì', toneMarks: '8¹3¹2⁴20⁴', result: 24 },
  { table: 8, multiplier: 4, cantonese: '八四三十二', pinyin: 'bā sì sān shí èr', toneMarks: '8¹4²3¹20²', result: 32 },
  { table: 8, multiplier: 5, cantonese: '八五四十', pinyin: 'bā wǔ sì shí', toneMarks: '8¹5³4²20', result: 40 },
  { table: 8, multiplier: 6, cantonese: '八六四十八', pinyin: 'bā liù sì shí bā', toneMarks: '8¹6⁴4²20⁸', result: 48 },
  { table: 8, multiplier: 7, cantonese: '八七五十六', pinyin: 'bā qī wǔ shí liù', toneMarks: '8¹7¹5³20⁶', result: 56 },
  { table: 8, multiplier: 8, cantonese: '八八六十四', pinyin: 'bā bā liù shí sì', toneMarks: '8¹8¹6⁴20⁴', result: 64 },

  // Table 7 (7 lines)
  { table: 7, multiplier: 1, cantonese: '七一得七', pinyin: 'qī yī dé qī', toneMarks: '7¹1¹得¹7', result: 7 },
  { table: 7, multiplier: 2, cantonese: '七二十四', pinyin: 'qī èr shí sì', toneMarks: '7¹2¹20⁴', result: 14 },
  { table: 7, multiplier: 3, cantonese: '七三二十一', pinyin: 'qī sān èr shí yī', toneMarks: '7¹3¹2⁴20¹', result: 21 },
  { table: 7, multiplier: 4, cantonese: '七四二十八', pinyin: 'qī sì èr shí bā', toneMarks: '7¹4²2¹20⁸', result: 28 },
  { table: 7, multiplier: 5, cantonese: '七五三十五', pinyin: 'qī wǔ sān shí wǔ', toneMarks: '7¹5³3¹20⁵', result: 35 },
  { table: 7, multiplier: 6, cantonese: '七六四十二', pinyin: 'qī liù sì shí èr', toneMarks: '7¹6⁴4²20²', result: 42 },
  { table: 7, multiplier: 7, cantonese: '七七四十九', pinyin: 'qī qī sì shí jiǔ', toneMarks: '7¹7¹4²20⁹', result: 49 },

  // Table 6 (6 lines)
  { table: 6, multiplier: 1, cantonese: '六一得六', pinyin: 'liù yī dé liù', toneMarks: '6⁴1¹得¹6', result: 6 },
  { table: 6, multiplier: 2, cantonese: '六二十二', pinyin: 'liù èr shí èr', toneMarks: '6⁴2¹20²', result: 12 },
  { table: 6, multiplier: 3, cantonese: '六三十八', pinyin: 'liù sān shí bā', toneMarks: '6⁴3¹20⁸', result: 18 },
  { table: 6, multiplier: 4, cantonese: '六四二十四', pinyin: 'liù sì èr shí sì', toneMarks: '6⁴4²2¹20⁴', result: 24 },
  { table: 6, multiplier: 5, cantonese: '六五三十', pinyin: 'liù wǔ sān shí', toneMarks: '6⁴5³3¹20', result: 30 },
  { table: 6, multiplier: 6, cantonese: '六六三十六', pinyin: 'liù liù sān shí liù', toneMarks: '6⁴6⁴3¹20⁶', result: 36 },

  // Table 5 (5 lines)
  { table: 5, multiplier: 1, cantonese: '五一得五', pinyin: 'wǔ yī dé wǔ', toneMarks: '5³1¹得¹5', result: 5 },
  { table: 5, multiplier: 2, cantonese: '五二一十', pinyin: 'wǔ èr yī shí', toneMarks: '5³2¹1¹20', result: 10 },
  { table: 5, multiplier: 3, cantonese: '五三十五', pinyin: 'wǔ sān shí wǔ', toneMarks: '5³3¹20⁵', result: 15 },
  { table: 5, multiplier: 4, cantonese: '五四二十', pinyin: 'wǔ sì èr shí', toneMarks: '5³4²2¹20', result: 20 },
  { table: 5, multiplier: 5, cantonese: '五五二十五', pinyin: 'wǔ wǔ èr shí wǔ', toneMarks: '5³5³2¹20⁵', result: 25 },

  // Table 4 (4 lines)
  { table: 4, multiplier: 1, cantonese: '四一得四', pinyin: 'sì yī dé sì', toneMarks: '4²1¹得¹4', result: 4 },
  { table: 4, multiplier: 2, cantonese: '四二得八', pinyin: 'sì èr dé bā', toneMarks: '4²2¹得¹8', result: 8 },
  { table: 4, multiplier: 3, cantonese: '四三十二', pinyin: 'sì sān shí èr', toneMarks: '4²3¹20²', result: 12 },
  { table: 4, multiplier: 4, cantonese: '四四十六', pinyin: 'sì sì shí liù', toneMarks: '4²4²20⁶', result: 16 },

  // Table 3 (3 lines)
  { table: 3, multiplier: 1, cantonese: '三一得三', pinyin: 'sān yī dé sān', toneMarks: '3¹1¹得¹3', result: 3 },
  { table: 3, multiplier: 2, cantonese: '三二得六', pinyin: 'sān èr dé liù', toneMarks: '3¹2¹得¹6', result: 6 },
  { table: 3, multiplier: 3, cantonese: '三三得九', pinyin: 'sān sān dé jiǔ', toneMarks: '3¹3¹得¹9', result: 9 },

  // Table 2 (2 lines)
  { table: 2, multiplier: 1, cantonese: '二一得二', pinyin: 'èr yī dé èr', toneMarks: '2¹1¹得¹2', result: 2 },
  { table: 2, multiplier: 2, cantonese: '二二得四', pinyin: 'èr èr dé sì', toneMarks: '2¹2¹得¹4', result: 4 },

  // Table 1 (1 line)
  { table: 1, multiplier: 1, cantonese: '一一得一', pinyin: 'yī yī dé yī', toneMarks: '1¹1¹得¹1', result: 1 },
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
