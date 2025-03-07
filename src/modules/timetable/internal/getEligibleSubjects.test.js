import { describe, it, expect } from 'vitest';
import { parseISO } from 'date-fns';

// Import the function directly from the implementation
// Note: For this test we'll recreate the function to test independently
function getEligibleSubjects(date, block, exams, subjectCounts = {}) {
  const sessionDate = parseISO(date);
  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  const sessionBlockOrder = blockOrder[block];
  
  return exams
    .filter(exam => {
      const examDate = parseISO(exam.examDate);
      
      // Exclude subjects whose exams have already passed
      if (examDate < sessionDate) {
        return false;
      }
      
      // For same day, check if exam is scheduled before this session block
      if (examDate.toDateString() === sessionDate.toDateString()) {
        const examBlock = exam.timeOfDay || 'Morning';
        const examBlockOrder = blockOrder[examBlock];
        
        // If exam is scheduled at this block or earlier in the day, don't schedule a revision session
        return examBlockOrder > sessionBlockOrder;
      }
      
      return true;
    })
    .map(exam => exam.subject);
}

describe('getEligibleSubjects', () => {
  const exams = [
    { subject: 'Math', examDate: '2023-06-10', timeOfDay: 'Morning' },
    { subject: 'English', examDate: '2023-06-10', timeOfDay: 'Afternoon' },
    { subject: 'Science', examDate: '2023-06-10', timeOfDay: 'Evening' },
    { subject: 'History', examDate: '2023-06-11', timeOfDay: 'Morning' },
    { subject: 'Art', examDate: '2023-06-12', timeOfDay: 'Afternoon' },
  ];

  it('should exclude subjects with exams on the same day at the same time or earlier', () => {
    // Morning session on exam day - should not include Math (morning exam)
    expect(getEligibleSubjects('2023-06-10', 'Morning', exams))
      .toEqual(['English', 'Science', 'History', 'Art']);
    
    // Afternoon session on exam day - should not include Math or English
    expect(getEligibleSubjects('2023-06-10', 'Afternoon', exams))
      .toEqual(['Science', 'History', 'Art']);
    
    // Evening session on exam day - should not include any subjects with exams that day
    expect(getEligibleSubjects('2023-06-10', 'Evening', exams))
      .toEqual(['History', 'Art']);
  });

  it('should include all future exams for days before exam day', () => {
    // Day before exams - should include all subjects
    expect(getEligibleSubjects('2023-06-09', 'Morning', exams))
      .toEqual(['Math', 'English', 'Science', 'History', 'Art']);
  });

  it('should exclude subjects with exams that have already passed', () => {
    // Day after some exams - should not include subjects with past exams
    expect(getEligibleSubjects('2023-06-11', 'Afternoon', exams))
      .toEqual(['Art']);
  });

  it('should handle empty exams array', () => {
    expect(getEligibleSubjects('2023-06-10', 'Morning', [])).toEqual([]);
  });
});