# UpGrade

UpGrade is a personalized revision timetable app designed to help students efficiently prepare for their school examinations. By inputting exam details and personal study preferences, the app generates a customized study schedule presented in a detailed calendar format. It ensures focused and organized revision by allocating study sessions based on the student's availability and exam dates.

## User Guide

### 1. **User Authentication**

- Upon launching the app, you are prompted to **Sign in with ZAPT**.
- You can sign up or log in using:
  - **School Email**: Use your school email to receive a magic link for password-less login.
  - **Social Accounts**: Sign in with **Google**, **Facebook**, or **Apple**.

### 2. **Set Up Your Revision Preferences**

- After signing in, you are directed to set your revision preferences.
- **Available Revision Times**:
  - For each day of the week, select the hours you are available to study between **8 AM and 8 PM**.
  - Click on the time slots to toggle your availability.
- **Session Duration**:
  - Choose how long each revision session should be.
  - Options range from **30 minutes to 2 hours** in **15-minute increments**.
- **Start Date**:
  - Select the date you want your revision timetable to start.
- Click **Save Preferences** to proceed.
- **Error Handling**:
  - If there is an issue saving your preferences, an error message will be displayed.
  - All errors are logged and monitored to ensure a smooth user experience.

### 3. **Manage Your Exams**

- Navigate to the **Exams** page using the navigation links at the top.
- **Add New Exam**:
  - **Subject**: Enter the subject name.
  - **Exam Date**: Select the exam date using the date picker.
  - **Examination Board**: Specify the examination board.
  - **Teacher's Name**: Enter your teacher's name.
- Click **Add Exam** to save the exam to your list.
- **Upcoming Exams**:
  - View all your upcoming exams in a list.
  - **Delete** an exam by clicking the **Delete** button next to it.
- Past exams are automatically excluded from the list.

### 4. **View Your Timetable**

- Navigate to the **Timetable** page using the navigation links at the top.
- **Revision Timetable**:
  - View your timetable presented as a calendar.
  - Each day displays scheduled revision sessions based on your preferences and exams.
  - **Session Details**:
    - Time slots you've set as available.
    - Subjects allocated for each session.
  - **Exam Days**:
    - Exam dates are highlighted and marked clearly.
    - No revision sessions are scheduled on exam days.
- **Scheduling Logic**:
  - Revision sessions are evenly distributed among all your subjects.
  - **Subjects are not scheduled after their exam date**.
- **Automatic Timetable Generation**:
  - The timetable is automatically generated based on your preferences and exams.
  - The timetable is saved and can be accessed anytime by navigating to the Timetable page.

### 5. **Switch Between Pages**

- Use the navigation links at the top of the app to switch between:
  - **Preferences**: Update your revision times, session durations, or start date.
  - **Exams**: Add or delete exams from your list.
  - **Timetable**: View your personalized revision schedule.

### 6. **Manage Your Account**

- **Logout**:
  - Click **Sign Out** in the header to securely log out of your account.

## External API Services Used

- **Supabase**:
  - Used for user authentication and real-time database services.
  - Provides secure login options and data storage for user preferences and exams.
- **Sentry**:
  - Implemented for error tracking and monitoring.
  - Helps in identifying and resolving issues promptly to enhance user experience.

## Environment Variables

- `VITE_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking.
- `VITE_PUBLIC_APP_ENV`: Application environment (e.g., development, production).
- `VITE_PUBLIC_APP_ID`: Application ID for ZAPT integration.

## Notes

- The app is free to use and does not require any subscription.
- Ensure you have a stable internet connection for the best experience.
- All data is securely stored, and privacy is maintained.
- If you encounter any issues or errors, rest assured they are automatically reported and will be addressed promptly.
- **The app is fully responsive and optimized for all screen sizes, including mobile devices.**

---

**UpGrade** empowers you to take control of your study schedule, ensuring you make the most of your revision time and are well-prepared for your exams. Good luck with your studies!