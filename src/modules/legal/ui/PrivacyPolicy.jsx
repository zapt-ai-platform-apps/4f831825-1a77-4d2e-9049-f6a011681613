import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Last updated: March 10, 2025</p>

        <div className="prose max-w-none text-gray-700 dark:text-gray-200">
          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Introduction</h2>
          <p>
            Welcome to UpGrade ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our revision timetable application.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 my-3 space-y-2">
            <li><strong>Account Information:</strong> Email address and authentication details through ZAPT.</li>
            <li><strong>Exam Information:</strong> Subject names, dates, times, examination boards, and other details you provide about your exams.</li>
            <li><strong>Preferences:</strong> Your revision preferences, available times, and scheduling preferences.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our application, including pages visited and features used.</li>
            <li><strong>Technical Data:</strong> IP address, browser type and version, device information, and operating system details.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 my-3 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Generate personalized revision timetables based on your exams and preferences</li>
            <li>Communicate with you about your account or the application</li>
            <li>Monitor usage patterns and improve user experience</li>
            <li>Detect, prevent, and address technical issues</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Data Storage and Security</h2>
          <p>
            Your data is stored securely using CockroachDB and protected with industry-standard encryption. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your data.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Third-Party Services</h2>
          <p>We use the following third-party services to support our application:</p>
          <ul className="list-disc pl-6 my-3 space-y-2">
            <li><strong>Supabase:</strong> For user authentication via ZAPT</li>
            <li><strong>Sentry:</strong> For error logging and monitoring</li>
            <li><strong>Progressier:</strong> For PWA support</li>
            <li><strong>Umami:</strong> For analytics tracking</li>
            <li><strong>Stream:</strong> For real-time chat functionality</li>
          </ul>
          <p>
            These services may collect information sent by your browser as part of their service delivery. Their use of this information is governed by their respective privacy policies.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 my-3 space-y-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the details provided below.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Cookies and Similar Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our application and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Children's Privacy</h2>
          <p>
            Our application is intended for users who are 13 years of age or older. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            Email: support@zapt.ai
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-primary hover:text-primary/80 font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;