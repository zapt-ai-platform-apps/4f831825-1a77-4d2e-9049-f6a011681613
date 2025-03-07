import { describe, it, expect, vi } from 'vitest';
import { parseISO } from 'date-fns';

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

// Mock internal function to test it directly
function getEligibleSubjects(date, block, exams, subjectCounts, examSlots) {
  const sessionDate = parseISO(date);
  
  // Check if there's any exam in this slot
  const slotKey = `${date}-${block}`;
  if (examSlots.has(slotKey)) {
    return [];
  }
  
  // Find exams on this day to exclude their subjects from revision
  const sameDay = Array.from(examSlots.keys())
    .filter(key => key.startsWith(date))
    .map(key => {
      const [, timeBlock] = key.split('-');
      return { block: timeBlock, subjects: examSlots.get(key) };
    });
  
  // Get times of day in sequential order
  const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2 };
  const currentTimeOrder = timeOrder[block];
  
  // Filter out subjects that have exams on the same day (at any time)
  // This prevents scheduling revision for a subject on the same day as its exam
  const excludedSubjects = new Set();
  sameDay.forEach(({ subjects }) => {
    subjects.forEach(subject => excludedSubjects.add(subject));
  });
  
  // Filter subjects that haven't had their exam yet on this date
  // and aren't excluded due to same-day exam timing
  return exams
    .filter(exam => {
      const examDate = parseISO(exam.examDate);
      
      // Exclude subjects whose exams have already passed
      if (examDate < sessionDate) {
        return false;
      }
      
      // Exclude subjects that have an exam on this day
      if (
        examDate.getFullYear() === sessionDate.getFullYear() &&
        examDate.getMonth() === sessionDate.getMonth() &&
        examDate.getDate() === sessionDate.getDate() && 
        excludedSubjects.has(exam.subject)
      ) {
        return false;
      }
      
      return true;
    })
    .map(exam => exam.subject);
}

describe('getEligibleSubjects', () => {
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
  
  it('should exclude subjects with exams on the same day', () => {
    const date = '2023-06-15';
    const block = 'Afternoon';
    const exams = [
      { subject: 'Math', examDate: '2023-06-15' }, // Exam on same day
      { subject: 'Science', examDate: '2023-06-16' } // Exam on future day
    ];
    const examSlots = new Map([
      [`${date}-Morning`, ['Math']] // Math exam in the morning
    ]);
    
    const result = getEligibleSubjects(date, block, exams, {}, examSlots);
    
    // Should not include Math as it has an exam on the same day
    expect(result).toEqual(['Science']);
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
    expect(result).toEqual(['Science']);
  });
  
  it('should return all eligible subjects', () => {
    const date = '2023-06-15';
    const block = 'Evening';
    const exams = [
      { subject: 'Math', examDate: '2023-06-15' }, // Exam on same day
      { subject: 'Science', examDate: '2023-06-16' }, // Future exam
      { subject: 'History', examDate: '2023-06-14' }, // Past exam
      { subject: 'English', examDate: '2023-06-20' } // Future exam
    ];
    const examSlots = new Map([
      [`${date}-Morning`, ['Math']] // Math exam in the morning
    ]);
    
    const result = getEligibleSubjects(date, block, exams, {}, examSlots);
    
    // Should include Science and English, but not Math (same day) or History (past)
    expect(result).toContain('Science');
    expect(result).toContain('English');
    expect(result).not.toContain('Math');
    expect(result).not.toContain('History');
  });
});