# UpGrade

Welcome to **UpGrade**, a personalized revision timetable app designed to help you efficiently prepare for your school examinations. UpGrade empowers you to take control of your study schedule, ensuring you make the most of your revision time and are well-prepared for your exams.

---

## User Journeys

1. [Get Started](docs/journeys/get-started.md) - Access the landing page and begin using UpGrade.
2. [Sign In with ZAPT](docs/journeys/sign-in-with-zapt.md) - Securely sign in using your school email or social accounts.
3. [Set Revision Preferences](docs/journeys/set-revision-preferences.md) - Configure your available study times, session durations, and start date.
4. [Manage Exams](docs/journeys/manage-exams.md) - Add, edit, view, and delete exams to tailor your revision timetable.
5. [Generate Timetable](docs/journeys/generate-timetable.md) - Create your personalized revision schedule based on your exams and preferences.
6. [View Timetable](docs/journeys/view-timetable.md) - Access and navigate your personalized revision schedule.
7. [Use Navigation Menu](docs/journeys/use-navigation-menu.md) - Navigate between different sections of the app.
8. [Manage Account](docs/journeys/manage-account.md) - Sign out and understand account management features.

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
- `VITE_PUBLIC_APP_ID`: Application ID for ZAPT integration

---

**UpGrade** is free to use and does not require any subscription. All data is securely stored, and privacy is maintained.

If you encounter any issues or errors, rest assured they are automatically reported and will be addressed promptly.

---