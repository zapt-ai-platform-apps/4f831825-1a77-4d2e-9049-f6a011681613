# UpGrade

Welcome to **UpGrade**, a personalized revision timetable app designed to help you efficiently prepare for your school examinations. UpGrade empowers you to take control of your study schedule, ensuring you make the most of your revision time and are well-prepared for your exams.

---

## Features

- **Personalized Revision Timetable**: Create a study schedule tailored to your needs
- **Exam Management**: Add and edit exam information
- **Preference Settings**: Set your available days, blocks, and start date
- **Interactive Calendar**: View your schedule in an easy-to-use calendar
- **Session Management**: Fine-tune your study sessions on specific days

---

## How to Use

1. **Get Started**: Land on the main page and begin
2. **Sign In with ZAPT**: Enter the app securely
3. **Set Revision Preferences**: Set your available days, blocks, and start date
4. **Manage Exams**: Add and edit exam information
5. **Generate Timetable**: Create a personalized study schedule
6. **View Timetable**: See your schedule in a useful calendar
7. **Use Navigation Menu**: Explore app sections (Preferences, Exams, Timetable)
8. **Manage Account**: Sign out and account management
9. **Manage Revision Sessions**: Fine-tune your study sessions on specific days

---

## External API Services

This app uses the following external services:

- **Supabase**: Used for user authentication via ZAPT
- **Sentry**: Used for error logging and monitoring
- **Progressier**: Used to add PWA support (service worker, manifest, etc.)
- **Umami**: Used for analytics tracking
- **Resend**: For sending emails if needed
- **OpenAI**: For ChatGPT-based final review of the locally generated timetable

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

Enjoy using **UpGrade** for all your revision scheduling needs!