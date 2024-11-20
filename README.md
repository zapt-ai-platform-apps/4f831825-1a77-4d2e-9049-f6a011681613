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
- **Generate Timetable**:
  - If you have added exams and set your preferences, click **Generate Timetable** to create your revision schedule.
- **Responsive Calendar View**:
  - The timetable is displayed as a traditional monthly calendar grid optimized for all devices.
  - Each day in the calendar shows the date.
  - **Subject Indicators**:
    - Each exam is assigned a **unique color** based on the order of your exams.
    - Days with scheduled **revision sessions** display small colored dots or squares representing the subjects you're set to revise.
    - The color indicators are arranged in the same order as your subjects, allowing you to quickly see which subjects you will be studying on each day without selecting the date.
  - **Exam Day Highlighting**:
    - Days with scheduled **exams** are highlighted in **red**.
  - **Select a Day**:
    - Click on a date in the calendar to view its details.
    - The details of the selected day are displayed **underneath the calendar**, similar to the Apple Calendar app.
    - This includes any exams and revision sessions scheduled for that day.
    - Click on another date to view its details or click the same date again to hide the details.
  - **Exam and Session Details**:
    - **Exams**:
      - Displayed with subject, examination board, and teacher information.
    - **Revision Sessions**:
      - Displayed with time and subject details.
      - Sessions are color-coded to match the subject indicators on the calendar.
- **Navigating the Calendar**:
  - Use the **Previous** and **Next** buttons, enhanced with icons, located below the calendar to navigate between months.
  - The current month and year are displayed at the top of the calendar.
- **Scheduling Logic**:
  - Revision sessions are evenly distributed among all your subjects.
  - **Subjects are not scheduled after their exam date**.
- **Automatic Timetable Generation**:
  - The timetable is generated based on your preferences and exams.
  - The timetable is saved and can be accessed anytime by navigating to the Timetable page.
- **Reduced Calendar Gaps**:
  - The gaps between calendar day boxes have been minimized to provide a more compact and clear view.
- **Fixed Calendar Width**:
  - The calendar maintains a consistent width across different devices, ensuring a stable and user-friendly interface.
- **Made on ZAPT Badge**:
  - A **"Made on ZAPT"** badge is displayed at the bottom of the page.
  - Clicking the badge opens the [ZAPT](https://www.zapt.ai) website in a new tab.

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
- **Selecting a date on the timetable now displays the day's details underneath the calendar, similar to the Apple Calendar app, instead of navigating to a new page.**
- **Revision sessions are displayed on the timetable, and days with scheduled sessions are highlighted.**
- **Each exam is assigned a unique color based on the order of your exams, and small colored dots or squares on the calendar days are arranged in the same order as your subjects, allowing you to quickly see your study plan without selecting each day.**
- **The gaps between the calendar day boxes have been reduced for a more compact view, enhancing the overall user experience.**
- **A "Made on ZAPT" badge is visible on the app, linking to the ZAPT website.**

---

**UpGrade** empowers you to take control of your study schedule, ensuring you make the most of your revision time and are well-prepared for your exams. Good luck with your studies!