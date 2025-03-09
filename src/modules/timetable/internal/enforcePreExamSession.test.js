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

  it('should not add a revision session in the same slot as an existing session', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { subject: 'Science', examDate: '2023-06-15', timeOfDay: 'Afternoon' }
    ];
    
    const timetableEntries = [
      { date: '2023-06-15', block: 'Morning', subject: 'English' },
      { date: '2023-06-15', block: 'Afternoon', subject: 'History' }
    ];
    
    const revisionTimes = {
      thursday: ['Morning', 'Afternoon', 'Evening'] // June 15, 2023 is a Thursday
    };
    
    // Ensure we're mocking getDayOfWeek correctly for the test
    vi.mocked(getDayOfWeek).mockImplementation(date => {
      if (date instanceof Date && date.toISOString().includes('2023-06-15') || 
          date === '2023-06-15') {
        return 'thursday';
      }
      return 'wednesday';
    });
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should update the existing sessions to match the exam subjects
    expect(result.length).toBe(2);
    
    // Should have updated the Morning session to Math
    expect(result).toContainEqual(expect.objectContaining({
      date: '2023-06-15',
      block: 'Morning',
      subject: 'Math'
    }));
    
    // Should have updated the Afternoon session to Science
    expect(result).toContainEqual(expect.objectContaining({
      date: '2023-06-15',
      block: 'Afternoon',
      subject: 'Science'
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
});