import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center fade-in">
    <h1 className="text-4xl md:text-5xl font-bold mb-2">
      Welcome to <span className="text-primary">CredChain</span>
    </h1>
    <p className="text-slate-600 mb-8">
      Blockchain‑backed academic credentials you can verify anywhere.
    </p>

    <div className="flex gap-4">
      <Link to="/view" className="btn-primary">View My Credentials</Link>
      <Link to="/verify" className="btn-outline">Verify a Credential</Link>
    </div>
  </div>
);

export default HomePage;
