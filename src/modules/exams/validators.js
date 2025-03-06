import { z } from 'zod';
import { createValidator } from '../core/validators';

// Define the exam schema
export const examSchema = z.object({
  id: z.number().optional(), // Optional for new exams
  subject: z.string().min(1, "Subject is required"),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening']).default('Morning'),
  board: z.string().optional(),
  teacher: z.string().optional(),
  examColour: z.string().optional(),
});

// Create validator function
export const validateExam = createValidator(examSchema, 'Exam');

// Define a collection of exams schema
export const examsSchema = z.array(examSchema);

// Create validator function
export const validateExams = createValidator(examsSchema, 'Exams');