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

  it('should update an existing session if it exists and is closest to the exam', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' }
    ];
    
    const timetableEntries = [
      { date: '2023-06-14', block: 'Evening', subject: 'History' }
    ];
    
    const revisionTimes = {
      wednesday: ['Evening'] // June 14, 2023 is a Wednesday
    };
    
    // Force getDayOfWeek to return wednesday for the date
    vi.mocked(getDayOfWeek).mockReturnValue('wednesday');
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should update the existing Evening session on June 14 to Math
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(expect.objectContaining({
      date: '2023-06-14',
      block: 'Evening',
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
    
    // We should create revision sessions for both exams
    expect(result.length).toBe(2);
    
    // The Afternoon revision on the day before should be for Chemistry
    const chemistrySession = result.find(
      session => session.date === '2023-06-20' && session.block === 'Afternoon'
    );
    expect(chemistrySession).toBeTruthy();
    expect(chemistrySession.subject).toBe('Chemistry');
    
    // The Evening revision on the day before should be for Maths
    const mathsSession = result.find(
      session => session.date === '2023-06-20' && session.block === 'Evening'
    );
    expect(mathsSession).toBeTruthy();
    expect(mathsSession.subject).toBe('Maths');
  });
});