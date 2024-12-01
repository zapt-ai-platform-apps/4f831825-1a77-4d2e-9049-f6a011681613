import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { preferences, exams, revisionTimes, timetableEntries } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: "backend",
      projectId: process.env.VITE_PUBLIC_APP_ID,
    },
  },
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // Delete existing timetable entries
    await db.delete(timetableEntries).where(eq(timetableEntries.userId, user.id));

    // Fetch user's exams, preferences, and revision times
    const [prefsResult, examsResult, revisionTimesResult] = await Promise.all([
      db.select().from(preferences).where(eq(preferences.userId, user.id)),
      db.select().from(exams).where(eq(exams.userId, user.id)),
      db.select().from(revisionTimes).where(eq(revisionTimes.userId, user.id)),
    ]);

    if (!prefsResult.length) {
      return res.status(400).json({ error: "User preferences not found" });
    }

    const userPreferences = prefsResult[0];
    userPreferences.userId = user.id; // Ensure userId is set in preferences

    const userExams = examsResult;

    if (!userExams.length) {
      return res.status(400).json({ error: "No exams found for user" });
    }

    if (!revisionTimesResult.length) {
      return res.status(400).json({ error: "No revision times found for user" });
    }

    // Generate timetable entries
    const timetableData = generateTimetable(userPreferences, userExams, revisionTimesResult);

    // Save timetable entries
    if (timetableData && timetableData.length > 0) {
      await db.insert(timetableEntries).values(timetableData);
    }

    res.status(200).json({ message: "Timetable generated successfully" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

function generateTimetable(preferences, exams, revisionTimes) {
  const { startDate, userId } = preferences;

  const dateCursor = new Date(startDate);
  if (isNaN(dateCursor)) {
    throw new Error('Invalid start date');
  }

  // Sort exams by date
  exams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  // Map exams by date and timeOfDay
  const examsByDate = {};
  exams.forEach((exam) => {
    const examDateStr = exam.examDate;
    if (!examsByDate[examDateStr]) {
      examsByDate[examDateStr] = [];
    }
    examsByDate[examDateStr].push(exam);
  });

  // Map revision times by day of week
  const revisionTimesMap = {};
  revisionTimes.forEach((item) => {
    const day = item.dayOfWeek.toLowerCase();
    if (!revisionTimesMap[day]) {
      revisionTimesMap[day] = [];
    }
    revisionTimesMap[day].push(item.block);
  });

  // Valid time blocks and their order
  const blockOrder = ["Morning", "Afternoon", "Evening"];

  // Generate dates from startDate to lastExamDate
  const examDates = exams.map((exam) => new Date(exam.examDate));
  const lastExamDate = new Date(Math.max.apply(null, examDates));

  const allSlots = [];

  let currentDate = new Date(dateCursor);
  while (currentDate <= lastExamDate) {
    const currentDateStr = currentDate.toISOString().split("T")[0];

    // Get the day of week
    const dayOfWeek = currentDate
      .toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })
      .toLowerCase();

    // Get available blocks for that day
    const dayBlocks = revisionTimesMap[dayOfWeek] || [];
    const availableBlocks = dayBlocks.filter((block) => blockOrder.includes(block));

    // Exclude blocks after the last exam time on the last exam date
    let filteredBlocks = availableBlocks;
    if (currentDateStr === lastExamDate.toISOString().split("T")[0]) {
      const lastExam = exams[exams.length - 1];
      const lastExamBlockIndex = blockOrder.indexOf(lastExam.timeOfDay || "Morning");
      filteredBlocks = availableBlocks.filter((block) => {
        const blockIndex = blockOrder.indexOf(block);
        return blockIndex < lastExamBlockIndex;
      });
    }

    // Only include the filtered blocks
    for (const block of filteredBlocks) {
      allSlots.push({
        date: currentDateStr,
        block,
        assigned: false,
        subject: null,
      });
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // Assign immediate revision sessions before exams
  const assignedSlots = new Set();
  exams.forEach((exam, index) => {
    let revisionSlot = null;
    const examDate = new Date(exam.examDate);
    const examDateStr = examDate.toISOString().split("T")[0];
    const examBlockIndex = blockOrder.indexOf(exam.timeOfDay || "Morning");

    // Find the latest available slot before the exam
    for (let i = allSlots.length - 1; i >= 0; i--) {
      const slot = allSlots[i];
      if (assignedSlots.has(i)) continue;

      const slotDate = new Date(slot.date);
      const slotBlockIndex = blockOrder.indexOf(slot.block);

      if (
        slotDate < examDate ||
        (slotDate.toISOString().split("T")[0] === examDateStr && slotBlockIndex < examBlockIndex)
      ) {
        revisionSlot = slot;
        assignedSlots.add(i);
        break;
      }
    }

    if (revisionSlot) {
      revisionSlot.assigned = true;
      revisionSlot.subject = exam.subject;
    } else {
      // If no available slot before the exam, skip assignment
    }

    // Handle consecutive exams
    if (index > 0) {
      const prevExam = exams[index - 1];
      const prevExamDate = new Date(prevExam.examDate);
      const daysBetweenExams = (examDate - prevExamDate) / (1000 * 60 * 60 * 24);
      if (daysBetweenExams === 1) {
        // Exams are on consecutive days
        // Assign the slot before the previous exam to the next exam's subject
        let prevRevisionSlot = null;
        for (let i = allSlots.length - 1; i >= 0; i--) {
          const slot = allSlots[i];
          if (assignedSlots.has(i)) continue;

          const slotDate = new Date(slot.date);
          const slotBlockIndex = blockOrder.indexOf(slot.block);

          if (
            slotDate < prevExamDate ||
            (slotDate.toISOString().split("T")[0] === prevExamDate.toISOString().split("T")[0] &&
              slotBlockIndex < blockOrder.indexOf(prevExam.timeOfDay || "Morning"))
          ) {
            prevRevisionSlot = slot;
            assignedSlots.add(i);
            break;
          }
        }

        if (prevRevisionSlot) {
          prevRevisionSlot.assigned = true;
          prevRevisionSlot.subject = exam.subject;
        }
      }
    }
  });

  // Assign remaining slots evenly among subjects
  const remainingSubjects = exams.map((exam) => exam.subject.trim());
  let subjectIndex = 0;

  for (let i = 0; i < allSlots.length; i++) {
    const slot = allSlots[i];
    if (slot.assigned) continue;
    slot.subject = remainingSubjects[subjectIndex % remainingSubjects.length];
    slot.assigned = true;
    subjectIndex++;
  }

  const timetableEntriesData = allSlots.map((slot) => ({
    userId: userId,
    date: slot.date,
    block: slot.block,
    subject: slot.subject,
  }));

  return timetableEntriesData;
}