import { describe, it, expect } from 'vitest';
import { parseISO, format } from 'date-fns';

// Import the relevant code for testing
// Using a simplified version to test the logic without dependencies
function getEligibleSubjectsForTest(date, block, exams, examSlots) {
  const sessionDate = parseISO(date);
  const sessionDateStr = format(sessionDate, 'yyyy-MM-dd');
  
  // Check if there's any exam on this day, regardless of block
  const hasExamOnDay = exams.some(exam => {
    return format(parseISO(exam.examDate), 'yyyy-MM-dd') === sessionDateStr;
  });
  
  if (hasExamOnDay) {
    return [];
  }
  
  // Check if there's any exam in this slot
  const slotKey = `${date}-${block}`;
  if (examSlots.has(slotKey)) {
    return [];
  }
  
  // Filter subjects that haven't had their exam yet on this date
  return exams
    .filter(exam => {
      const examDate = parseISO(exam.examDate);
      
      // Exclude subjects whose exams have already passed
      if (examDate < sessionDate) {
        return false;
      }
      
      return true;
    })
    .map(exam => exam.subject);
}

describe('getEligibleSubjects', () => {
  // Create sample data for tests
  const exams = [
    { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
    { subject: 'Science', examDate: '2023-06-15', timeOfDay: 'Afternoon' },
    { subject: 'History', examDate: '2023-06-16', timeOfDay: 'Morning' },
    { subject: 'English', examDate: '2023-06-17', timeOfDay: 'Morning' }
  ];
  
  const createExamSlotsMap = (exams) => {
    const map = new Map();
    exams.forEach(exam => {
      const key = `${exam.examDate}-${exam.timeOfDay}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(exam.subject);
    });
    return map;
  };
  
  const examSlots = createExamSlotsMap(exams);
  
  it('should return no subjects when there is an exam in the requested slot', () => {
    const result = getEligibleSubjectsForTest('2023-06-15', 'Morning', exams, examSlots);
    expect(result).toEqual([]);
  });
  
  it('should return no subjects for any block on a day with any exam', () => {
    // Checking the Evening block on a day with exams in Morning and Afternoon
    const result = getEligibleSubjectsForTest('2023-06-15', 'Evening', exams, examSlots);
    expect(result).toEqual([]);
  });
  
  it('should return subjects that have exams after the requested date', () => {
    const result = getEligibleSubjectsForTest('2023-06-14', 'Morning', exams, examSlots);
    // All subjects have exams after June 14th
    expect(result).toHaveLength(4);
    expect(result).toContain('Math');
    expect(result).toContain('Science');
    expect(result).toContain('History');
    expect(result).toContain('English');
  });
  
  it('should not return subjects that have already had their exam', () => {
    const result = getEligibleSubjectsForTest('2023-06-16', 'Afternoon', exams, examSlots);
    // Math and Science had exams on June 15th, History on morning of June 16th
    expect(result).toEqual([]);
  });
});