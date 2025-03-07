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
  });
  
  it('should not schedule revision for a subject on the same day before its exam', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Mock implementation with the exam day
    vi.mocked(createDateRange).mockReturnValue(['2023-06-15']);
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Verify we don't have any Math sessions in the Morning on the exam day
    const mathMorningSessions = timetable.filter(session => 
      session.date === '2023-06-15' && session.block === 'Morning' && session.subject === 'Math'
    );
    
    expect(mathMorningSessions.length).toBe(0);
  });
  
  it('should allow revision for a subject on the same day after its exam', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-16', timeOfDay: 'Morning' },
    ];
    
    const startDate = '2023-06-01';
    
    // Mock implementation with specific dates
    vi.mocked(createDateRange).mockReturnValue(['2023-06-15', '2023-06-16']);
    
    // Ensure we can get available sessions later in the day for Math
    vi.mocked(getDayOfWeek).mockImplementation(date => {
      return 'monday'; // All days return monday to ensure revision times are available
    });
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Check that we can have Math sessions in the afternoon or evening of the same day as its exam
    const mathLaterSessions = timetable.filter(session => 
      session.date === '2023-06-15' && 
      (session.block === 'Afternoon' || session.block === 'Evening') && 
      session.subject === 'Math'
    );
    
    // We should now allow Math sessions after its morning exam
    // This test was previously expecting 0, but now we want to allow these sessions
    expect(mathLaterSessions.length).toBeGreaterThan(0);
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
});