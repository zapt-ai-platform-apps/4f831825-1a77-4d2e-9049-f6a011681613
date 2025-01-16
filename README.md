# UpGrade

Welcome to **UpGrade**, a personalized revision timetable app designed to help you efficiently prepare for your school examinations. UpGrade empowers you to take control of your study schedule, ensuring you make the most of your revision time and are well-prepared for your exams.

---

## User Journeys in Recommended Order

1. [Get Started](docs/journeys/get-started.md) - Land on the main page and begin.  
2. [Sign In with ZAPT](docs/journeys/sign-in-with-zapt.md) - Enter the app securely.  
3. [Set Revision Preferences](docs/journeys/set-revision-preferences.md) - Set your available days, blocks, and start date.  
4. [Manage Exams](docs/journeys/manage-exams.md) - Add and edit exam information.  
5. [Generate Timetable](docs/journeys/generate-timetable.md) - Create a personalized study schedule.  
6. [View Timetable](docs/journeys/view-timetable.md) - See your schedule in a useful calendar.  
7. [Use Navigation Menu](docs/journeys/use-navigation-menu.md) - Explore app sections (Preferences, Exams, Timetable).  
8. [Manage Account](docs/journeys/manage-account.md) - Sign out and account management details.  
9. [Manage Revision Sessions](docs/journeys/manage-revision-sessions.md) - Fine-tune your study sessions on specific days.

---

For a detailed explanation of each journey, click on the links above or see the [docs/journeys/](docs/journeys/) folder.

---

## External API Services

See [docs/external_services.md](docs/external_services.md) for a summary of the services used in this app.

---

## Environment Variables

Please create a file named **.env** at the project root with the following environment variables:

1. VITE_PUBLIC_SENTRY_DSN="<Your Sentry DSN>"
2. VITE_PUBLIC_APP_ENV="<development or production>"
3. VITE_PUBLIC_APP_ID="<Your ZAPT App ID>"
4. COCKROACH_DB_URL="<Your CockroachDB URL>"
5. NPM_TOKEN="<Your NPM token if needed>"
6. VITE_PUBLIC_UMAMI_WEBSITE_ID="<Your Umami website ID>"
7. OPENAI_API_KEY="<Your OpenAI API Key>"

---

## Description of External Services

- **Supabase**: Used for user authentication via ZAPT.  
- **Sentry**: Used for error logging and monitoring.  
- **Progressier**: Used to add PWA support (service worker, manifest, etc.).  
- **Umami**: Used for analytics tracking.  
- **Resend**: For sending emails if needed.  
- **OpenAI**: For ChatGPT-based final review of the locally generated timetable.

---

Enjoy using **UpGrade** for all your revision scheduling needs!