import { z } from 'zod';
import { createValidator } from '../core/validators';

// User schema definition
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  app_metadata: z.object({
    provider: z.string().optional(),
    providers: z.array(z.string()).optional()
  }).optional(),
  user_metadata: z.record(z.any()).optional(),
  aud: z.string().optional(),
  created_at: z.string().optional()
});

// Create validator functions
export const validateUser = createValidator(userSchema, 'User');

// Session schema definition
export const sessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_at: z.number().optional(),
  expires_in: z.number().optional(),
  user: userSchema
});

// Create validator functions
export const validateSession = createValidator(sessionSchema, 'Session');