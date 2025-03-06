import { initializeAuth } from './auth/internal/initialize';
import { initializeCore } from './core/internal/initialize';
import { initializeExams } from './exams/internal/initialize';
import { initializePreferences } from './preferences/internal/initialize';
import { initializeTimetable } from './timetable/internal/initialize';

/**
 * Initialize all application modules
 * This ensures dependencies are properly loaded before the app starts
 */
export async function initializeModules() {
  console.log('Initializing application modules...');
  
  try {
    // Core must be initialized first as other modules depend on it
    await initializeCore();
    
    // Initialize feature modules in parallel
    await Promise.all([
      initializeAuth(),
      initializeExams(),
      initializePreferences(),
      initializeTimetable()
    ]);
    
    console.log('All modules initialized successfully');
  } catch (error) {
    console.error('Failed to initialize modules:', error);
    throw error;
  }
}