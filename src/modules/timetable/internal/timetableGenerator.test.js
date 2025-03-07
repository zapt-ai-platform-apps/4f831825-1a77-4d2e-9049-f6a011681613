import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTimetable } from './timetableGenerator';
import { parseISO, format, addDays } from 'date-fns';
import { createDateRange, getDayOfWeek } from './dateUtils';
import * as Sentry from '@sentry/browser';

// Mock Sentry
vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));

// Mock dependencies
vi.mock('../../exams/internal/examUtils', () => ({
  sortExamsByDate: vi.fn(exams => [...exams].sort((a, b) => 
    parseISO(a.examDate).getTime() - parseISO(b.examDate).getTime()
  )),
  filterUpcomingExams: vi.fn(exams => exams.filter(exam => 
    parseISO(exam.examDate) > new Date(2023, 0, 1)
  )),
}));

vi.mock('./dateUtils', () => ({
  createDateRange: vi.fn((start, end) => {
    // Fixed implementation to avoid date mutation issues
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const dates = [];
    
    // Generate dates properly without mutating date object
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
      // Use date-fns addDays instead of direct mutation
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  }),
  getDayOfWeek: vi.fn(date => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[parseISO(date).getDay()];
  }),
  formatDateToString: vi.fn(date => format(date, 'yyyy-MM-dd')),
}));

vi.mock('./enforcePreExamSession', () => ({
  enforcePreExamSession: vi.fn((exams, entries) => entries),
}));

// Fix the mock implementation for createSession to always include date
vi.mock('./sessionUtils', () => ({
  createSession: vi.fn((date, block, subject) => {
    if (!date) {
      console.error('createSession called without date parameter');
    }
    return {
      date,
      block,
      subject,
      startTime: '09:00',
      endTime: '12:00',
      isUserCreated: false,
    };
  }),
}));

vi.mock('./utils/sessionSorter', () => ({
  sortSessionsByBlock: vi.fn(sessions => sessions),
}));

vi.mock('../../core/internal/helpers', () => ({
  generateId: vi.fn(() => 'test-id'),
}));

// Mock getEligibleSubjects to always return all subjects for testing
vi.mock('./getEligibleSubjects', () => ({
  getEligibleSubjects: vi.fn((date, block, exams, subjectCounts) => {
    return exams.map(exam => exam.subject);
  }),
}));

describe('generateTimetable', () => {
  const revisionTimes = {
    monday: ['Morning', 'Afternoon', 'Evening'],
    tuesday: ['Morning', 'Afternoon', 'Evening'],
    wednesday: ['Morning', 'Afternoon', 'Evening'],
    thursday: ['Morning', 'Afternoon', 'Evening'],
    friday: ['Morning', 'Afternoon', 'Evening'],
  };
  
  const blockTimes = {
    Morning: { startTime: '09:00', endTime: '12:00' },
    Afternoon: { startTime: '13:00', endTime: '16:00' },
    Evening: { startTime: '17:00', endTime: '20:00' },
  };
  
  // Mock console.error to not pollute test output
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  
  beforeEach(() => {
    console.error = vi.fn();
    console.log = vi.fn();
    console.warn = vi.fn();
    
    // Reset mock implementations before each test
    vi.mocked(createDateRange).mockClear();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    vi.clearAllMocks();
  });
  
  it('should allow revision sessions later in the day after an exam', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Mock implementation to include exam dates
    vi.mocked(createDateRange).mockReturnValue([
      '2023-06-14', '2023-06-15', '2023-06-16', 
      '2023-06-19', '2023-06-20', '2023-06-21'
    ]);
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Verify we have sessions on exam days but in different time blocks
    const sessionOnMathExamDay = timetable.filter(session => 
      session.date === '2023-06-15' && session.block !== 'Morning'
    );
    
    const sessionOnScienceExamDay = timetable.filter(session => 
      session.date === '2023-06-20' && session.block !== 'Afternoon'
    );
    
    // We should have at least some sessions on exam days in different blocks
    expect(sessionOnMathExamDay.length + sessionOnScienceExamDay.length).toBeGreaterThan(0);
    
    // Log the sessions for better debugging
    console.log('Sessions on Math exam day (should include Afternoon/Evening):', 
      sessionOnMathExamDay.map(s => `${s.date} ${s.block} ${s.subject}`));
    console.log('Sessions on Science exam day (should include Morning/Evening):', 
      sessionOnScienceExamDay.map(s => `${s.date} ${s.block} ${s.subject}`));
  });
  
  it('should generate valid timetable entries', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Mock implementation with several dates
    vi.mocked(createDateRange).mockImplementation(() => {
      const dates = [];
      // Generate dates including exam days
      for (let i = 1; i <= 21; i++) {
        dates.push(`2023-06-${String(i).padStart(2, '0')}`);
      }
      return dates;
    });
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Verify the timetable is not empty
    expect(timetable.length).toBeGreaterThan(0);
    
    // Verify each entry has the expected properties
    timetable.forEach(entry => {
      expect(entry).toHaveProperty('date');
      expect(entry.date).toBeTruthy(); // Ensure date is not null or undefined
      expect(entry).toHaveProperty('block');
      expect(entry).toHaveProperty('subject');
      expect(entry).toHaveProperty('startTime');
      expect(entry).toHaveProperty('endTime');
      expect(entry).toHaveProperty('isUserCreated', false);
      expect(entry).toHaveProperty('id', 'test-id');
    });
  });
  
  it('should return an empty array if no exams are provided', async () => {
    await expect(generateTimetable([], '2023-06-01', revisionTimes, blockTimes))
      .resolves.toEqual([]);
    expect(console.warn).toHaveBeenCalledWith('No upcoming exams found');
  });
  
  it('should throw an error if no revision times are selected', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
    ];
    
    await expect(generateTimetable(exams, '2023-06-01', {}, blockTimes))
      .rejects.toThrow('No revision times selected');
  });
  
  it('should correctly handle multiple time slots on exam days', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-15', timeOfDay: 'Afternoon' },
      { id: 3, subject: 'History', examDate: '2023-06-16', timeOfDay: 'Evening' },
    ];
    
    const startDate = '2023-06-01';
    
    // Mock implementation with exam days
    vi.mocked(createDateRange).mockReturnValue(['2023-06-15', '2023-06-16']);
    
    // Ensure all days have all revision times available
    vi.mocked(getDayOfWeek).mockImplementation(() => 'monday');
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Check for sessions in the Evening on Math/Science exam day
    const eveningSessionsOnFirstDay = timetable.filter(session => 
      session.date === '2023-06-15' && session.block === 'Evening'
    );
    
    // Check for sessions in the Morning/Afternoon on History exam day
    const morningAfternoonSessionsOnSecondDay = timetable.filter(session => 
      session.date === '2023-06-16' && (session.block === 'Morning' || session.block === 'Afternoon')
    );
    
    // We should have Evening sessions on the Math/Science exam day
    expect(eveningSessionsOnFirstDay.length).toBeGreaterThan(0);
    
    // We should have Morning/Afternoon sessions on the History exam day
    expect(morningAfternoonSessionsOnSecondDay.length).toBeGreaterThan(0);
    
    // Log the sessions for better debugging
    console.log('Evening sessions on Math/Science exam day:', 
      eveningSessionsOnFirstDay.map(s => `${s.date} ${s.block} ${s.subject}`));
    console.log('Morning/Afternoon sessions on History exam day:', 
      morningAfternoonSessionsOnSecondDay.map(s => `${s.date} ${s.block} ${s.subject}`));
  });
});
