import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTimetable } from './timetableGenerator';
import { parseISO, format, addDays } from 'date-fns';
import { createDateRange, getDayOfWeek } from './dateUtils';
import * as Sentry from '@sentry/browser';
import { getEligibleSubjects } from './getEligibleSubjects';

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
  areSameDay: vi.fn((date1, date2) => {
    return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
  }),
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

vi.mock('./utils/examUtils', () => ({
  createExamSlotsMap: vi.fn(exams => {
    const slotsMap = new Map();
    exams.forEach(exam => {
      const key = `${exam.examDate}-${exam.timeOfDay}`;
      if (!slotsMap.has(key)) {
        slotsMap.set(key, []);
      }
      slotsMap.get(key).push(exam.subject);
    });
    return slotsMap;
  }),
  sortExamsByDate: vi.fn(exams => [...exams].sort((a, b) => 
    parseISO(a.examDate).getTime() - parseISO(b.examDate).getTime()
  )),
}));

// Update getEligibleSubjects mock to align with our new implementation
vi.mock('./getEligibleSubjects', () => ({
  getEligibleSubjects: vi.fn((date, block, exams, subjectCounts, examSlots) => {
    // Check if this is an exam slot first
    const slotKey = `${date}-${block}`;
    if (examSlots.has(slotKey)) {
      return [];
    }
    
    // Return all subjects except those with exams on this day
    return exams
      .filter(exam => {
        // Don't include subjects with exams on this day at all
        return exam.examDate !== date;
      })
      .map(exam => exam.subject);
  }),
}));

describe('generateTimetable', () => {
  const revisionTimes = {
    monday: ['Morning', 'Afternoon', 'Evening'],
    tuesday: ['Morning', 'Afternoon', 'Evening'],
    wednesday: ['Morning', 'Afternoon', 'Evening'],
    thursday: ['Morning', 'Afternoon', 'Evening'],
    friday: ['Morning', 'Afternoon', 'Evening'],
    saturday: ['Morning', 'Afternoon', 'Evening'], // Add weekend days
    sunday: ['Morning', 'Afternoon', 'Evening'],
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
    vi.mocked(getEligibleSubjects).mockClear();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    vi.clearAllMocks();
  });
  
  it('should prioritize creating pre-exam sessions before regular sessions', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Ensure date range includes the exam dates
    vi.mocked(createDateRange).mockReturnValueOnce([
      '2023-06-14', '2023-06-15', '2023-06-16', 
      '2023-06-19', '2023-06-20', '2023-06-21'
    ]);
    
    // Make getDayOfWeek return expected values for testing
    vi.mocked(getDayOfWeek).mockImplementation(date => {
      if (date === '2023-06-14' || typeof date === 'object') return 'wednesday';
      if (date === '2023-06-19') return 'monday';
      if (date === '2023-06-20') return 'tuesday';
      return 'monday'; // default
    });
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Check if the first sessions are pre-exam sessions
    const mathPreExamSession = timetable.find(
      session => session.subject === 'Math' && session.date === '2023-06-14' && session.block === 'Evening'
    );
    
    const sciencePreExamSession = timetable.find(
      session => session.subject === 'Science' && session.date === '2023-06-19' && session.block === 'Evening'
    );
    
    // Verify we have these pre-exam sessions
    expect(mathPreExamSession).toBeTruthy();
    expect(sciencePreExamSession).toBeTruthy();
  });
  
  it('should NOT allow revision sessions for a subject on the day of its exam', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Ensure date range includes the exam dates
    vi.mocked(createDateRange).mockReturnValueOnce([
      '2023-06-14', '2023-06-15', '2023-06-16', 
      '2023-06-19', '2023-06-20', '2023-06-21'
    ]);
    
    // Make sure getEligibleSubjects returns without subjects that have exams on that day
    vi.mocked(getEligibleSubjects).mockImplementation((date, block, exams) => {
      if (date === '2023-06-15') return ['Science']; // Only Science on Math exam day
      if (date === '2023-06-20') return ['Math']; // Only Math on Science exam day
      return ['Math', 'Science']; // Both on other days
    });
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Check that there are no Math sessions on Math exam day
    const mathSessionsOnExamDay = timetable.filter(
      session => session.subject === 'Math' && session.date === '2023-06-15'
    );
    
    // Check that there are no Science sessions on Science exam day
    const scienceSessionsOnExamDay = timetable.filter(
      session => session.subject === 'Science' && session.date === '2023-06-20'
    );
    
    expect(mathSessionsOnExamDay.length).toBe(0);
    expect(scienceSessionsOnExamDay.length).toBe(0);
  });
  
  it('should prioritize sessions on the day before when possible', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Ensure date range includes the exam dates
    vi.mocked(createDateRange).mockReturnValueOnce([
      '2023-06-14', '2023-06-15', '2023-06-16', 
      '2023-06-19', '2023-06-20', '2023-06-21'
    ]);
    
    // Make getDayOfWeek return expected values for testing
    vi.mocked(getDayOfWeek).mockImplementation(date => {
      if (date === '2023-06-14' || typeof date === 'object') return 'wednesday';
      if (date === '2023-06-19') return 'monday';
      return 'monday'; // default
    });
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Check that we have pre-exam sessions on the day before both exams
    const dayBeforeMathExam = timetable.filter(
      session => session.date === '2023-06-14' && session.subject === 'Math'
    );
    
    const dayBeforeScienceExam = timetable.filter(
      session => session.date === '2023-06-19' && session.subject === 'Science'
    );
    
    expect(dayBeforeMathExam.length).toBeGreaterThan(0);
    expect(dayBeforeScienceExam.length).toBeGreaterThan(0);
  });
  
  it('should generate valid timetable entries', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Generate a reasonable number of dates for testing
    const dates = [];
    for (let i = 1; i <= 21; i++) {
      dates.push(`2023-06-${String(i).padStart(2, '0')}`);
    }
    vi.mocked(createDateRange).mockReturnValueOnce(dates);
    
    // Ensure we return subjects for most slots
    vi.mocked(getEligibleSubjects).mockImplementation((date, block) => {
      // Return empty array only for actual exam slots
      if (date === '2023-06-15' && block === 'Morning') return [];
      if (date === '2023-06-20' && block === 'Afternoon') return [];
      
      // Don't return Math on its exam day
      if (date === '2023-06-15') return ['Science'];
      
      // Don't return Science on its exam day
      if (date === '2023-06-20') return ['Math'];
      
      return ['Math', 'Science'];
    });
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Verify the timetable is not empty
    expect(timetable.length).toBeGreaterThan(0);
    
    // Verify each entry has the expected properties
    timetable.forEach(entry => {
      expect(entry).toHaveProperty('date');
      expect(entry.date).toBeTruthy();
      expect(entry).toHaveProperty('block');
      expect(entry).toHaveProperty('subject');
      expect(entry).toHaveProperty('startTime');
      expect(entry).toHaveProperty('endTime');
      expect(entry).toHaveProperty('isUserCreated', false);
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