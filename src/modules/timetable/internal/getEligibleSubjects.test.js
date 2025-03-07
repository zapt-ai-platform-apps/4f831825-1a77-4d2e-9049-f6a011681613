import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEligibleSubjects } from './getEligibleSubjects';
import { parseISO } from 'date-fns';

describe('getEligibleSubjects', () => {
  // Mock setup
  const mockExams = [
    { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
    { subject: 'Science', examDate: '2023-06-15', timeOfDay: 'Afternoon' },
    { subject: 'History', examDate: '2023-06-16', timeOfDay: 'Morning' },
    { subject: 'English', examDate: '2023-06-20', timeOfDay: 'Morning' }
  ];
  
  const mockSubjectCounts = {
    'Math': 2,
    'Science': 1,
    'History': 0,
    'English': 3
  };
  
  const mockExamSlots = new Map([
    ['2023-06-15-Morning', ['Math']],
    ['2023-06-15-Afternoon', ['Science']],
    ['2023-06-16-Morning', ['History']],
    ['2023-06-20-Morning', ['English']]
  ]);
  
  // Mock console.log to not pollute test output
  const originalConsoleLog = console.log;
  
  beforeEach(() => {
    console.log = vi.fn();
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
  });
  
  it('should return eligible subjects for a session after a morning exam', () => {
    // Afternoon on a day with a morning exam
    const result = getEligibleSubjects(
      '2023-06-15', 'Afternoon', mockExams, mockSubjectCounts, mockExamSlots
    );
    
    // Should include Math (had exam in morning) but not Science (has exam in this block)
    expect(result).toContain('Math');
    expect(result).not.toContain('Science');
  });
  
  it('should return eligible subjects for an evening session on an exam day', () => {
    // Evening on a day with morning and afternoon exams
    const result = getEligibleSubjects(
      '2023-06-15', 'Evening', mockExams, mockSubjectCounts, mockExamSlots
    );
    
    // Should include Math and Science (both had exams earlier in the day)
    expect(result).toContain('Math');
    expect(result).toContain('Science');
  });
  
  it('should return empty array for a slot with an exam', () => {
    // Morning on a day with a morning exam
    const result = getEligibleSubjects(
      '2023-06-16', 'Morning', mockExams, mockSubjectCounts, mockExamSlots
    );
    
    // Should be empty (slot has an exam)
    expect(result).toEqual([]);
  });
  
  it('should include subjects with exams on later days', () => {
    // Any block on a day before an exam
    const result = getEligibleSubjects(
      '2023-06-14', 'Afternoon', mockExams, mockSubjectCounts, mockExamSlots
    );
    
    // Should include all subjects with upcoming exams
    expect(result).toContain('Math');
    expect(result).toContain('Science');
    expect(result).toContain('History');
    expect(result).toContain('English');
  });
  
  it('should exclude subjects with exams on previous days', () => {
    // Any block on a day after an exam
    const result = getEligibleSubjects(
      '2023-06-17', 'Morning', mockExams, mockSubjectCounts, mockExamSlots
    );
    
    // Should not include subjects that had exams already
    expect(result).not.toContain('Math');
    expect(result).not.toContain('Science');
    expect(result).not.toContain('History');
    
    // Should include subjects with upcoming exams
    expect(result).toContain('English');
  });
});