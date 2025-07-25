/* A minimal Radix Dialog wrapper mimicking shadcn/ui API */

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../lib/utils.ts';  // helper below

export const Dialog      = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent: React.FC<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>> =
  ({ className, children, ...props }) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <DialogPrimitive.Content
        {...props}
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[90vw] max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg',
          className
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DialogPrimitive.Title className="text-lg font-semibold">{children}</DialogPrimitive.Title>
);