import etymologies from '../etymologies.json';
import words from '../words.json';

describe('Data Integrity', () => {
  test('All words have a valid etymology_id', () => {
    const etymologyIds = new Set(etymologies.map((e) => e.id));
    words.forEach((word) => {
      if (!etymologyIds.has(word.etymology_id)) {
        console.error(`Invalid etymology_id: ${word.etymology_id} in word: ${word.id}`);
      }
      expect(etymologyIds.has(word.etymology_id)).toBe(true);
    });
  });

  test('No duplicate IDs in etymologies', () => {
    const ids = etymologies.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  test('No duplicate IDs in words', () => {
    const ids = words.map((w) => w.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
        // Find duplicates for debugging
        const sorted = ids.sort();
        const duplicates = [];
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] === sorted[i]) {
                duplicates.push(sorted[i]);
            }
        }
        console.error('Duplicate word IDs:', duplicates);
    }
    expect(ids.length).toBe(uniqueIds.size);
  });

  test('Words structure is valid', () => {
      words.forEach(word => {
          expect(word.id).toBeDefined();
          expect(word.word).toBeDefined();
          expect(word.etymology_id).toBeDefined();
          // Check for required fields
          expect(word.meaning_ja).toBeTruthy();
      });
  });
});
