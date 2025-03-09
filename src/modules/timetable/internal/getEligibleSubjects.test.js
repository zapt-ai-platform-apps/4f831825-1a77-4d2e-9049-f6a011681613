import { describe, it, expect } from 'vitest';
import { getEligibleSubjects } from './getEligibleSubjects';

describe('getEligibleSubjects', () => {
  it('should return empty array for invalid inputs', () => {
    expect(getEligibleSubjects()).toEqual([]);
    expect(getEligibleSubjects('2023-01-01')).toEqual([]);
    expect(getEligibleSubjects('2023-01-01', 'Morning')).toEqual([]);
    expect(getEligibleSubjects('2023-01-01', 'Morning', [])).toEqual([]);
  });

  it('should exclude subjects with exams on earlier dates', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-01-01', timeOfDay: 'Morning' },
      { subject: 'History', examDate: '2023-01-05', timeOfDay: 'Morning' }
    ];
    const subjectCounts = { Math: 0, History: 0 };
    const examSlots = new Map([['2023-01-01-Morning', ['Math']]]);
    
    const result = getEligibleSubjects('2023-01-02', 'Morning', exams, subjectCounts, examSlots);
    
    expect(result).toContain('History');
    expect(result).not.toContain('Math');
  });

  it('should exclude subjects with exams in the same block on the same day', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-01-01', timeOfDay: 'Morning' },
      { subject: 'History', examDate: '2023-01-01', timeOfDay: 'Afternoon' }
    ];
    const subjectCounts = { Math: 0, History: 0 };
    const examSlots = new Map([
      ['2023-01-01-Morning', ['Math']],
      ['2023-01-01-Afternoon', ['History']]
    ]);
    
    const result = getEligibleSubjects('2023-01-01', 'Morning', exams, subjectCounts, examSlots);
    
    expect(result).toEqual([]);
  });

  it('should allow subjects with exams later in the day', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-01-01', timeOfDay: 'Afternoon' },
      { subject: 'History', examDate: '2023-01-02', timeOfDay: 'Morning' }
    ];
    const subjectCounts = { Math: 0, History: 0 };
    const examSlots = new Map([['2023-01-01-Afternoon', ['Math']]]);
    
    const result = getEligibleSubjects('2023-01-01', 'Morning', exams, subjectCounts, examSlots);
    
    expect(result).toContain('Math');
  });

  it('should prioritize subjects with fewer assigned sessions', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-02-01', timeOfDay: 'Morning' },
      { subject: 'History', examDate: '2023-02-01', timeOfDay: 'Morning' },
      { subject: 'English', examDate: '2023-02-01', timeOfDay: 'Morning' }
    ];
    const subjectCounts = { Math: 3, History: 1, English: 2 };
    const examSlots = new Map();
    
    const result = getEligibleSubjects('2023-01-15', 'Afternoon', exams, subjectCounts, examSlots);
    
    // Should only return History since it has the lowest count
    expect(result).toEqual(['History']);
  });

  it('should handle the example scenario from the user request', () => {
    const exams = [
      { subject: 'English Literature', examDate: '2023-05-28', timeOfDay: 'Afternoon' },
      { subject: 'History', examDate: '2023-05-27', timeOfDay: 'Afternoon' }
    ];
    
    // Simulate that English Literature already has 2 sessions and History has 1
    const subjectCounts = { 'English Literature': 2, 'History': 1 };
    const examSlots = new Map([
      ['2023-05-27-Afternoon', ['History']],
      ['2023-05-28-Afternoon', ['English Literature']]
    ]);
    
    // Test for day 26 afternoon slot
    const result = getEligibleSubjects('2023-05-26', 'Afternoon', exams, subjectCounts, examSlots);
    
    // Should prioritize History since it has fewer sessions
    expect(result).toEqual(['History']);
  });
});