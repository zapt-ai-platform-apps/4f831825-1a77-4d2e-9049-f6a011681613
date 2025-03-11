import { z } from 'zod';
import { createValidator } from '../core/validators';

// Define the timetable entry schema
export const timetableEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  block: z.enum(['Morning', 'Afternoon', 'Evening']),
  subject: z.string().min(1, "Subject is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional().nullable(),
  isUserCreated: z.boolean().default(false),
  isComplete: z.boolean().default(false)
});

// Create validator function
export const validateTimetableEntry = createValidator(timetableEntrySchema, 'TimetableEntry');

// Define the timetable schema (map of date strings to arrays of entries)
export const timetableSchema = z.record(z.array(timetableEntrySchema));

// Create validator function
export const validateTimetable = createValidator(timetableSchema, 'Timetable');

// Define the period-specific availability schema
export const periodAvailabilitySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  availability: z.array(z.object({
    dayOfWeek: z.string(),
    block: z.enum(['Morning', 'Afternoon', 'Evening']),
    isAvailable: z.boolean()
  }))
});

// Create validator function
export const validatePeriodAvailability = createValidator(periodAvailabilitySchema, 'PeriodAvailability');