'use client';

import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

// Step color configurations with gradients
const stepColors = [
  {
    // Step 1 - Info
    active: 'bg-info',
    inactive: 'bg-secondary/20',
    ring: 'ring-info/20',
    glow: 'shadow-lg shadow-info/30',
    connector: 'bg-info',
  },
  {
    // Step 2 - Primary
    active: 'bg-primary',
    inactive: 'bg-secondary/20',
    ring: 'ring-primary/20',
    glow: 'shadow-lg shadow-primary/30',
    connector: 'bg-primary',
  },
  {
    // Step 3 - Success
    active: 'bg-success',
    inactive: 'bg-secondary/20',
    ring: 'ring-success/20',
    glow: 'shadow-lg shadow-success/30',
    connector: 'bg-success',
  },
];

const StepWizard = ({ currentStep, totalSteps, className }: StepWizardProps) => {
  // Get icon for each step
  const getStepIcon = (stepNumber: number, isCompleted: boolean) => {
    if (isCompleted) {
      return <Icons.Check className="w-5 h-5 animate-in zoom-in-50 duration-300" />;
    }

    const iconClass = "w-5 h-5 sm:w-7 sm:h-7";
    switch (stepNumber) {
      case 1:
        return <Icons.Mail className={iconClass} />;
      case 2:
        return <Icons.Shield className={iconClass} />;
      case 3:
        return <Icons.Key className={iconClass} />;
      default:
        return stepNumber;
    }
  };

  return (
    <div className={cn('flex items-center justify-between w-full mb-8', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isCurrent = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const colors = stepColors[index] || stepColors[0];

        return (
          <div key={index} className="flex-1 flex items-center last:flex-none">
            {/* Step Circle */}
            <div className="relative group">
              {/* Pulse animation for current step */}
              {isCurrent && (
                <div
                  className={cn(
                    'absolute inset-0 rounded-full animate-ping opacity-75',
                    isActive ? colors.active : colors.inactive
                  )}
                  style={{ animationDuration: '2s' }}
                />
              )}
              
              <div
                className={cn(
                  'relative w-7 h-7 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold',
                  'transition-all duration-500 ease-out',
                  'transform',
                  isActive
                    ? cn(
                        colors.active,
                        'text-white',
                        'ring-4',
                        colors.ring,
                        colors.glow,
                        isCurrent ? 'scale-110' : 'scale-100'
                      )
                    : cn(
                        colors.inactive,
                        'text-secondary-500 dark:text-secondary-400',
                        'scale-90 opacity-60'
                      ),
                  // Hover effect
                  'group-hover:scale-105',
                  // Animation classes
                  isActive && 'animate-in zoom-in-50 duration-500'
                )}
              >
                {getStepIcon(stepNumber, isCompleted)}
              </div>

              {/* Step number label below (optional, can be removed) */}
              <div
                className={cn(
                  'absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap',
                  'transition-all duration-300',
                  isActive
                    ? 'text-foreground opacity-100'
                    : 'text-muted-foreground opacity-50'
                )}
              >
                {/* You can add step labels here if needed */}
              </div>
            </div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div className="flex-1 mx-3 relative h-2">
                {/* Background line */}
                <div className="absolute inset-0 bg-secondary-200 dark:bg-secondary-700 rounded-full" />
                
                {/* Progress line with animation */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-full transition-all duration-700 ease-out',
                    isActive ? cn(colors.connector, 'opacity-100 scale-x-100') : 'opacity-0 scale-x-0',
                    'origin-left'
                  )}
                  style={{
                    transformOrigin: 'left center',
                  }}
                />
                
                {/* Shimmer effect for active connector */}
                {isActive && (
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full',
                      colors.connector,
                      'animate-pulse opacity-50'
                    )}
                    style={{ animationDuration: '2s' }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepWizard;
