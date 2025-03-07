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

  it('should add a pre-exam session for a morning exam', () => {
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

  it('should add a pre-exam session for an afternoon exam', () => {
    const exams = [
      { subject: 'Science', examDate: '2023-06-15', timeOfDay: 'Afternoon' }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      thursday: ['Morning', 'Afternoon'] // June 15, 2023 is a Thursday
    };
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should add a Morning session on June 15 for Science
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(expect.objectContaining({
      date: '2023-06-15',
      block: 'Morning',
      subject: 'Science'
    }));
  });

  it('should not add a session that conflicts with an exam', () => {
    const exams = [
      { subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { subject: 'Science', examDate: '2023-06-15', timeOfDay: 'Afternoon' }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      thursday: ['Morning', 'Afternoon'] // June 15, 2023 is a Thursday
    };
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should not add any sessions on a day with exams
    expect(result.length).toBe(0);
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
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Should update the existing Evening session on June 14 to Math
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(expect.objectContaining({
      date: '2023-06-14',
      block: 'Evening',
      subject: 'Math'
    }));
  });
});