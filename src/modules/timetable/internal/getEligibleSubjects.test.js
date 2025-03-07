import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseISO, isSameDay } from 'date-fns';
import { getEligibleSubjects } from './getEligibleSubjects';

// Mock the required functions
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    parseISO: vi.fn(dateStr => new Date(dateStr)),
    isBefore: vi.fn((date1, date2) => date1 < date2),
    isAfter: vi.fn((date1, date2) => date1 > date2),
    isSameDay: vi.fn((date1, date2) => 
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  };
});

describe('getEligibleSubjects', () => {
  beforeEach(() => {
    // Clear all mock function calls before each test
    vi.clearAllMocks();
  });

  it('should return empty array if there is an exam in the slot', () => {
    const date = '2023-06-15';
    const block = 'Morning';
    const exams = [
      { subject: 'Math', examDate: '2023-06-15' },
      { subject: 'Science', examDate: '2023-06-16' }
    ];
    const examSlots = new Map([
      [`${date}-${block}`, ['Math']]
    ]);
    
    const result = getEligibleSubjects(date, block, exams, {}, examSlots);
    
    expect(result).toEqual([]);
  });
  
  it('should allow revision for a subject after its exam on the same day', () => {
    const date = '2023-06-15';
    const block = 'Afternoon';
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' }, // Exam earlier in the day
      { subject: 'Science', examDate: '2023-06-16' } // Exam on future day
    ];
    const examSlots = new Map([
      [`${date}-Morning`, ['Math']] // Math exam in the morning
    ]);
    
    const result = getEligibleSubjects(date, block, exams, {}, examSlots);
    
    // Should include Math as its exam is earlier in the day
    expect(result).toContain('Math');
    expect(result).toContain('Science');
  });
  
  it('should exclude subjects with exams later in the same day', () => {
    const date = '2023-06-15';
    const block = 'Morning';
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Afternoon' }, // Exam later in the day
      { subject: 'Science', examDate: '2023-06-16' } // Exam on future day
    ];
    const examSlots = new Map([
      [`${date}-Afternoon`, ['Math']] // Math exam in the afternoon
    ]);
    
    const result = getEligibleSubjects(date, block, exams, {}, examSlots);
    
    // Should not include Math as its exam is later in the day
    expect(result).not.toContain('Math');
    expect(result).toContain('Science');
  });
  
  it('should exclude subjects whose exams have already passed', () => {
    const date = '2023-06-15';
    const block = 'Morning';
    const exams = [
      { subject: 'Math', examDate: '2023-06-14' }, // Exam in the past
      { subject: 'Science', examDate: '2023-06-16' } // Exam in the future
    ];
    const examSlots = new Map([]);
    
    const result = getEligibleSubjects(date, block, exams, {}, examSlots);
    
    // Should not include Math as its exam has already passed
    expect(result).not.toContain('Math');
    expect(result).toContain('Science');
  });
  
  // Add a specific test for the error case
  it('should include Math in eligible subjects when its exam is in the future', () => {
    const date = '2023-06-15';
    const block = 'Afternoon';
    const exams = [
      { subject: 'Math', examDate: '2023-06-16' } // Math exam is in the future
    ];
    const examSlots = new Map(); // No exams on the given date
    
    const result = getEligibleSubjects(date, block, exams, {}, examSlots);
    
    // Math should be eligible since its exam is in the future
    expect(result).toContain('Math');
  });
});
