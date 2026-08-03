import React from 'react';
import { PageTransition } from '../../components/PageTransition';
import { FileWarning } from 'lucide-react';

export function DMCA() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileWarning className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">DMCA Copyright Policy</h1>
          <p className="text-slate-500">Last Updated: August 3, 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <h2>1. Policy Statement</h2>
          <p>
            Media Hub ("Service") respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement committed using our Service.
          </p>
          <p>
            Please note that Media Hub is a pass-through extraction tool. <strong>We do not host, store, or distribute any media files on our servers.</strong> Our service merely facilitates the extraction of media from publicly available third-party URLs. As such, we cannot remove content from the original source servers.
          </p>

          <h2>2. Filing a DMCA Notice</h2>
          <p>
            If you are a copyright owner or an agent thereof, and you believe that any use of our Service infringes upon your copyrights, you may submit a notification pursuant to the DMCA by providing our Designated Copyright Agent with the following information in writing:
          </p>
          <ul>
            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity. Since we do not host files, you must provide the specific URLs (e.g., Instagram or YouTube links) that are allegedly being processed improperly through our tool.</li>
            <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an email address.</li>
            <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          </ul>

          <h2>3. Action Upon Receipt of Notice</h2>
          <p>
            Upon receipt of a valid DMCA notice, our actions are limited due to the nature of our service. However, we may take the following actions:
          </p>
          <ul>
            <li>Block specific source URLs or domains from being processed by our extraction engine.</li>
            <li>Terminate the accounts of users who are found to be repeat infringers of this policy.</li>
          </ul>
          <p>
            To effectively remove the infringing content from the internet, we strongly advise you to send your DMCA notice directly to the platform hosting the media (e.g., YouTube, Instagram, etc.).
          </p>

          <h2>4. Designated Copyright Agent</h2>
          <p>
            Notices of claimed copyright infringement should be directed to our Designated Agent at:
          </p>
          <address className="not-italic bg-slate-50 p-4 rounded-xl border border-slate-100">
            <strong>Media Hub Copyright Agent</strong><br />
            Email: dmca@mediahub.example.com<br />
            Address: 123 Extraction Way, Tech District, San Francisco, CA 94105
          </address>

          <h2>5. Counter-Notice</h2>
          <p>
            If you believe that a URL was blocked by mistake or misidentification, you may file a counter-notice with our Designated Agent containing the following information:
          </p>
          <ul>
            <li>Your physical or electronic signature.</li>
            <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or disabled.</li>
            <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification.</li>
            <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located.</li>
          </ul>
        </div>
      </div>
    </PageTransition>
  );
}
