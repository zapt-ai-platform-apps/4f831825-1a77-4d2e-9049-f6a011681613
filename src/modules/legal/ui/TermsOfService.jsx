import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function TermsOfService() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">Terms of Service</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Last updated: March 10, 2025</p>

        <div className="prose max-w-none text-gray-700 dark:text-gray-100">
          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using UpGrade ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">2. Description of Service</h2>
          <p>
            UpGrade is a personalized revision timetable application designed to help users efficiently prepare for their school examinations. The Service allows users to create study schedules tailored to their needs, manage exam information, and set revision preferences.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">3. User Accounts</h2>
          <p>
            To use certain features of the Service, you may need to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          <p className="mt-2">
            You are responsible for safeguarding your password and for all activities that occur under your account. You should notify us immediately if you become aware of any breach of security or unauthorized use of your account.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">4. User Content</h2>
          <p>
            Our Service allows you to input, store, and manage information related to your exams and revision preferences. You retain all rights to your data and are responsible for all content you provide.
          </p>
          <p className="mt-2">
            By providing content to the Service, you grant us a non-exclusive, royalty-free license to use, store, and display your content for the purpose of providing and improving the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">5. Acceptable Use</h2>
          <p>
            You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service. You also agree not to:
          </p>
          <ul className="list-disc pl-6 my-3 space-y-2">
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Use the Service for any fraudulent or illegal purpose</li>
            <li>Interfere with other users' use of the Service</li>
            <li>Attempt to reverse-engineer any aspect of the Service</li>
            <li>Circumvent any security features of the Service</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">6. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding content provided by users), features, and functionality are owned by ZAPT and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, service interruption, computer damage, or system failure, resulting from your access to or use of the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">9. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will provide reasonable notice of any significant changes. Your continued use of the Service after changes are made constitutes your acceptance of the revised Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-3 dark:text-white">12. Contact Information</h2>
          <p>
            For any questions about these Terms, please contact us at:
          </p>
          <p className="mt-2">
            Email: support@zapt.ai
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-primary hover:text-primary/80 font-medium dark:text-primary dark:hover:text-primary/80">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;