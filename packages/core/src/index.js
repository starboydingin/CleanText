export { createCleaner, cleanText } from './createCleaner.js';
export { MAX_WORDS, MAX_CHARS, MAX_BODY_BYTES, countWords, validateLength, truncateToWords } from './limits.js';
export {
  RULE_KEYS,
  RULES,
  DEFAULT_OPTIONS,
  newCounts,
  resolveOptions,
  parseCleanRequest,
  parseUnicodeForm,
} from './options.js';
export { visualizeHidden, scanHidden, countHidden, labelFor } from './visualizeHidden.js';
export { validateStatsPayload } from './stats.js';
export { HOMOGLYPHS } from './rules/homoglyphs.js';

export const VERSION = '1.2.0';
