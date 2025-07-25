import React from "react";

/**
 
A translucent, animated gradient overlay that sits behind all content.
Tailwind classes control blur, opacity & animation.*/
const Background: React.FC = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 -z-10
               bg-gradient-to-tr from-sky-300/30 via-purple-300/30 to-transparent
               blur-2xl animate-bg-loop"
    style={{ backgroundSize: "200% 200%" }}
  />
);

export default Background;

 