import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTimetable } from './timetableGenerator';
import * as timetableGeneratorCore from './timetableGeneratorCore';

describe('Timetable Generator', () => {
  // Spy on the core generator
  beforeEach(() => {
    vi.spyOn(timetableGeneratorCore, 'generateTimetableCore').mockResolvedValue([
      { date: '2023-05-01', block: 'Morning', subject: 'Math' },
      { date: '2023-05-01', block: 'Afternoon', subject: 'Physics' },
    ]);
  });

  it('should pass period-specific availability to core generator when available', async () => {
    // Setup
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-05-10' },
      { id: 2, subject: 'Physics', examDate: '2023-05-15' }
    ];
    
    const startDate = '2023-05-01';
    
    const revisionTimes = {
      monday: ['Morning', 'Afternoon'],
      tuesday: ['Morning'],
      wednesday: ['Afternoon', 'Evening'],
      thursday: ['Morning', 'Evening'],
      friday: ['Afternoon'],
      saturday: ['Morning', 'Afternoon', 'Evening'],
      sunday: ['Morning', 'Evening'],
      periodSpecificAvailability: [
        {
          startDate: '2023-05-05',
          endDate: '2023-05-07',
          revisionTimes: {
            monday: ['Evening'],
            tuesday: ['Evening'],
            wednesday: ['Morning'],
            thursday: ['Afternoon'],
            friday: ['Morning', 'Evening'],
            saturday: [],
            sunday: []
          }
        }
      ]
    };
    
    const blockTimes = {
      Morning: { startTime: '09:00', endTime: '12:00' },
      Afternoon: { startTime: '13:00', endTime: '16:00' },
      Evening: { startTime: '18:00', endTime: '21:00' }
    };
    
    // Call the generator
    await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Verify the core generator was called with the correct parameters
    expect(timetableGeneratorCore.generateTimetableCore).toHaveBeenCalledWith(
      exams,
      startDate,
      revisionTimes,
      blockTimes
    );
  });

  it('should work with empty period-specific availability', async () => {
    // Setup
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-05-10' },
      { id: 2, subject: 'Physics', examDate: '2023-05-15' }
    ];
    
    const startDate = '2023-05-01';
    
    const revisionTimes = {
      monday: ['Morning', 'Afternoon'],
      tuesday: ['Morning'],
      wednesday: ['Afternoon', 'Evening'],
      thursday: ['Morning', 'Evening'],
      friday: ['Afternoon'],
      saturday: ['Morning', 'Afternoon', 'Evening'],
      sunday: ['Morning', 'Evening'],
      periodSpecificAvailability: []
    };
    
    const blockTimes = {
      Morning: { startTime: '09:00', endTime: '12:00' },
      Afternoon: { startTime: '13:00', endTime: '16:00' },
      Evening: { startTime: '18:00', endTime: '21:00' }
    };
    
    // Call the generator
    await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Verify the core generator was called with the correct parameters
    expect(timetableGeneratorCore.generateTimetableCore).toHaveBeenCalledWith(
      exams,
      startDate,
      revisionTimes,
      blockTimes
    );
  });

  it('should work without period-specific availability property', async () => {
    // Setup
    const exams = [
      { id: 1, subject: 'Math', examDate: '2023-05-10' },
      { id: 2, subject: 'Physics', examDate: '2023-05-15' }
    ];
    
    const startDate = '2023-05-01';
    
    const revisionTimes = {
      monday: ['Morning', 'Afternoon'],
      tuesday: ['Morning'],
      wednesday: ['Afternoon', 'Evening'],
      thursday: ['Morning', 'Evening'],
      friday: ['Afternoon'],
      saturday: ['Morning', 'Afternoon', 'Evening'],
      sunday: ['Morning', 'Evening']
    };
    
    const blockTimes = {
      Morning: { startTime: '09:00', endTime: '12:00' },
      Afternoon: { startTime: '13:00', endTime: '16:00' },
      Evening: { startTime: '18:00', endTime: '21:00' }
    };
    
    // Call the generator
    await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    
    // Verify the core generator was called with the correct parameters
    expect(timetableGeneratorCore.generateTimetableCore).toHaveBeenCalledWith(
      exams,
      startDate,
      revisionTimes,
      blockTimes
    );
  });
});