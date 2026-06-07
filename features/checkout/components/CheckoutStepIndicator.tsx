import { CheckCircle2 } from "lucide-react";

import { useTranslations } from "next-intl";

interface CheckoutStepIndicatorProps {
  currentStep: number;
}

export function CheckoutStepIndicator({
  currentStep,
}: CheckoutStepIndicatorProps) {
  const t = useTranslations("cart");

  const steps = [
    t("steps.shipping_info"),
    t("steps.shipping_and_payment"),
    t("steps.review_and_confirm")
  ];

  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md
                  ${
                    isDone
                      ? "bg-success text-white scale-90"
                      : isActive
                        ? "bg-primary text-primary-foreground scale-110 shadow-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap text-center leading-tight transition-colors
                  ${
                    isActive
                      ? "text-primary"
                      : isDone
                        ? "text-success"
                        : "text-muted-foreground"
                  }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mt-[-14px] rounded-full transition-all duration-500
                  ${isDone ? "bg-success" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
