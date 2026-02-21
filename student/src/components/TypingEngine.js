/**
 * TypingEngine.js — Pure logic helper (no React, no DOM, no imports)
 *
 * Provides stateless functions for WPM calculation, accuracy, error tracking,
 * and per-character analysis. Import these into any typing component.
 */

// ─── WPM Calculation ──────────────────────────────────────────────────────────
/**
 * Calculate Words Per Minute.
 * @param {number} correctChars  - number of correctly typed characters
 * @param {number} elapsedMs     - milliseconds elapsed since typing started
 * @returns {number} wpm (floored)
 */
export const calcWpm = (correctChars, elapsedMs) => {
  if (!elapsedMs || elapsedMs < 500) return 0;
  const minutes = elapsedMs / 60000;
  return Math.floor((correctChars / 5) / minutes);
};

// ─── Accuracy Calculation ─────────────────────────────────────────────────────
/**
 * @param {number} correctChars
 * @param {number} totalTyped — total keystrokes (correct + incorrect)
 * @returns {number} accuracy 0–100
 */
export const calcAccuracy = (correctChars, totalTyped) => {
  if (!totalTyped) return 100;
  return Math.round((correctChars / totalTyped) * 100);
};

// ─── Compare Input to Target ──────────────────────────────────────────────────
/**
 * Compare the typed input against the target text.
 * Returns per-character state and summary counts.
 *
 * @param {string} target   - full target text
 * @param {string} input    - what the student has typed
 * @returns {{ chars: Array<{char, state}>, correct: number, incorrect: number, remaining: number }}
 *   state: 'correct' | 'incorrect' | 'cursor' | 'pending'
 */
export const compareText = (target, input) => {
  let correct = 0;
  let incorrect = 0;

  const chars = target.split('').map((char, i) => {
    if (i === input.length) return { char, state: 'cursor' };
    if (i > input.length)  return { char, state: 'pending' };
    if (input[i] === char) { correct++;   return { char, state: 'correct' }; }
    else                   { incorrect++; return { char, state: 'incorrect', typed: input[i] }; }
  });

  return { chars, correct, incorrect, remaining: target.length - input.length };
};

// ─── Per-Key Error Accumulation ───────────────────────────────────────────────
/**
 * Returns a new errorMap with the targetChar error count incremented.
 * @param {Object} errorMap   - current error map { a: 3, s: 1, ... }
 * @param {string} targetChar - the character that SHOULD have been typed
 * @returns {Object} new errorMap
 */
export const recordError = (errorMap, targetChar) => {
  if (!targetChar || !targetChar.trim()) return errorMap;
  const k = targetChar.toLowerCase();
  return { ...errorMap, [k]: (errorMap[k] || 0) + 1 };
};

// ─── Per-Character Timing ─────────────────────────────────────────────────────
/**
 * Record the timing (ms) for a keystroke.
 * @param {Array<number>} timings  - existing timings array
 * @param {number}        lastTime - timestamp of previous keystroke (or start)
 * @returns {{ timings: number[], lastTime: number }}
 */
export const recordTiming = (timings, lastTime) => {
  const now = Date.now();
  return { timings: [...timings, now - lastTime], lastTime: now };
};

// ─── Progress Percentage ──────────────────────────────────────────────────────
export const calcProgress = (inputLength, totalLength) => {
  if (!totalLength) return 0;
  return Math.min(100, Math.round((inputLength / totalLength) * 100));
};

// ─── Format Duration ─────────────────────────────────────────────────────────
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
};

// ─── Aggregate Error Map ──────────────────────────────────────────────────────
/**
 * Returns top N most-missed keys from an errorMap.
 * @param {Object} errorMap
 * @param {number} n
 * @returns {Array<[string, number]>} sorted [key, count] pairs
 */
export const topErrors = (errorMap, n = 5) =>
  Object.entries(errorMap)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n);
