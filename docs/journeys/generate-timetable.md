# Generate Timetable

## Step-by-Step Guide

1. **Navigate to Generate Timetable**  
   - After adding your exams and setting your revision preferences, you can generate your personalized timetable.  
   - Click on the **Generate Timetable** button, which is available on the **Exams** page after you have added your exams.

2. **Timetable Generation Process**  
   - The app will process your exams, preferences, and availability to create a personalized study schedule.  
   - This process may take a few moments; a loading indicator will display during this time.

3. **Our Backward-Filling Approach**  

   The timetable is generated based on the following backward-filling strategy:

   1. **Start from the Last Exam Date**  
      We collect all available revision slots (blank sessions) and sort them from the end of your exam period backward to your start date.

   2. **Distribute Sessions Fairly**  
      We fill each blank session with the subject of an upcoming exam (whose exam date is on or after that session’s date).  
      Subjects are assigned so that none dominates too many slots while others are starved of revision sessions.

   3. **Immediate Pre-Exam Session**  
      We ensure the session before each exam slot is assigned to that exam’s subject if possible (or fallback to the previous day’s Evening block for morning exams).

   4. **Handle Consecutive Exams**  
      If your exams occur on back-to-back days or in multiple blocks on the same day, the algorithm still reserves each subject's last-minute session as needed.

   5. **No Sessions After an Exam**  
      We do not schedule sessions for an exam once its date has passed.

4. **View Your Timetable**  
   - Once generated, you will be redirected to the **Timetable** page.  
   - Your personalized revision timetable will display:  
     - **Revision Sessions**: Color-coded by subject.  
     - **Exams**: Clearly marked with an "Exam" indicator.  
     - **Session Details**: Start and end times for each revision session.

5. **Regenerate Timetable**  
   - If you make changes to your exams or preferences, you can regenerate your timetable to reflect the updates.  
   - Simply click the **Generate Timetable** button again after making your changes.

---

**Note**: This backward-filling logic ensures that nearer exams don’t lose out on necessary last-minute sessions to exams happening much later. Each exam subject is fairly allocated sessions, balancing study loads for all upcoming tests.