import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full py-6 text-center text-sm text-zinc-500">
    © {new Date().getFullYear()} CredChain Demo
  </footer>
);

export default Footer;