/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Reader, { ReaderConfig } from '../src/components/Reader';

// Extract the pure functions from Reader component for testing
// Note: These are not exported, so we recreate them here for testing
function splitIntoWords(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(w => w.length > 0);
}

function findDoubleLetterIndices(word: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < word.length - 1; i++) {
    if (word[i] === word[i + 1]) {
      indices.push(i);
    }
  }
  return indices;
}

describe('splitIntoWords', () => {
  it('should split text on whitespace', () => {
    expect(splitIntoWords('Hello world')).toEqual(['Hello', 'world']);
  });

  it('should handle multiple spaces', () => {
    expect(splitIntoWords('Hello   world')).toEqual(['Hello', 'world']);
  });

  it('should handle tabs and newlines', () => {
    expect(splitIntoWords('Hello\tworld\ntest')).toEqual(['Hello', 'world', 'test']);
  });

  it('should filter out empty strings', () => {
    expect(splitIntoWords('  Hello  world  ')).toEqual(['Hello', 'world']);
  });

  it('should handle empty string', () => {
    expect(splitIntoWords('')).toEqual([]);
  });

  it('should handle string with only whitespace', () => {
    expect(splitIntoWords('   \t\n  ')).toEqual([]);
  });

  it('should handle single word', () => {
    expect(splitIntoWords('Hello')).toEqual(['Hello']);
  });

  it('should handle very long text', () => {
    const longText = 'The quick brown fox jumps over the lazy dog';
    expect(splitIntoWords(longText)).toEqual([
      'The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'
    ]);
  });
});

describe('findDoubleLetterIndices', () => {
  it('should find double letters', () => {
    expect(findDoubleLetterIndices('hello')).toEqual([2]); // 'll' at index 2
  });

  it('should find multiple double letters', () => {
    expect(findDoubleLetterIndices('essee')).toEqual([1, 3]); // 'ss' and 'ee'
  });

  it('should handle triple letters correctly', () => {
    // For 'aaa', indices 0 and 1 both have next char matching
    expect(findDoubleLetterIndices('aaa')).toEqual([0, 1]);
  });

  it('should return empty array for no double letters', () => {
    expect(findDoubleLetterIndices('abcdef')).toEqual([]);
  });

  it('should handle empty string', () => {
    expect(findDoubleLetterIndices('')).toEqual([]);
  });

  it('should handle single character', () => {
    expect(findDoubleLetterIndices('a')).toEqual([]);
  });

  it('should be case-sensitive', () => {
    expect(findDoubleLetterIndices('Aa')).toEqual([]);
    expect(findDoubleLetterIndices('AA')).toEqual([0]);
  });

  it('should handle numbers and special chars', () => {
    expect(findDoubleLetterIndices('a11b')).toEqual([1]); // '11'
    expect(findDoubleLetterIndices('a!!b')).toEqual([1]); // '!!'
  });
});

// Note: Reader component tests require complex native module mocking (reanimated, gesture-handler)
// Component integration tests should be added when e2e testing infrastructure is set up
