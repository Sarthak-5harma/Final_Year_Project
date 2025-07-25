import React from 'react';
import clsx from 'clsx';

/** glassy white container */
const Card:React.FC<React.HTMLAttributes<HTMLDivElement>>=({className,...rest})=>(
  <div
    {...rest}
    className={clsx(
      'rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xl',
      'border border-transparent bg-clip-padding',
      'ring-1 ring-brand-200/40',
      'p-8 transition-all duration-200',
      'hover:shadow-2xl hover:ring-2 hover:ring-brand-400/60',
      'relative before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none',
      'before:bg-gradient-to-tr before:from-sky-300/30 before:via-purple-300/20 before:to-transparent',
      className
    )}
  />
);
export default Card;