import React from 'react';
import { PageTransition } from '../../components/PageTransition';
import { Shield } from 'lucide-react';

export function TermsOfService() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500">Last Updated: August 3, 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Media Hub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Media Hub provides a tool for extracting and downloading media assets from various supported platforms. The service is intended for personal use and for downloading content you have the right to access and save.
          </p>

          <h2>3. User Responsibilities and Acceptable Use</h2>
          <p>
            You agree to use Media Hub only for lawful purposes. You specifically agree not to:
          </p>
          <ul>
            <li>Extract or download copyrighted material without permission from the copyright holder.</li>
            <li>Use the service to distribute malicious software or harmful content.</li>
            <li>Attempt to bypass or circumvent any usage limits, security measures, or rate limiting implemented by our service.</li>
            <li>Use the tool for large-scale, automated scraping unless explicitly authorized via a commercial API agreement.</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            Media Hub does not claim ownership of the content you extract using our service. You are solely responsible for ensuring you have the necessary rights and permissions to download, store, and use the media you extract.
          </p>
          <p>
            The Media Hub brand, website design, and underlying code are the intellectual property of Media Hub and are protected by applicable copyright and trademark laws.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            Media Hub is provided "as is" and "as available" without any warranties of any kind. We do not guarantee that the service will always be available, secure, or error-free.
          </p>
          <p>
            In no event shall Media Hub or its operators be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service or inability to use the service.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any significant changes by updating the "Last Updated" date at the top of this page. Your continued use of the service after such modifications constitutes your acceptance of the new terms.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at legal@mediahub.example.com.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
