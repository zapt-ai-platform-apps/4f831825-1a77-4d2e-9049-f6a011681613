# UpGrade

UpGrade is a personalized revision timetable app designed to help students efficiently prepare for their school examinations. The app features a clean, mobile-first design with a soothing vertical gradient background from deep blue (#004AAD) at the top to light blue (#5DE0E6), enhancing user experience.

## User Journeys

1. [Get Started](docs/journeys/get-started.md) - Access the landing page and begin using UpGrade.
2. [Sign In with ZAPT](docs/journeys/sign-in-with-zapt.md) - Securely sign in using your school email or social accounts.
3. [Set Revision Preferences](docs/journeys/set-revision-preferences.md) - Configure your available study times, session durations, and start date.
4. [Manage Exams](docs/journeys/manage-exams.md) - Add, edit, view, and delete exams to tailor your revision timetable.
5. [View Timetable](docs/journeys/view-timetable.md) - Access and navigate your personalized revision schedule.
6. [Use Navigation Menu](docs/journeys/use-navigation-menu.md) - Navigate between different sections of the app.
7. [Manage Account](docs/journeys/manage-account.md) - Sign out and understand account management features.

---

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
- **Update**: You can now edit your exams directly from the **Exams** page. This feature allows you to make changes without having to delete and re-add exams.
- **Additional Updates**:
  - The timetable now displays colored dots for each subject on days with revision sessions, and includes a legend for easy reference. This enhancement provides a quick visual overview of your study schedule.
  - The timetable generation logic ensures that the last revision session before an exam is scheduled in the **latest available block** before the exam, providing optimal preparation for your exams.
  - **Conflict-Free Scheduling**: Revision sessions are now **never scheduled at the same time as exams**, eliminating conflicts and ensuring you can focus entirely on your exams when they occur. This enhancement provides a seamless and stress-free study schedule.

---

**UpGrade** empowers you to take control of your study schedule, ensuring you make the most of your revision time and are well-prepared for your exams. Good luck with your studies!