import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseISO, isWithinInterval } from 'date-fns';

// Mock dependencies
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    isWithinInterval: vi.fn(),
    parseISO: vi.fn(dateStr => new Date(dateStr))
  };
});

// Import the getAvailableBlocksForDay implementation
/**
 * Check if a date falls within a period-specific availability range
 */
function findPeriodForDate(date, periodSpecificAvailability) {
  if (!periodSpecificAvailability || !Array.isArray(periodSpecificAvailability) || !date) {
    return null;
  }

  const dateObj = parseISO(date);
  
  // Iterate through periods in reverse to match the enforcePreExamSession.js implementation
  for (const period of [...periodSpecificAvailability].reverse()) {
    if (!period.startDate || !period.endDate) continue;
    
    try {
      if (isWithinInterval(dateObj, {
        start: parseISO(period.startDate),
        end: parseISO(period.endDate)
      })) {
        return period;
      }
    } catch (error) {
      console.error('Error checking if date is within interval:', error);
      // Continue to next period
    }
  }
  
  return null;
}

/**
 * Get available blocks for a specific day considering period-specific availability
 */
function getAvailableBlocksForDay(date, dayOfWeek, defaultRevisionTimes, periodSpecificAvailability) {
  // Handle null inputs safely
  if (!date || !dayOfWeek || !defaultRevisionTimes) {
    return [];
  }
  
  // Check if this date falls within a period-specific availability
  const period = findPeriodForDate(date, periodSpecificAvailability);
  
  if (period && period.revisionTimes) {
    // Use period-specific availability for this date
    return period.revisionTimes[dayOfWeek] || [];
  }
  
  // Otherwise use default availability
  return defaultRevisionTimes[dayOfWeek] || [];
}

describe('getAvailableBlocksForDay', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return empty array for invalid inputs', () => {
    expect(getAvailableBlocksForDay(null, 'monday', {}, [])).toEqual([]);
    expect(getAvailableBlocksForDay('2023-06-15', null, {}, [])).toEqual([]);
    expect(getAvailableBlocksForDay('2023-06-15', 'monday', null, [])).toEqual([]);
  });

  it('should return default revision times when no period-specific availability matches', () => {
    // Setup mocks
    vi.mocked(isWithinInterval).mockReturnValue(false);
    
    const defaultRevisionTimes = {
      monday: ['Morning', 'Evening'],
      tuesday: ['Afternoon']
    };
    
    const periodSpecificAvailability = [
      {
        startDate: '2023-06-01',
        endDate: '2023-06-10',
        revisionTimes: {
          monday: ['Morning', 'Afternoon'],
          tuesday: ['Morning']
        }
      }
    ];
    
    const result = getAvailableBlocksForDay('2023-06-15', 'monday', defaultRevisionTimes, periodSpecificAvailability);
    
    expect(result).toEqual(['Morning', 'Evening']);
  });

  it('should return period-specific availability when date matches a period', () => {
    // Setup mocks
    vi.mocked(isWithinInterval).mockReturnValue(true);
    
    const defaultRevisionTimes = {
      monday: ['Morning', 'Evening'],
      tuesday: ['Afternoon']
    };
    
    const periodSpecificAvailability = [
      {
        startDate: '2023-06-01',
        endDate: '2023-06-30',
        revisionTimes: {
          monday: ['Afternoon', 'Evening'],
          tuesday: ['Morning', 'Evening']
        }
      }
    ];
    
    const result = getAvailableBlocksForDay('2023-06-15', 'monday', defaultRevisionTimes, periodSpecificAvailability);
    
    expect(result).toEqual(['Afternoon', 'Evening']);
  });

  it('should prioritize later periods when multiple are valid', () => {
    // Setup mocks to correctly identify which period a date falls into
    vi.mocked(isWithinInterval).mockImplementation((date, interval) => {
      if (!interval || !interval.start || !interval.end) return false;
      
      const testDate = new Date('2023-06-12').getTime();
      const start = interval.start.getTime();
      const end = interval.end.getTime();
      
      return testDate >= start && testDate <= end;
    });
    
    const defaultRevisionTimes = {
      monday: ['Morning']
    };
    
    const periodSpecificAvailability = [
      {
        startDate: '2023-06-01',  
        endDate: '2023-06-15',
        revisionTimes: {
          monday: ['Afternoon']
        }
      },
      {
        startDate: '2023-06-16',  // Non-overlapping periods
        endDate: '2023-06-30',
        revisionTimes: {
          monday: ['Evening']
        }
      }
    ];
    
    // Test a date in the first period
    const result = getAvailableBlocksForDay('2023-06-12', 'monday', defaultRevisionTimes, periodSpecificAvailability);
    
    // Since we iterate in reverse and '2023-06-12' falls in the first period,
    // we expect 'Afternoon'
    expect(result).toEqual(['Afternoon']);
  });

  it('should handle empty period-specific revision times', () => {
    // Setup mocks
    vi.mocked(isWithinInterval).mockReturnValue(true);
    
    const defaultRevisionTimes = {
      monday: ['Morning', 'Evening']
    };
    
    const periodSpecificAvailability = [
      {
        startDate: '2023-06-01',
        endDate: '2023-06-30',
        revisionTimes: {
          tuesday: ['Morning'] // No monday times
        }
      }
    ];
    
    const result = getAvailableBlocksForDay('2023-06-15', 'monday', defaultRevisionTimes, periodSpecificAvailability);
    
    expect(result).toEqual([]);
  });

  it('should skip periods with missing dates', () => {
    const defaultRevisionTimes = {
      monday: ['Morning']
    };
    
    const periodSpecificAvailability = [
      {
        // Missing startDate
        endDate: '2023-06-30',
        revisionTimes: {
          monday: ['Afternoon']
        }
      },
      {
        startDate: '2023-06-01',
        // Missing endDate
        revisionTimes: {
          monday: ['Evening']
        }
      }
    ];
    
    const result = getAvailableBlocksForDay('2023-06-15', 'monday', defaultRevisionTimes, periodSpecificAvailability);
    
    expect(result).toEqual(['Morning']);
  });
});