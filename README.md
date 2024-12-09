# UpGrade

UpGrade is a personalized revision timetable app designed to help students efficiently prepare for their school examinations. The app features a clean, mobile-first design with a soothing vertical gradient background from deep blue (#004AAD) at the top to light blue (#5DE0E6), enhancing user experience.

## User Journeys

See [User Journeys](docs/user-journeys.md) for detailed information.

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

For additional notes and updates, refer to [Notes](docs/notes.md).

**UpGrade** empowers you to take control of your study schedule, ensuring you make the most of your revision time and are well-prepared for your exams. Good luck with your studies!