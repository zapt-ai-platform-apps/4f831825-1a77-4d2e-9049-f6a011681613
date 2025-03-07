import { describe, it, expect } from 'vitest';
import { sortSessionsByBlock } from './sessionSorter';

describe('sessionSorter', () => {
  it('should sort sessions by date and block', () => {
    const sessions = [
      { date: '2023-06-15', block: 'Afternoon', subject: 'Math' },
      { date: '2023-06-15', block: 'Morning', subject: 'Science' },
      { date: '2023-06-14', block: 'Evening', subject: 'History' },
      { date: '2023-06-16', block: 'Morning', subject: 'English' },
      { date: '2023-06-15', block: 'Evening', subject: 'Art' }
    ];
    
    const sorted = sortSessionsByBlock(sessions);
    
    // Expect sessions sorted by date first, then by block order
    expect(sorted[0].date).toBe('2023-06-14');
    expect(sorted[0].block).toBe('Evening');
    
    expect(sorted[1].date).toBe('2023-06-15');
    expect(sorted[1].block).toBe('Morning');
    
    expect(sorted[2].date).toBe('2023-06-15');
    expect(sorted[2].block).toBe('Afternoon');
    
    expect(sorted[3].date).toBe('2023-06-15');
    expect(sorted[3].block).toBe('Evening');
    
    expect(sorted[4].date).toBe('2023-06-16');
    expect(sorted[4].block).toBe('Morning');
  });
  
  it('should handle empty input', () => {
    const sessions = [];
    const sorted = sortSessionsByBlock(sessions);
    expect(sorted).toEqual([]);
  });
  
  it('should preserve original object properties', () => {
    const sessions = [
      { date: '2023-06-15', block: 'Evening', subject: 'Math', custom: 'value' },
      { date: '2023-06-15', block: 'Morning', subject: 'Science', id: 123 }
    ];
    
    const sorted = sortSessionsByBlock(sessions);
    
    expect(sorted[0].subject).toBe('Science');
    expect(sorted[0].id).toBe(123);
    
    expect(sorted[1].subject).toBe('Math');
    expect(sorted[1].custom).toBe('value');
  });
});