import React from 'react';
import { Link } from 'react-router-dom';

function TimetableLogicPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center mt-4">How Your Timetable is Generated</h1>
      
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Core Principles</h2>
        <p className="text-muted-foreground mb-4">
          UpGrade uses intelligent algorithms to create a personalized revision timetable that balances several key factors:
        </p>
        <ul className="space-y-2 list-disc pl-6 mb-4">
          <li>Prioritizing subjects with upcoming exams</li>
          <li>Creating dedicated pre-exam revision sessions</li>
          <li>Distributing revision sessions fairly across all subjects</li>
          <li>Working within your available revision times</li>
          <li>Avoiding conflicts with scheduled exams</li>
        </ul>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">The Generation Process</h2>
        
        <h3 className="text-xl font-medium mb-2">Step 1: Creating Pre-Exam Sessions</h3>
        <p className="text-muted-foreground mb-4">
          For each exam, we first schedule a dedicated revision session, typically on the evening before the exam. This ensures you always have a final review session before any examination.
        </p>
        
        <h3 className="text-xl font-medium mb-2">Step 2: Balancing Subject Distribution</h3>
        <p className="text-muted-foreground mb-4">
          The algorithm tracks how many sessions have been allocated to each subject and prioritizes subjects that have fewer sessions. This ensures a balanced approach across all your subjects.
        </p>
        
        <h3 className="text-xl font-medium mb-2">Step 3: Schedule Optimization</h3>
        <p className="text-muted-foreground mb-4">
          We fill your available time slots (Morning, Afternoon, Evening) on the days you've selected, working around your exams and pre-existing commitments.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Special Rules</h2>
        
        <div className="mb-4">
          <h3 className="text-xl font-medium mb-2">Consecutive Exams</h3>
          <p className="text-muted-foreground">
            For multiple exams on the same day, we prioritize the earliest exam for the best available revision slot, followed by later exams. This means the earliest exam gets priority for the last revision session before exam day, the second-earliest exam gets the next-best slot, and so on.
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-medium mb-2">Exam-Day Revision</h3>
          <p className="text-muted-foreground">
            For afternoon or evening exams, we may schedule a morning revision session for that subject on the same day, giving you a final review opportunity.
          </p>
        </div>
        
        <div>
          <h3 className="text-xl font-medium mb-2">Subject Priority</h3>
          <p className="text-muted-foreground">
            Subjects with closer exams get higher priority in the schedule, especially in the weeks immediately leading up to those exams.
          </p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tips for Optimal Results</h2>
        <ul className="space-y-2 list-disc pl-6">
          <li>Add all your exams with accurate dates and times</li>
          <li>Be realistic about your available revision times</li>
          <li>Set a start date that gives you enough preparation time</li>
          <li>Customize your block times (Morning, Afternoon, Evening) if the defaults don't suit your schedule</li>
          <li>Regenerate your timetable if you add new exams or change your preferences</li>
        </ul>
      </div>

      <div className="flex justify-center mt-8">
        <Link 
          to="/timetable" 
          className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Back to Timetable
        </Link>
      </div>
    </div>
  );
}

export default TimetableLogicPage;