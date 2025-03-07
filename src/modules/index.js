import { initializeCore } from './core/internal/initialize';
import { initializeAuth } from './auth/internal/initialize';
import { initializePreferences } from './preferences/internal/initialize';
import { initializeExams } from './exams/internal/initialize';
import { initializeTimetable } from './timetable/internal/initialize';
import { initializeSupport } from './support/internal/initialize';

/**
 * Initialize all application modules
 * @returns {Promise<void>}
 */
export async function initializeModules() {
  console.log('Initializing all modules...');
  
  try {
    // Order matters! Initialize core first, followed by auth, then feature modules
    await initializeCore();
    await initializeAuth();
    await initializePreferences(); 
    await initializeExams();
    await initializeTimetable();
    await initializeSupport();
    
    console.log('All modules initialized successfully');
  } catch (error) {
    console.error('Failed to initialize modules:', error);
    throw error;
  }
}