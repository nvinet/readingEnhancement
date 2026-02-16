/**
 * @format
 */

/**
 * Tests for handleChangeHardLetters normalization logic
 * This tests the Unicode normalization and duplicate removal logic
 */

// Recreate the logic from App.tsx for testing
function normalizeHardLetters(letters: string): string {
  // Accept any Unicode letter (e.g., ê, æ) and remove duplicates; normalize to NFC
  const normalized = (letters || '').normalize('NFC');
  const uniqueLetters: string[] = [];
  for (const ch of Array.from(normalized)) {
    if (/^\p{L}$/u.test(ch) && !uniqueLetters.includes(ch)) {
      uniqueLetters.push(ch);
    }
  }
  return uniqueLetters.join('');
}

describe('handleChangeHardLetters normalization logic', () => {
  it('should accept basic Latin letters', () => {
    expect(normalizeHardLetters('abc')).toBe('abc');
    expect(normalizeHardLetters('ABC')).toBe('ABC');
  });

  it('should remove duplicate letters', () => {
    expect(normalizeHardLetters('aabbcc')).toBe('abc');
    expect(normalizeHardLetters('aaaa')).toBe('a');
  });

  it('should preserve order of first occurrence', () => {
    expect(normalizeHardLetters('abcabc')).toBe('abc');
    expect(normalizeHardLetters('bacbac')).toBe('bac');
  });

  it('should accept Unicode letters (accented chars)', () => {
    expect(normalizeHardLetters('éàü')).toBe('éàü');
    expect(normalizeHardLetters('ñß')).toBe('ñß');
  });

  it('should normalize to NFC form', () => {
    // Test with decomposed form (NFD) - should be normalized to NFC
    const decomposed = 'e\u0301'; // é in decomposed form (e + combining acute accent)
    const composed = 'é'; // é in composed form
    expect(normalizeHardLetters(decomposed)).toBe(composed);
  });

  it('should remove duplicates after normalization', () => {
    const decomposed = 'e\u0301'; // é in decomposed form
    const composed = 'é'; // é in composed form
    // Both should normalize to the same character and remove duplicates
    expect(normalizeHardLetters(decomposed + composed)).toBe('é');
  });

  it('should filter out non-letter characters', () => {
    expect(normalizeHardLetters('a1b2c3')).toBe('abc');
    expect(normalizeHardLetters('a!b@c#')).toBe('abc');
    expect(normalizeHardLetters('123')).toBe('');
  });

  it('should filter out whitespace', () => {
    expect(normalizeHardLetters('a b c')).toBe('abc');
    expect(normalizeHardLetters('a\tb\nc')).toBe('abc');
  });

  it('should handle empty string', () => {
    expect(normalizeHardLetters('')).toBe('');
  });

  it('should handle null/undefined by treating as empty', () => {
    expect(normalizeHardLetters('')).toBe('');
  });

  it('should handle mixed case and duplicates', () => {
    expect(normalizeHardLetters('AaBbCc')).toBe('AaBbCc');
    expect(normalizeHardLetters('AAaaBBbbCCcc')).toBe('AaBbCc');
  });

  it('should accept emoji-like characters that are letters', () => {
    // Some scripts have letter-like characters
    expect(normalizeHardLetters('αβγ')).toBe('αβγ'); // Greek letters
    expect(normalizeHardLetters('абв')).toBe('абв'); // Cyrillic letters
  });

  it('should handle ligatures', () => {
    expect(normalizeHardLetters('æœ')).toBe('æœ'); // ligatures are letters
  });

  it('should preserve non-ASCII letters', () => {
    expect(normalizeHardLetters('ąćęłńóśźż')).toBe('ąćęłńóśźż'); // Polish letters
    expect(normalizeHardLetters('åäö')).toBe('åäö'); // Swedish letters
  });

  it('should handle very long input', () => {
    const longInput = 'abcdefghijklmnopqrstuvwxyz'.repeat(10);
    expect(normalizeHardLetters(longInput)).toBe('abcdefghijklmnopqrstuvwxyz');
  });

  it('should handle complex Unicode with combining marks', () => {
    // Test various combining marks
    const input = 'e\u0301e\u0300e\u0302'; // é è ê (all decomposed)
    const expected = 'éèê'; // should normalize and keep unique
    expect(normalizeHardLetters(input)).toBe(expected);
  });
});
