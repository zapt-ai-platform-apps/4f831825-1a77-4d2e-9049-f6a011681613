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

// Fix the mock implementation of getEligibleSubjects
vi.mock('./getEligibleSubjects', () => ({
  getEligibleSubjects: vi.fn((date, block, exams, subjectCounts, examSlots) => {
    // Check if this is an exam slot first
    const slotKey = `${date}-${block}`;
    if (examSlots.has(slotKey)) {
      return [];
    }
    
    // Otherwise return all subjects for the test
    return exams
      .filter(exam => {
        // Don't include subjects with exams on this day at a later time
        if (exam.examDate === date) {
          const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2 };
          const examTime = timeOrder[exam.timeOfDay];
          const currentTime = timeOrder[block];
          
          // Only return subjects with exams earlier in the day
          return examTime < currentTime;
        }
        return true;
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
  
  it('should allow revision sessions later in the day after an exam', async () => {
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
    
    // Make sure getEligibleSubjects returns at least one subject for non-exam slots
    vi.mocked(getEligibleSubjects).mockImplementation((date, block, exams) => {
      if (date === '2023-06-15' && block === 'Morning') return []; // exam slot
      if (date === '2023-06-20' && block === 'Afternoon') return []; // exam slot
      if (date === '2023-06-15' && block === 'Afternoon') return ['Math']; // Math had exam in morning
      return ['Math', 'Science']; // return subjects for non-exam slots
    });
    
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
      if (date === '2023-06-15' && block === 'Afternoon') return ['Math']; // Math had exam in morning
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
  
  it('should correctly handle multiple time slots on exam days', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-15', timeOfDay: 'Afternoon' },
      { id: 3, subject: 'History', examDate: '2023-06-16', timeOfDay: 'Evening' },
    ];
    
    const startDate = '2023-06-01';
    
    // Mock with sufficient dates including exam days
    vi.mocked(createDateRange).mockReturnValueOnce(['2023-06-15', '2023-06-16']);
    
    // Ensure all days have revision times available
    vi.mocked(getDayOfWeek).mockImplementation(() => 'monday');
    
    // Provide eligible subjects for non-exam slots
    vi.mocked(getEligibleSubjects).mockImplementation((date, block) => {
      // No subjects for exam slots
      if (date === '2023-06-15' && block === 'Morning') return [];
      if (date === '2023-06-15' && block === 'Afternoon') return [];
      if (date === '2023-06-16' && block === 'Evening') return [];
      
      // Return Math subject for sessions after its exam
      if (date === '2023-06-15' && block === 'Evening') return ['Math', 'Science'];
      
      // Return subjects for non-exam slots
      return ['Math', 'Science', 'History'];
    });
    
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
  });
});