import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTimetable } from './timetableGenerator';
import { parseISO, format } from 'date-fns';
import { createDateRange } from './dateUtils';

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
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const dates = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate.setDate(currentDate.getDate() + 1);
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
  enforcePreExamSession: vi.fn(entries => entries.map(entry => ({...entry}))),
}));

vi.mock('./sessionUtils', () => ({
  createSession: vi.fn((date, block, subject) => ({
    date, // Ensure date is included
    block,
    subject,
    startTime: '09:00',
    endTime: '12:00',
    isUserCreated: false,
  })),
}));

vi.mock('./utils/sessionSorter', () => ({
  sortSessionsByBlock: vi.fn(sessions => sessions),
}));

vi.mock('../../core/internal/helpers', () => ({
  generateId: vi.fn(() => 'test-id'),
}));

describe('generateTimetable', () => {
  const revisionTimes = {
    monday: ['Morning', 'Afternoon'],
    tuesday: ['Morning', 'Afternoon'],
    wednesday: ['Morning', 'Afternoon'],
    thursday: ['Morning', 'Afternoon'],
    friday: ['Morning', 'Afternoon'],
  };
  
  const blockTimes = {
    Morning: { startTime: '09:00', endTime: '12:00' },
    Afternoon: { startTime: '13:00', endTime: '16:00' },
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
  
  it('should not schedule any revision sessions on days with exams', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Mock implementation of createDateRange to return a limited set for testing
    vi.mocked(createDateRange).mockReturnValue([
      '2023-06-14', '2023-06-15', '2023-06-16', 
      '2023-06-19', '2023-06-20', '2023-06-21'
    ]);
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Check that no revision sessions are scheduled on days with exams
    const sessionsOnExamDays = timetable.filter(session => 
      session.date === '2023-06-15' || session.date === '2023-06-20'
    );
    
    expect(sessionsOnExamDays.length).toBe(0);
  });
  
  it('should generate valid timetable entries', async () => {
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
      { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' },
    ];
    
    const startDate = '2023-06-01';
    
    // Mock implementation of createDateRange to return a limited set for testing
    vi.mocked(createDateRange).mockReturnValue([
      '2023-06-01', '2023-06-02', '2023-06-05', '2023-06-06',
      '2023-06-07', '2023-06-08', '2023-06-09', '2023-06-12',
      '2023-06-13', '2023-06-14', '2023-06-15', '2023-06-16',
      '2023-06-19', '2023-06-20'
    ]);
    
    const timetable = await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Verify each entry has the expected properties
    timetable.forEach(entry => {
      expect(entry).toHaveProperty('date');
      expect(entry).toHaveProperty('block');
      expect(entry).toHaveProperty('subject');
      expect(entry).toHaveProperty('startTime');
      expect(entry).toHaveProperty('endTime');
      expect(entry).toHaveProperty('isUserCreated', false);
      expect(entry).toHaveProperty('id', 'test-id');
    });
  });
});