# Media Hub Documentation

## Overview
**Media Hub** is a robust, responsive web application built to extract, preview, and download media assets (images and videos) from various platforms and generic websites. It provides an intuitive interface for users to paste a URL, parse the media contents, select desired assets, and download them either individually or as a bulk ZIP archive.

## Tech Stack
- **Frontend Framework:** React 18/19 with TypeScript
- **Build Tool / Server:** Vite & Express (Full-stack architecture configured in `server.ts`)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS (with `@tailwindcss/typography` for legal prose)
- **Animations:** Framer Motion (`motion/react`)
- **Icons:** Lucide React
- **Media Utilities:** `axios` (for blob fetching), `file-saver` (for saving files), `jszip` (for bulk ZIP creation)

## Core Features
1. **Media Extraction Engine (Server-Side Proxy):** 
   - Users can paste URLs into the home page input. 
   - An animated `AnalysisOverlay` simulates the processing of the URL while the backend fetches and parses the source HTML.
   - The engine uses `cheerio` for structured DOM parsing (extracting `<img src>`, `<video src>`) and a robust regex fallback to catch raw media URLs embedded in page source or JavaScript data blobs.
   - Includes platform-specific mocks (e.g. YouTube video extraction simulation) to handle natively obfuscated media streams.

2. **Results & Previews:**
   - Media items are displayed in a responsive masonry-style grid (`Results` page).
   - High-quality image and video previews using the `MediaCard` component.
   - **Category Tabs:** Dynamic filtering allows users to sort results by type (All, Images (JPG/JPEG), PNG, Videos, GIFs).
   - Users can select multiple items for bulk actions.

3. **Secure Downloading:**
   - Individual or Bulk ZIP downloads are supported.
   - **Download Gate:** Downloads are protected. Guest users attempting to download are automatically redirected to the Sign In page.

4. **Authentication System:**
   - Complete Auth flow UI including: Sign In, Sign Up, Email OTP Verification, Forgot Password, and Reset Password.
   - Managed globally via `AuthContext` utilizing local storage for session persistence in this prototype.

5. **User Dashboard:**
   - User Profiles showing extraction stats.
   - "My Downloads" section for tracking extracted media (UI implemented).

6. **Pricing & Tiers:**
   - **Basic (Free):** Up to 3 extractions per day.
   - **Pro ($5/mo):** Unlimited extractions, private content downloading, highest available resolution.

7. **Legal & Compliance:**
   - Fully fleshed out Terms of Service, Privacy Policy, and DMCA pages.

## Project Structure
```text
/
├── server.ts                   # Express server entry point (Vite middleware in dev)
├── package.json                # Dependencies and build scripts
├── tailwind.config.js / css    # Tailwind setup and globals
├── src/
│   ├── App.tsx                 # Main application router and context providers
│   ├── main.tsx                # React DOM entry point
│   ├── context/
│   │   ├── index.tsx           # AppContext (Media extraction state)
│   │   └── AuthContext.tsx     # User authentication state
│   ├── components/
│   │   ├── Layout.tsx          # Global header, navigation, and user dropdown
│   │   ├── MediaCard.tsx       # Individual media asset preview & download controls
│   │   ├── PageTransition.tsx  # Framer Motion page transition wrappers
│   │   └── AnalysisOverlay.tsx # Loading state for URL extraction
│   ├── pages/
│   │   ├── Home.tsx            # Landing page (hero, URL input, features, pricing, FAQ)
│   │   ├── Results.tsx         # Extraction results grid and bulk actions
│   │   ├── Downloads.tsx       # User's download history
│   │   ├── UserProfile.tsx     # User account details
│   │   ├── auth/               # Authentication views (SignIn, SignUp, VerifyEmail, etc.)
│   │   └── legal/              # Legal documents (TermsOfService, PrivacyPolicy, DMCA)
│   └── lib/
│       └── utils.ts            # Utility functions (e.g., tailwind class merging)
```

## User Flows

### 1. Guest Extraction Flow
1. User lands on `/` (Home).
2. Pastes a URL (e.g., Instagram, YouTube) and clicks "Go".
3. `AnalysisOverlay` shows processing steps.
4. User is routed to `/results` to view the grid of extracted media.
5. User clicks "Download" on an item or "Download Selected".
6. *System intercepts:* User is not authenticated -> Redirects to `/signin`.

### 2. Authentication Flow
1. User clicks "Sign In" or is redirected.
2. If new, user clicks "Create Account", enters details, and completes OTP Verification.
3. Once authenticated, user state is saved in `AuthContext` and `localStorage`.
4. User can now download media successfully from the `/results` page.

### 3. Bulk Download Flow (Authenticated)
1. User clicks checkboxes on multiple `MediaCard` items on the Results page.
2. Clicks the floating "Download Selected" button.
3. System fetches each file as a blob via Axios.
4. System bundles blobs into a ZIP file using `JSZip`.
5. System triggers browser download of the ZIP using `file-saver`.

## Adding Real Integrations (Future Steps)
To take this application from prototype to production:
1. **Backend Extraction:** Replace the dummy `setTimeout` data in `AppContext` with real API calls to an extraction microservice or a headless browser service (e.g., Puppeteer/Playwright) to scrape the requested URL.
2. **Database Authentication:** Replace `localStorage` mock auth with Firebase Auth or Supabase.
3. **Database Storage:** Store user download history and profiles in a database like PostgreSQL (via Cloud SQL) or Firestore.
4. **Payment Gateway:** Integrate Stripe for handling the Pro ($5/month) subscription tier.
