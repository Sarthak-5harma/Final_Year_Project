/* ------------------------------------------------------------------
 * App.tsx  – top‑level router with Home + all pages
 * ------------------------------------------------------------------ */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Background from "./components/Background";
import Navbar from './components/Navbar';
import Footer from './components/Footer';

/* page components (relative paths, no alias) */
import HomePage               from './pages/HomePage';
import CredentialsPage        from './pages/CredentialsPage';
import ManualVerifyPage       from './pages/ManualVerifyPage';
import VerifyPage             from './pages/VerifyPage';
import IssueCredentialPage    from './pages/IssueCredentialPage';
import RevokeCredentialPage   from './pages/RevokeCredentialPage';
import UniversityListPage     from './pages/UniversityListPage';

/* ------------------------------------------------------------------ */

const App: React.FC = () => (
  <>
    <Background/>
    {/* top nav */}
    <Navbar />

    {/* main content */}
    <main className="min-h-[calc(100vh-136px)] px-4 py-10 container mx-auto">
      <Routes>
        {/* public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/view" element={<CredentialsPage />} />
        <Route path="/verify" element={<ManualVerifyPage />} />
        <Route path="/verify/:tokenId" element={<VerifyPage />} />

        {/* issuer / admin routes – links are hidden for non‑roles */}
        <Route path="/issue" element={<IssueCredentialPage />} />
        <Route path="/revoke" element={<RevokeCredentialPage />} />
        <Route path="/universities" element={<UniversityListPage />} />

        {/* example legacy redirect */}
        <Route path="/legacy-view" element={<Navigate to="/view" replace />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={<p className="text-center text-xl">404 – Page Not Found</p>}
        />
      </Routes>
    </main>

    {/* footer */}
    <Footer />
  </>
);

export default App;