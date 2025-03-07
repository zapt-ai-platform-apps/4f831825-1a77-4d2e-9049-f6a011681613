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

  it('should update an existing session if it exists', () => {
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

  it('should not add a revision session in the same slot as an exam', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { subject: 'Science', examDate: '2023-06-15', timeOfDay: 'Afternoon' }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      thursday: ['Morning', 'Afternoon', 'Evening'] // June 15, 2023 is a Thursday
    };
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should not add sessions for morning or afternoon on June 15 because there are exams in those slots
    const morningOrAfternoonSessions = result.filter(
      session => session.date === '2023-06-15' && (session.block === 'Morning' || session.block === 'Afternoon')
    );
    expect(morningOrAfternoonSessions.length).toBe(0);
  });

  it('should add a revision session on the same day as an exam but in a different slot', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      thursday: ['Morning', 'Afternoon', 'Evening'] // June 15, 2023 is a Thursday
    };
    
    // Mock getDayOfWeek to ensure it returns the right day of week
    vi.mocked(getDayOfWeek).mockReturnValue('thursday');
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // We should still find an appropriate slot for a pre-exam session
    expect(result.length).toBeGreaterThan(0);
  });
});