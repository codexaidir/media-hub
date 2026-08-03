import React from 'react';
import { PageTransition } from '../../components/PageTransition';
import { Lock } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500">Last Updated: August 3, 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect minimal information to provide and improve our service. This includes:
          </p>
          <ul>
            <li><strong>Account Information:</strong> If you create an account, we collect your name and email address.</li>
            <li><strong>Usage Data:</strong> We automatically collect basic telemetry data such as IP address, browser type, and diagnostic information to monitor service health and prevent abuse.</li>
            <li><strong>Processing Data:</strong> The URLs you submit for extraction are processed temporarily in memory.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the collected information for the following purposes:
          </p>
          <ul>
            <li>To provide, maintain, and improve our services.</li>
            <li>To process and complete your media extraction requests.</li>
            <li>To communicate with you regarding your account, updates, or support inquiries.</li>
            <li>To detect, prevent, and address technical issues or fraudulent activity.</li>
          </ul>

          <h2>3. Data Retention and Storage</h2>
          <p>
            <strong>We do not store the media you extract.</strong> All media processing happens on-the-fly and files are transmitted directly to your device. We do not keep logs of the specific media files downloaded by our users.
          </p>
          <p>
            Account information is retained as long as your account is active. You may request account deletion at any time.
          </p>

          <h2>4. Data Sharing and Disclosure</h2>
          <p>
            We do not sell your personal data. We may share information only in the following limited circumstances:
          </p>
          <ul>
            <li>With trusted service providers who assist us in operating our infrastructure (e.g., cloud hosting providers).</li>
            <li>When required by law, subpoena, or other legal process.</li>
            <li>To protect the rights, property, or safety of Media Hub, our users, or the public.</li>
          </ul>

          <h2>5. Security</h2>
          <p>
            We implement standard security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, or delete your personal data. Contact us to exercise these rights.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            For any privacy-related inquiries, please contact us at privacy@mediahub.example.com.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
