import { z } from 'zod';
import { createValidator } from '../core/validators';
import { parseISO, isValid, isBefore } from 'date-fns';

// Define the block times schema
const blockTimeSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format")
}).refine(data => {
  const [startHour, startMinute] = data.startTime.split(':').map(Number);
  const [endHour, endMinute] = data.endTime.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  return endTime > startTime;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

// Define the revision times schema
const revisionTimesSchema = z.object({
  monday: z.array(z.enum(['Morning', 'Afternoon', 'Evening'])),
  tuesday: z.array(z.enum(['Morning', 'Afternoon', 'Evening'])),
  wednesday: z.array(z.enum(['Morning', 'Afternoon', 'Evening'])),
  thursday: z.array(z.enum(['Morning', 'Afternoon', 'Evening'])),
  friday: z.array(z.enum(['Morning', 'Afternoon', 'Evening'])),
  saturday: z.array(z.enum(['Morning', 'Afternoon', 'Evening'])),
  sunday: z.array(z.enum(['Morning', 'Afternoon', 'Evening']))
}).refine(data => {
  // Ensure at least one block is selected across all days
  return Object.values(data).some(blocks => blocks.length > 0);
}, {
  message: "At least one revision time must be selected",
  path: []
});

// Define the block times container schema
const blockTimesSchema = z.object({
  Morning: blockTimeSchema.optional(),
  Afternoon: blockTimeSchema.optional(),
  Evening: blockTimeSchema.optional()
});

// Define the preferences schema with start date validation
export const preferencesSchema = z.object({
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(date => {
      const parsedDate = parseISO(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      
      return isValid(parsedDate) && !isBefore(parsedDate, today);
    }, {
      message: "Start date cannot be in the past",
    }),
  revisionTimes: revisionTimesSchema,
  blockTimes: blockTimesSchema
});

// Create validator function
export const validatePreferences = createValidator(preferencesSchema, 'Preferences');