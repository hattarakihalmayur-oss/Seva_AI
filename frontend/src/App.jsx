import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Common Components (loaded eagerly — always visible)
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import FloatingAiAssistant from './components/common/FloatingAiAssistant';

// ── Lazy-loaded pages (code splitting for faster initial load) ─────────────
const Home = lazy(() => import('./pages/Home'));
const LanguagePage = lazy(() => import('./pages/LanguagePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SchemeSearchPage = lazy(() => import('./pages/SchemeSearchPage'));
const SchemeDetailPage = lazy(() => import('./pages/SchemeDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SavedSchemesPage = lazy(() => import('./pages/SavedSchemesPage'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * ScrollToTop: Scrolls to the top of the page on every route change.
 * Must be inside BrowserRouter to access useLocation.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

/**
 * Page loading fallback — shown while lazy-loaded chunks download.
 */
function PageLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      <LoadingSkeleton lines={3} />
      <LoadingSkeleton lines={5} />
      <LoadingSkeleton lines={4} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <div
              className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-orange-500 selection:text-white"
            >
              <Navbar />

              {/* main-content id enables the skip-to-content accessibility link */}
              <main id="main-content" className="flex-1">
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    {/* 1. Home / Landing Page */}
                    <Route path="/" element={<Home />} />

                    {/* 2. Language Selection */}
                    <Route path="/language" element={<LanguagePage />} />

                    {/* 3. AI Chat and Voice Interaction */}
                    <Route path="/chat" element={<ChatPage />} />

                    {/* 4. Scheme Search and Results */}
                    <Route path="/schemes" element={<SchemeSearchPage />} />

                    {/* 5. Scheme Details */}
                    <Route path="/schemes/:id" element={<SchemeDetailPage />} />

                    {/* 6. Login */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* 7. Registration */}
                    <Route path="/register" element={<RegisterPage />} />

                    {/* 8. User Dashboard */}
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* 9. Saved Schemes */}
                    <Route path="/saved" element={<SavedSchemesPage />} />

                    {/* 10. Citizen Applications & DigiLocker Vault */}
                    <Route path="/applications" element={<ApplicationsPage />} />

                    {/* 11. User Profile */}
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* 11. Not Found Page */}
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>

              <FloatingAiAssistant />
              <Footer />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
