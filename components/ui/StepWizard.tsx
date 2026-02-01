'use client';

import { cn } from '@/lib/utils';

interface StepWizardProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const StepWizard = ({ currentStep, totalSteps, className }: StepWizardProps) => {
  return (
    <div className={cn('flex items-center justify-between w-full mb-8', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={index} className="flex-1 flex items-center last:flex-none">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                isActive
                  ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                  : 'bg-secondary-200 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400'
              )}
            >
              {isCompleted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded transition-all duration-300',
                  isActive ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepWizard;
