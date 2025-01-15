import {
  sortExamsByDate
} from './helpers/sorting.js';
import {
  mapExamsByDateBlock,
  mapRevisionTimesByDay
} from './helpers/mapping.js';
import {
  assignImmediateRevisionSessions,
  assignRemainingSlots
} from './helpers/assignment.js';

export async function generateTimetable(preferences, exams, revisionTimes, blockTimes) {
  const { startDate, userId } = preferences;

  const dateCursor = new Date(startDate);
  if (isNaN(dateCursor)) {
    throw new Error('Invalid start date');
  }

  // Sort exams by date
  sortExamsByDate(exams);

  // Map exams by date and block
  const examsByDateBlock = mapExamsByDateBlock(exams);

  // Map revision times by day of week
  const revisionTimesMap = mapRevisionTimesByDay(revisionTimes);

  // Valid time blocks and their order
  const blockOrder = ['Morning', 'Afternoon', 'Evening'];

  // Get block times from user preferences or use defaults
  const blockTimesMap = getBlockTimes(blockTimes, blockOrder);

  // Generate dates from startDate to lastExamDate
  const examDates = exams.map((exam) => new Date(exam.examDate));
  const lastExamDate = new Date(Math.max.apply(null, examDates));

  const allSlots = generateAllSlots(
    dateCursor,
    lastExamDate,
    revisionTimesMap,
    blockTimesMap,
    examsByDateBlock,
    blockOrder,
    exams
  );

  // Build a mapping of subject exam dates
  const subjectExamDates = {};
  exams.forEach((exam) => {
    subjectExamDates[exam.subject.trim()] = new Date(exam.examDate);
  });

  // Assign immediate revision sessions before exams
  const assignedSlots = new Set();
  assignImmediateRevisionSessions(exams, allSlots, blockOrder, assignedSlots);

  // Assign remaining slots to subjects whose exams are in the future
  assignRemainingSlots(exams, subjectExamDates, allSlots, blockOrder);

  const timetableEntriesData = allSlots
    .filter((slot) => slot.assigned && slot.subject)
    .map((slot) => {
      const times = blockTimesMap[slot.block] || {};
      return {
        userId: userId,
        date: slot.date,
        block: slot.block,
        subject: slot.subject,
        startTime: times.startTime,
        endTime: times.endTime,
      };
    });

  return timetableEntriesData;
}

import { getBlockTimes, generateAllSlots } from './helpers/time.js';