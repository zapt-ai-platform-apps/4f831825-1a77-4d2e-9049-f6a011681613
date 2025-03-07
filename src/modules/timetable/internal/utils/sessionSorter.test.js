import { describe, it, expect } from 'vitest';
import { sortSessionsByBlock } from './sessionSorter';

describe('sortSessionsByBlock', () => {
  it('should sort sessions by date and block', () => {
    const sessions = [
      { date: '2023-06-10', block: 'Afternoon' },
      { date: '2023-06-10', block: 'Morning' },
      { date: '2023-06-11', block: 'Morning' },
      { date: '2023-06-10', block: 'Evening' },
      { date: '2023-06-11', block: 'Afternoon' },
    ];

    const sorted = sortSessionsByBlock(sessions);

    // Check that sessions are sorted by date first
    expect(sorted[0].date).toBe('2023-06-10');
    expect(sorted[1].date).toBe('2023-06-10');
    expect(sorted[2].date).toBe('2023-06-10');
    expect(sorted[3].date).toBe('2023-06-11');
    expect(sorted[4].date).toBe('2023-06-11');

    // Check that blocks are sorted correctly within each date
    expect(sorted[0].block).toBe('Morning');
    expect(sorted[1].block).toBe('Afternoon');
    expect(sorted[2].block).toBe('Evening');
    expect(sorted[3].block).toBe('Morning');
    expect(sorted[4].block).toBe('Afternoon');
  });

  it('should handle empty array', () => {
    expect(sortSessionsByBlock([])).toEqual([]);
  });
});