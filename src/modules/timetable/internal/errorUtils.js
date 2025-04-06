import * as Sentry from '@sentry/browser';

/**
 * Captures timetable generation errors with full context
 * @param {Error} error - The error that occurred
 * @param {Object} context - Generation context information
 * @param {Array} context.exams - Exam data provided for generation
 * @param {string} context.startDate - Start date string
 * @param {Object} context.revisionTimes - User's revision time preferences
 * @param {Object} context.blockTimes - User's block time preferences
 * @param {string} [context.location] - Where in the code the error occurred
 * @param {Object} [context.additionalData] - Any other relevant data
 */
export function captureTimetableError(error, context) {
  // Log full error details to console
  console.error('Timetable generation error:', error);
  console.error('Error context:', JSON.stringify({
    exams: context.exams,
    startDate: context.startDate,
    revisionTimes: context.revisionTimes,
    blockTimes: context.blockTimes,
    location: context.location || 'unknown',
    additionalData: context.additionalData || {}
  }, null, 2));

  // Format exam data to be more readable in Sentry
  const formattedExams = context.exams?.map(exam => ({
    id: exam.id,
    subject: exam.subject,
    examDate: exam.examDate,
    timeOfDay: exam.timeOfDay || 'Morning'
  })) || [];

  // Count exams per subject and date for quick overview
  const examCounts = {};
  const dateDistribution = {};
  
  formattedExams.forEach(exam => {
    // Count by subject
    examCounts[exam.subject] = (examCounts[exam.subject] || 0) + 1;
    
    // Count by date
    dateDistribution[exam.examDate] = (dateDistribution[exam.examDate] || 0) + 1;
  });

  // Send detailed context to Sentry
  Sentry.captureException(error, {
    extra: {
      // Core generation inputs
      exams: formattedExams,
      examCount: formattedExams.length,
      examSubjects: Object.keys(examCounts),
      examsBySubject: examCounts,
      examsByDate: dateDistribution,
      
      startDate: context.startDate,
      revisionTimes: context.revisionTimes,
      
      // User preferences
      blockTimes: context.blockTimes,
      
      // Additional context
      errorLocation: context.location || 'unknown',
      additionalData: context.additionalData || {},
      
      // Include raw data for completeness, but structured data above for readability
      rawExams: context.exams
    },
    tags: {
      component: 'timetableGenerator',
      errorType: 'generation_failure',
      location: context.location || 'unknown'
    }
  });
}