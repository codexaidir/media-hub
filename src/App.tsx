/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { Layout } from './components/Layout';

// Auth Pages
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// User Pages
import { Downloads } from './pages/Downloads';
import { UserProfile } from './pages/UserProfile';

// Legal Pages
import { TermsOfService } from './pages/legal/TermsOfService';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { DMCA } from './pages/legal/DMCA';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results" element={<Results />} />
              
              {/* Auth Routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Legal Routes */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/dmca" element={<DMCA />} />
              
              {/* User Routes */}
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/:userId" element={<UserProfile />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
