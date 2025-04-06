import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { captureTimetableError } from './errorUtils';
import * as Sentry from '@sentry/browser';

// Mock Sentry
vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));

describe('captureTimetableError', () => {
  // Mock console.error to avoid test output pollution
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });
  
  it('should log the error to console', () => {
    const error = new Error('Test error');
    const context = {
      exams: [{ id: 1, subject: 'Math', examDate: '2023-06-15' }],
      startDate: '2023-06-01',
      revisionTimes: { monday: ['Morning'] },
      blockTimes: { Morning: { startTime: '09:00', endTime: '12:00' } }
    };
    
    captureTimetableError(error, context);
    
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith('Timetable generation error:', error);
    expect(console.error).toHaveBeenCalledWith('Error context:', expect.any(String));
  });
  
  it('should send detailed context to Sentry', () => {
    const error = new Error('Test error');
    const context = {
      exams: [
        { id: 1, subject: 'Math', examDate: '2023-06-15', timeOfDay: 'Morning' },
        { id: 2, subject: 'Science', examDate: '2023-06-20', timeOfDay: 'Afternoon' }
      ],
      startDate: '2023-06-01',
      revisionTimes: { monday: ['Morning', 'Afternoon'] },
      blockTimes: { Morning: { startTime: '09:00', endTime: '12:00' } },
      location: 'test-location'
    };
    
    captureTimetableError(error, context);
    
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({
      extra: expect.objectContaining({
        exams: expect.any(Array),
        examCount: 2,
        examSubjects: ['Math', 'Science'],
        examsBySubject: { Math: 1, Science: 1 },
        examsByDate: { '2023-06-15': 1, '2023-06-20': 1 },
        startDate: '2023-06-01',
        revisionTimes: context.revisionTimes,
        blockTimes: context.blockTimes,
        errorLocation: 'test-location'
      }),
      tags: expect.objectContaining({
        component: 'timetableGenerator',
        errorType: 'generation_failure',
        location: 'test-location'
      })
    }));
  });
  
  it('should handle missing context values gracefully', () => {
    const error = new Error('Test error');
    const context = {
      // Incomplete context
      startDate: '2023-06-01'
    };
    
    captureTimetableError(error, context);
    
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({
      extra: expect.objectContaining({
        exams: [],
        examCount: 0,
        examSubjects: [],
        startDate: '2023-06-01',
        errorLocation: 'unknown'
      })
    }));
  });
});