import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'danger' | 'ghost';
const style: Record<Variant,string> = {
  primary: 'bg-gradient-to-r from-sky-500 via-purple-500 to-blue-500 text-white shadow-md hover:from-sky-600 hover:to-blue-600',
  danger:  'bg-gradient-to-r from-rose-500 to-rose-700 text-white shadow-md hover:from-rose-600 hover:to-rose-800',
  ghost:   'bg-white/40 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 text-brand-700 hover:bg-white/60 hover:shadow',
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement>{
  variant?: Variant;
}
const Button:React.FC<Props>=({variant='primary',className,...rest})=>(
  <button
    {...rest}
    className={clsx(
      'px-5 py-2.5 rounded-xl font-semibold transition-all duration-150',
      'hover:shadow-lg active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-brand-400/60', style[variant], className
    )}
  />
);
export default Button;