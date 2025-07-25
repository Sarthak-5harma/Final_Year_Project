import React from 'react';
import Navbar from '../components/Navbar';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    <footer className="text-center text-sm text-gray-500 py-6">
      © {new Date().getFullYear()} CredChain Demo
    </footer>
  </>
);

export default AppShell;
