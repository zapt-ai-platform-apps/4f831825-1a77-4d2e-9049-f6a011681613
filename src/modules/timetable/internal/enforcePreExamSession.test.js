import { describe, it, expect, vi } from 'vitest';
import { enforcePreExamSession } from './enforcePreExamSession';
import { formatDateToString, getDayOfWeek } from './dateUtils';

// Mock dependencies
vi.mock('./dateUtils', () => ({
  formatDateToString: vi.fn(date => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }),
  getDayOfWeek: vi.fn(() => 'monday'),
}));

vi.mock('./sessionUtils', () => ({
  createSession: vi.fn((date, block, subject) => ({
    date,
    block,
    subject,
    startTime: '09:00',
    endTime: '12:00',
    isUserCreated: false,
  })),
}));

describe('enforcePreExamSession', () => {
  it('should return empty array if no exams provided', () => {
    const result = enforcePreExamSession([], [], {}, '2023-06-01');
    expect(result).toEqual([]);
  });

  it('should add pre-exam session for each exam', () => {
    const exams = [
      { 
        subject: 'Math', 
        examDate: '2023-06-15', 
        timeOfDay: 'Morning' 
      }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      monday: ['Morning', 'Afternoon', 'Evening'],
      tuesday: ['Morning', 'Afternoon', 'Evening'],
      wednesday: ['Morning', 'Afternoon', 'Evening'],
      thursday: ['Morning', 'Afternoon', 'Evening'],
      friday: ['Morning', 'Afternoon', 'Evening'],
    };
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // We expect to add a session - either the day before or same day depending on availability
    expect(result.length).toBeGreaterThan(0);
    
    // Check that the added session is for the correct subject
    const addedSession = result.find(e => e.subject === 'Math');
    expect(addedSession).toBeDefined();
    
    // Check that the added session has all required properties
    expect(addedSession).toHaveProperty('date');
    expect(addedSession).toHaveProperty('block');
    expect(addedSession).toHaveProperty('subject', 'Math');
    expect(addedSession).toHaveProperty('startTime');
    expect(addedSession).toHaveProperty('endTime');
  });

  it('should not create sessions that conflict with exams', () => {
    const exams = [
      { 
        subject: 'Math', 
        examDate: '2023-06-15', 
        timeOfDay: 'Morning' 
      },
      { 
        subject: 'Science', 
        examDate: '2023-06-15', 
        timeOfDay: 'Afternoon' 
      }
    ];
    
    const timetableEntries = [];
    
    const revisionTimes = {
      monday: ['Morning', 'Afternoon', 'Evening'],
    };
    
    // Mock getDayOfWeek to always return 'monday' for this test
    vi.mocked(getDayOfWeek).mockReturnValue('monday');
    
    const result = enforcePreExamSession(exams, timetableEntries, revisionTimes, '2023-06-01');
    
    // Verify we don't have any sessions on exam day at exam times
    const conflictingSessions = result.filter(
      session => session.date === '2023-06-15' && 
                (session.block === 'Morning' || session.block === 'Afternoon')
    );
    
    expect(conflictingSessions.length).toBe(0);
  });
});