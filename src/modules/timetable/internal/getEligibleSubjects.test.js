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
  
  // Mock dateUtils functionality
  vi.mock('./dateUtils', () => ({
    areSameDay: (date1, date2) => {
      if (typeof date1 === 'string') date1 = parseISO(date1);
      if (typeof date2 === 'string') date2 = parseISO(date2);
      
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    }
  }));
  
  // Mock console.log to not pollute test output
  const originalConsoleLog = console.log;
  
  beforeEach(() => {
    console.log = vi.fn();
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
  });
  
  it('should NOT include subjects whose exams have already taken place', () => {
    // Afternoon on a day with a morning exam
    const result = getEligibleSubjects(
      '2023-06-15', 'Afternoon', mockExams, mockSubjectCounts, mockExamSlots
    );
    
    // Should NOT include Math (exam already happened in morning)
    // Should NOT include Science (has exam in this block)
    expect(result).not.toContain('Math');
    expect(result).not.toContain('Science');
  });
  
  it('should NOT include subjects with exams in the same or earlier time blocks on the same day', () => {
    // Evening on a day with morning and afternoon exams
    const result = getEligibleSubjects(
      '2023-06-15', 'Evening', mockExams, mockSubjectCounts, mockExamSlots
    );
    
    // Should NOT include Math and Science (both had exams earlier in the day)
    expect(result).not.toContain('Math');
    expect(result).not.toContain('Science');
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
  
  it('should NOT include any subject with an exam on the same day, regardless of time', () => {
    // Test for morning slot on an exam day
    const morningResult = getEligibleSubjects(
      '2023-06-15', 'Morning', mockExams, mockSubjectCounts, new Map([])
    );
    
    // Should not include Math or Science (both have exams on this day)
    expect(morningResult).not.toContain('Math');
    expect(morningResult).not.toContain('Science');
    
    // Test for evening slot on an exam day (no exams in evening)
    const eveningResult = getEligibleSubjects(
      '2023-06-15', 'Evening', mockExams, mockSubjectCounts, new Map([])
    );
    
    // Should not include Math or Science (both have exams on this day)
    expect(eveningResult).not.toContain('Math');
    expect(eveningResult).not.toContain('Science');
  });
});