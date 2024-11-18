# UpGrade

UpGrade is a personalized revision timetable app designed to help students efficiently prepare for their school examinations. The app features a clean, mobile-first design with a soothing vertical gradient background from deep blue (#004AAD) at the top to light blue (#5DE0E6) at the bottom, enhancing user experience.

## User Guide

### 1. **Landing Page**

- When you first visit UpGrade, you are greeted with a welcoming **Landing Page** optimized for mobile devices.
- **Welcome Message**:
  - A brief introduction to the app's purpose and benefits.
- **Get Started**:
  - Click the **Get Started** button to begin.

### 2. **User Authentication**

- After clicking **Get Started**, you are prompted to **Sign in with ZAPT**.
- You can sign up or log in using:
  - **School Email**: Use your school email to receive a magic link for password-less login.
  - **Social Accounts**: Sign in with **Google**, **Facebook**, or **Apple**.

### 3. **Set Up Your Revision Preferences**

- After signing in, you are directed to set your revision preferences.
- **Available Revision Times**:
  - For each day of the week, select the hours you are available to study between **8 AM and 8 PM**.
  - Click on the time slots to toggle your availability.
  - Selected time slots are highlighted for clarity.
- **Session Duration**:
  - Choose how long each revision session should be.
  - Options range from **30 minutes to 2 hours** in **15-minute increments**.
- **Start Date**:
  - Select the date you want your revision timetable to start.
- Click **Save Preferences** to proceed.
- **Error Handling**:
  - If there is an issue saving your preferences, an error message will be displayed.
  - All errors are logged and monitored to ensure a smooth user experience.

### 4. **Manage Your Exams**

- Navigate to the **Exams** page using the navigation links at the top.
- **Add New Exam**:
  - **Subject**: Enter the subject name.
  - **Exam Date**: Select the exam date using the date picker.
  - **Examination Board**: Specify the examination board.
  - **Teacher's Name**: Enter your teacher's name.
  - **Note**: **All fields are required.** You cannot add an exam unless all four pieces of information are provided.
- Click **Add Exam** to save the exam to your list.
- **Upcoming Exams**:
  - View all your upcoming exams in a list.
  - **Delete** an exam by clicking the **Delete** button next to it.
- Past exams are automatically excluded from the list.
- Click **Generate Timetable** to create your personalized revision schedule.

### 5. **View Your Timetable**

- Navigate to the **Timetable** page using the navigation links at the top.
- **Responsive Calendar View**:
  - The timetable is displayed as a traditional monthly calendar grid optimized for all devices.
  - Each day in the calendar shows the date.
  - A message prompts you to select a day on the timetable to view its details.
  - **Selected Date Navigation**:
    - When you click on a date, you are taken to a new screen that shows the exams and revision sessions scheduled for that day.
    - The selected date's details are displayed clearly with all relevant information.
    - A **Back to Timetable** button allows you to return to the main calendar view.
- **Exam Day Highlighting**:
  - Days that have scheduled exams are highlighted on the calendar grid for easy identification.
- **Navigating the Calendar**:
  - Use the **Previous** and **Next** buttons, enhanced with icons, located below the calendar to navigate between months.
  - The current month and year are displayed at the top of the calendar.
- **Scheduling Logic**:
  - Revision sessions are evenly distributed among all your subjects.
  - **Subjects are not scheduled after their exam date**.
- **Automatic Timetable Generation**:
  - The timetable is automatically generated based on your preferences and exams.
  - The timetable is saved and can be accessed anytime by navigating to the Timetable page.
- **Fixed Calendar Width**:
  - The calendar maintains a consistent width across different devices, ensuring a stable and user-friendly interface.

### 6. **Navigation Menu**

- The navigation menu allows you to switch between pages:
  - **Preferences**: Update your revision times, session durations, or start date.
  - **Exams**: Add or delete exams from your list.
  - **Timetable**: View your personalized revision schedule.
- **Mobile Navigation**:
  - On mobile devices, the navigation menu is accessible via a menu icon (☰) in the top-right corner.
  - Clicking the menu icon opens the navigation links in a modal window, centered on the screen for better visibility.
  - To close the menu, click the close icon (×) or select a navigation link.

### 7. **Manage Your Account**

- **Sign Out**:
  - Click **Sign Out** in the header to securely log out of your account.
  - On mobile devices, the **Sign Out** option is available within the modal navigation menu.

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
- **The app is fully responsive and optimized for all screen sizes, with an emphasis on mobile devices.**
- **The navigation menu on mobile devices opens in a modal for better accessibility and user experience.**
- **Selecting a date on the timetable now takes you to a new screen displaying the details for that day, with an easy option to return to the main timetable.**

---

**UpGrade** empowers you to take control of your study schedule, ensuring you make the most of your revision time and are well-prepared for your exams. Good luck with your studies!