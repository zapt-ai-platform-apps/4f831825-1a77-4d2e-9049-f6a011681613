import { describe, it, expect, vi } from 'vitest';
import { enforcePreExamSession } from './enforcePreExamSession';
import { formatDateToString, getDayOfWeek } from './dateUtils';
import { parseISO } from 'date-fns';

// Mock the dateUtils functions
vi.mock('./dateUtils', () => ({
  formatDateToString: vi.fn(date => typeof date === 'string' ? date : date.toISOString().split('T')[0]),
  getDayOfWeek: vi.fn(date => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(date).getDay()];
  })
}));

describe('enforcePreExamSession', () => {
  const revisionTimes = {
    monday: ['Morning', 'Afternoon', 'Evening'],
    tuesday: ['Morning', 'Afternoon', 'Evening'],
    wednesday: ['Morning', 'Afternoon', 'Evening'],
    thursday: ['Morning', 'Afternoon', 'Evening'],
    friday: ['Morning', 'Afternoon', 'Evening'],
    saturday: ['Morning', 'Afternoon', 'Evening'],
    sunday: ['Morning', 'Afternoon', 'Evening'],
  };
  
  it('should not add a revision session at the same time as an exam', () => {
    const exams = [
      { examDate: '2023-06-15', timeOfDay: 'Morning', subject: 'Math' }
    ];
    
    const timetableEntries = [];
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Check that there's no session at the same time as the exam
    const examDayMorningSession = result.find(
      entry => entry.date === '2023-06-15' && entry.block === 'Morning'
    );
    
    expect(examDayMorningSession).toBeUndefined();
  });
  
  it('should allow pre-exam sessions for a subject on the day before its exam', () => {
    const exams = [
      { examDate: '2023-06-15', timeOfDay: 'Morning', subject: 'Math' }
    ];
    
    const timetableEntries = [];
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Check that a session was added for Math on the evening before
    const mathPreExamSession = result.find(
      entry => entry.date === '2023-06-14' && entry.block === 'Evening' && entry.subject === 'Math'
    );
    
    expect(mathPreExamSession).toBeTruthy();
  });
  
  it('should not add a session in a time slot where another exam exists', () => {
    const exams = [
      { examDate: '2023-06-15', timeOfDay: 'Morning', subject: 'Math' },
      { examDate: '2023-06-14', timeOfDay: 'Evening', subject: 'History' }
    ];
    
    const timetableEntries = [];
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Check that no evening session was added for Math on June 14th because History has an exam then
    const mathEveningSession = result.find(
      entry => entry.date === '2023-06-14' && entry.block === 'Evening' && entry.subject === 'Math'
    );
    
    expect(mathEveningSession).toBeUndefined();
  });
  
  it('should handle multiple exams on the same day', () => {
    const exams = [
      { examDate: '2023-06-15', timeOfDay: 'Morning', subject: 'Math' },
      { examDate: '2023-06-15', timeOfDay: 'Afternoon', subject: 'Science' }
    ];
    
    const timetableEntries = [];
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Neither exam should have a session at its time slot
    const mathMorningSession = result.find(
      entry => entry.date === '2023-06-15' && entry.block === 'Morning'
    );
    const scienceAfternoonSession = result.find(
      entry => entry.date === '2023-06-15' && entry.block === 'Afternoon'
    );
    
    expect(mathMorningSession).toBeUndefined();
    expect(scienceAfternoonSession).toBeUndefined();
  });
  
  it('should not add any revision session on a day with an exam', () => {
    const exams = [
      { examDate: '2023-06-15', timeOfDay: 'Morning', subject: 'Math' }
    ];
    
    const timetableEntries = [];
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Check that no sessions were added on the exam day at any time
    const examDaySessions = result.filter(entry => entry.date === '2023-06-15');
    
    expect(examDaySessions.length).toBe(0);
  });
});