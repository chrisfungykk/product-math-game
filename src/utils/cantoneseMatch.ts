// Cantonese pronunciation matching helpers for the 九因歌 vocabulary.
//
// The recited chant is judged by what the child SAID, not by arithmetic.
// Web Speech recognizers frequently return homophones (狗 for 九, 於 for 如)
// or swap Chinese numerals for Arabic digits ("27" for 二十七). We defend
// against both with two independent, tone-insensitive signals:
//
//   1. Digit skeleton  — strip everything but numeric value ("九三二十七"→"9327").
//      Robust to Arabic-vs-Chinese numeral form.
//   2. Jyutping skeleton — map each char to its tone-stripped Cantonese
//      syllable ("九三二十七"→"gausaamjisapcat"). Robust to homophone chars.
//
// The chant vocabulary is tiny (digits 〇–十 + connectives 如得歸中), so a
// curated homophone table covers the realistic confusions exhaustively.

// --- Numeric value map (digit skeleton) ------------------------------------
// Maps a character to the Arabic digit(s) it contributes. Structural chars
// (十, connectives, punctuation) are intentionally absent and get dropped.
const DIGIT_MAP: Record<string, string> = {
  // Canonical Chinese numerals
  零: '0', 〇: '0', 一: '1', 二: '2', 三: '3', 四: '4',
  五: '5', 六: '6', 七: '7', 八: '8', 九: '9',
  兩: '2', // 兩 (loeng5) = "two" in counting contexts
  // Financial / variant numerals an ASR may emit
  壹: '1', 貳: '2', 參: '3', 叁: '3', 肆: '4', 伍: '5',
  陸: '6', 柒: '7', 捌: '8', 玖: '9', 拾: '10',
  // Common homophones returned by speech engines
  狗: '9', 韭: '9', 叭: '8', 漆: '7', 碌: '6',
  // Superscript digits (from chant toneMarks rendering)
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  // Full-width Arabic digits
  '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
  '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
}

/**
 * Reduce text to its pure numeric value, dropping structural chars.
 * "九三二十七" → "9327", "9327" → "9327", "九一如九" → "919"
 */
export function toDigitSkeleton(text: string): string {
  let result = ''
  for (const ch of text) {
    if (DIGIT_MAP[ch]) {
      result += DIGIT_MAP[ch]
    } else if (ch >= '0' && ch <= '9') {
      result += ch
    }
    // everything else (十, connectives, homophones-of-structural) dropped
  }
  return result
}

// --- Jyutping map (pronunciation skeleton) ---------------------------------
// Tone-stripped Cantonese romanization for every char in the chant
// vocabulary plus its frequent ASR homophones. Tone is omitted on purpose:
// children's tones drift and recognizers are tone-unreliable, so matching on
// initial+final is the right altitude.
const HAN_TO_JYUTPING: Record<string, string> = {
  // 0
  零: 'ling', 〇: 'ling',
  // 1  jat
  一: 'jat', 壹: 'jat', 日: 'jat',
  // 2  ji
  二: 'ji', 貳: 'ji', 兒: 'ji', 而: 'ji', 耳: 'ji', 餌: 'ji',
  兩: 'loeng', 倆: 'loeng',
  // 3  saam
  三: 'saam', 叁: 'saam', 參: 'saam', 衫: 'saam', 杉: 'saam',
  // 4  sei
  四: 'sei', 肆: 'sei', 死: 'sei',
  // 5  ng
  五: 'ng', 伍: 'ng', 午: 'ng', 唔: 'ng', 吳: 'ng',
  // 6  luk
  六: 'luk', 陸: 'luk', 碌: 'luk', 綠: 'luk', 錄: 'luk',
  // 7  cat
  七: 'cat', 柒: 'cat', 漆: 'cat', 緝: 'cat',
  // 8  baat
  八: 'baat', 捌: 'baat', 叭: 'baat', 罷: 'baat',
  // 9  gau
  九: 'gau', 玖: 'gau', 狗: 'gau', 久: 'gau', 韭: 'gau', 夠: 'gau',
  // 10 sap
  十: 'sap', 拾: 'sap', 什: 'sap',
  // connective 如 jyu
  如: 'jyu', 於: 'jyu', 魚: 'jyu', 余: 'jyu', 瑜: 'jyu', 愚: 'jyu', 漁: 'jyu',
  // connective 得 dak
  得: 'dak', 德: 'dak', 特: 'dak',
  // connective 歸 gwai
  歸: 'gwai', 龜: 'gwai', 規: 'gwai', 貴: 'gwai', 鬼: 'gwai',
  // connective 中 zung
  中: 'zung', 鐘: 'zung', 終: 'zung', 鍾: 'zung', 種: 'zung', 宗: 'zung',
}

// Jyutping for Arabic digits, so "919" → "gaujatgau" when an engine returns
// digits for single-digit reads. (Multi-digit numbers like "27" are NOT
// expanded to 二十七 here — the digit skeleton tier already covers those.)
const ARABIC_JYUTPING: Record<string, string> = {
  '0': 'ling', '1': 'jat', '2': 'ji', '3': 'saam', '4': 'sei',
  '5': 'ng', '6': 'luk', '7': 'cat', '8': 'baat', '9': 'gau',
}

/**
 * Map text to a concatenated tone-stripped jyutping skeleton.
 * Unknown chars are dropped. Returns '' if nothing maps.
 * "九三二十七" → "gausaamjisapcat"
 */
export function toJyutpingSkeleton(text: string): string {
  let result = ''
  for (const ch of text) {
    if (HAN_TO_JYUTPING[ch]) {
      result += HAN_TO_JYUTPING[ch]
    } else if (ARABIC_JYUTPING[ch]) {
      result += ARABIC_JYUTPING[ch]
    }
    // unmapped chars (spaces, punctuation, OOV) dropped
  }
  return result
}
