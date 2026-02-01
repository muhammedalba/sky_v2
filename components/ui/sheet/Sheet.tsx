'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

const Sheet = ({ 
  children, 
  open, 
  onOpenChange 
}: { 
  children: React.ReactNode; 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void; 
}) => {
  // Uncontrolled state fallback
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : uncontrolledOpen;
  const handleOpenChange = isControlled ? onOpenChange : setUncontrolledOpen;

  return (
    <SheetContext.Provider value={{ open: currentOpen!, onOpenChange: handleOpenChange! }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger = ({
  children,
  asChild,
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
  const context = React.useContext(SheetContext);
  
  if (!context) throw new Error("SheetTrigger must be used within a Sheet");

  return (
    <button
      className={cn(className)}
      onClick={() => context.onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
};

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sheetVariants>
>(({ side = "right", className, children, ...props }, ref) => {
  const context = React.useContext(SheetContext);
  
  if (!context) return null;
  if (!context.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div 
        className="fixed inset-0 bg-black/80 animate-in fade-in-0" 
        onClick={() => context.onOpenChange(false)}
      />
      <div
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <button 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary"
          onClick={() => context.onOpenChange(false)}
        >
          <Icons.Menu className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
});
SheetContent.displayName = "SheetContent";

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out animate-in duration-300",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

export { Sheet, SheetTrigger, SheetContent };
