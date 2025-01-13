import { initializeZapt } from '@zapt/zapt-js';

export const { createEvent, supabase } = initializeZapt(process.env.VITE_PUBLIC_APP_ID);