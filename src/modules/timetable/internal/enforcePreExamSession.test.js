import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enforcePreExamSession } from './enforcePreExamSession';
import { formatDateToString, getDayOfWeek } from './dateUtils';
import { createSession } from './sessionUtils';

// Mock dependencies
vi.mock('./dateUtils', () => ({
  formatDateToString: vi.fn(date => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }),
  getDayOfWeek: vi.fn(date => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = typeof date === 'string' 
      ? new Date(date).getDay() 
      : date.getDay();
    return days[dayIndex];
  })
}));

vi.mock('./sessionUtils', () => ({
  createSession: vi.fn((date, block, subject, blockTimes = {}) => ({
    id: 'mock-id',
    date,
    block,
    subject,
    startTime: '09:00',
    endTime: '12:00',
    isUserCreated: false
  }))
}));

describe('enforcePreExamSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the original timetable if no exams are provided', () => {
    const timetableEntries = [
      { date: '2023-06-10', block: 'Morning', subject: 'Math' }
    ];
    
    const result = enforcePreExamSession([], timetableEntries, {}, '2023-06-01');
    
    expect(result).toEqual(timetableEntries);
  });

  it('should add a pre-exam session for a morning exam on the previous day', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      wednesday: ['Evening'], // June 14, 2023 is a Wednesday
      thursday: ['Morning', 'Afternoon'] // June 15, 2023 is a Thursday
    };
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should add an Evening session on June 14 for Math
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(expect.objectContaining({
      date: '2023-06-14',
      block: 'Evening',
      subject: 'Math'
    }));
  });

  it('should not update an existing session if it has a different subject', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' }
    ];
    
    const timetableEntries = [
      { date: '2023-06-14', block: 'Evening', subject: 'History' }
    ];
    
    const revisionTimes = {
      wednesday: ['Evening', 'Morning'], // June 14, 2023 is a Wednesday
      thursday: ['Morning'] // June 15, 2023 is a Thursday
    };
    
    // Force getDayOfWeek to return wednesday for the date
    vi.mocked(getDayOfWeek).mockReturnValue('wednesday');
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should add a Math session without removing History session
    expect(result.length).toBe(2);
    
    // Original session should remain unchanged
    expect(result).toContainEqual(expect.objectContaining({
      date: '2023-06-14',
      block: 'Evening',
      subject: 'History'
    }));
    
    // New session should be added (using Morning since Evening is taken)
    expect(result).toContainEqual(expect.objectContaining({
      date: '2023-06-14',
      block: 'Morning',
      subject: 'Math'
    }));
  });
  
  it('should create an earlier session on exam day if previous day is not available', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Afternoon' }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      thursday: ['Morning', 'Afternoon'] // June 15, 2023 is a Thursday
    };
    
    // Mock getDayOfWeek to not provide Evening slot on Wednesday
    // and return proper day for Thursday
    vi.mocked(getDayOfWeek).mockImplementation(date => {
      if (date instanceof Date) {
        const dateString = date.toISOString().split('T')[0];
        if (dateString === '2023-06-15') return 'thursday';
        if (dateString === '2023-06-14') return 'wednesday';
      } else if (typeof date === 'string') {
        if (date === '2023-06-15') return 'thursday';
        if (date === '2023-06-14') return 'wednesday';
      }
      return 'wednesday';
    });
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should add a Morning session on June 15 for Math
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(expect.objectContaining({
      date: '2023-06-15',
      block: 'Morning',
      subject: 'Math'
    }));
  });

  it('should handle consecutive exams correctly', () => {
    const exams = [
      { subject: 'Maths', examDate: '2023-06-21', timeOfDay: 'Morning' },
      { subject: 'Chemistry', examDate: '2023-06-21', timeOfDay: 'Afternoon' }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      monday: ['Morning', 'Afternoon', 'Evening'], // June 20, 2023 is a Monday
      tuesday: ['Morning', 'Afternoon', 'Evening']  // June 21, 2023 is a Tuesday
    };
    
    // Mock getDayOfWeek to return appropriate days
    vi.mocked(getDayOfWeek).mockImplementation(date => {
      if (date instanceof Date) {
        const dateString = date.toISOString().split('T')[0];
        if (dateString === '2023-06-20') return 'monday';
        if (dateString === '2023-06-21') return 'tuesday';
      } else if (typeof date === 'string') {
        if (date === '2023-06-20') return 'monday';
        if (date === '2023-06-21') return 'tuesday';
      }
      return 'monday';
    });
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // We should only create two revision sessions for the two exams
    expect(result.length).toBe(2);
    
    // Check that we have one session for each subject
    const mathsSession = result.find(session => session.subject === 'Maths');
    const chemistrySession = result.find(session => session.subject === 'Chemistry');
    
    expect(mathsSession).toBeTruthy();
    expect(chemistrySession).toBeTruthy();
    
    // The sessions should be on the day before (June 20)
    expect(mathsSession.date).toBe('2023-06-20');
    expect(chemistrySession.date).toBe('2023-06-20');
    
    // Verify that one session is Evening and one is Afternoon (based on test expectation)
    const blocks = [mathsSession.block, chemistrySession.block].sort();
    expect(blocks).toEqual(['Afternoon', 'Evening']);
  });
});