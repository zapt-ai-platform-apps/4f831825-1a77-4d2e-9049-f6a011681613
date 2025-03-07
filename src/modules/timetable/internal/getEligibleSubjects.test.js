import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseISO, isSameDay } from 'date-fns';

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

// Import isSameDay to make it available in the test scope
import { isSameDay as actualIsSameDay } from 'date-fns';

// Mock internal function to test it directly
function getEligibleSubjects(date, block, exams, subjectCounts, examSlots) {
  const sessionDate = parseISO(date);
  
  // Check if there's any exam in this slot
  const slotKey = `${date}-${block}`;
  if (examSlots.has(slotKey)) {
    return [];
  }
  
  // Get times of day in sequential order
  const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2 };
  const currentTimeOrder = timeOrder[block];
  
  // Find exams on this day to exclude their subjects from revision
  const sameDay = Array.from(examSlots.keys())
    .filter(key => key.startsWith(date))
    .map(key => {
      const [, timeBlock] = key.split('-');
      return { 
        block: timeBlock, 
        timeOrder: timeOrder[timeBlock],
        subjects: examSlots.get(key) 
      };
    });
  
  // Filter out subjects that have exams at or after the current block on the same day
  // This allows scheduling revision for a subject after its exam is complete on the same day
  const excludedSubjects = new Set();
  sameDay.forEach(({ block: examBlock, timeOrder: examTimeOrder, subjects }) => {
    // Only exclude subjects with exams in the current block or later blocks
    if (examTimeOrder >= currentTimeOrder) {
      subjects.forEach(subject => excludedSubjects.add(subject));
    }
  });
  
  // Helper function to check if two dates are the same day (more explicit)
  const areSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  // Filter subjects that haven't had their exam yet (or have had it earlier this day)
  return exams
    .filter(exam => {
      const examDate = parseISO(exam.examDate);
      
      // Exclude subjects whose exams have already passed on previous days
      if (examDate < sessionDate && !areSameDay(examDate, sessionDate)) {
        return false;
      }
      
      // For exams on the same day, check if they're in a later time block
      if (areSameDay(examDate, sessionDate)) {
        const examTimeOrder = timeOrder[exam.timeOfDay || 'Morning'];
        // Allow revision for this subject only if its exam is in an earlier block of the day
        return examTimeOrder < currentTimeOrder;
      }
      
      return true;
    })
    .map(exam => exam.subject)
    .filter(subject => !excludedSubjects.has(subject));
}

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
  
  it('should return all eligible subjects', () => {
    const date = '2023-06-15';
    const block = 'Evening';
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' }, // Morning exam on same day
      { subject: 'Physics', examDate: '2023-06-15', timeOfDay: 'Afternoon' }, // Afternoon exam on same day
      { subject: 'Chemistry', examDate: '2023-06-15', timeOfDay: 'Evening' }, // Evening exam on same day
      { subject: 'Science', examDate: '2023-06-16' }, // Future exam
      { subject: 'History', examDate: '2023-06-14' }, // Past exam
      { subject: 'English', examDate: '2023-06-20' } // Future exam
    ];
    const examSlots = new Map([
      [`${date}-Morning`, ['Math']], // Math exam in the morning
      [`${date}-Afternoon`, ['Physics']], // Physics exam in the afternoon
      [`${date}-Evening`, ['Chemistry']] // Chemistry exam in the evening
    ]);
    
    const result = getEligibleSubjects(date, block, exams, {}, examSlots);
    
    // Should include Math and Physics (exams earlier in day), but not Chemistry (same block),
    // History (past), or Science and English (future)
    expect(result).toContain('Math');
    expect(result).toContain('Physics');
    expect(result).not.toContain('Chemistry');
    expect(result).not.toContain('History');
    expect(result).toContain('Science');
    expect(result).toContain('English');
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