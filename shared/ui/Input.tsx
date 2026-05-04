import * as React from "react"
import { cn } from "@/lib/utils"
import ErrorMessage from "./ErrorMessage";
import { Icons } from "./Icons";
import { Tooltip } from "./Tooltip";
import { PasswordStrength } from "@/features/auth/components/AuthClientComponents";


export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  labelClassName?: string;
  inputWrapperClass?: string;
  name?: string;
  type?: string;
  value?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  showAiAction?: boolean;
  onAiAction?: () => void;
  aiActionTooltip?: string;
  aiActionDisabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, name, placeholder, labelClassName, disabled = false, value, icon, iconColor, inputWrapperClass, showAiAction, onAiAction, aiActionTooltip, aiActionDisabled = true, ...props }, ref) => {
    const IconComponent = icon;
    const [isFocused, setIsFocused] = React.useState(false);
    // Determine if label should float
    const shouldFloat = isFocused || (value && value.length > 0);

    return (<div className={cn("w-full  ", inputWrapperClass)}>
      <div className=" relative">
        <input
          type={type}
          placeholder={placeholder || " "}
          name={name}
          disabled={disabled}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            `peer w-full border py-3 text-sm md:text-md leading-relaxed focus:outline-none px-4 rounded-xl border-border/50 bg-secondary/30 
            transition-all duration-200 focus:border-primary/50 group-hover:border-primary/30 placeholder-transparent focus:placeholder-muted-foreground ${error ? 'focus:border-destructive border-destructive' : ''}`,
            showAiAction && "pe-12",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={name}
            className={cn(
              'pointer-events-none absolute inset-s-1 flex items-center gap-x-1.5 rounded-2xl bg-background z-10 px-2 py-1 transition-all duration-500 w-fit',
              // Base state (floating - when input has value)
              '-top-4 text-xs text-foreground/80 translate-y-0',
              // State when input is empty (placeholder is shown) AND not focused
              'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:bg-transparent',
              // State when focused (override placeholder-shown)
              'peer-focus:-top-4 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-foreground/80 peer-focus:bg-background',
              labelClassName
            )}
          >
            {IconComponent && (
              <IconComponent className={cn("inline h-4 w-4 transition-colors", iconColor ? iconColor : " text-primary")} />
            )}   {label}
          </label>
        )}
        {showAiAction && (
          <div className="absolute -top-1/3 inset-e-0 flex items-center justify-center  cursor-pointer">
            <Tooltip content={aiActionTooltip || ""}>
              <button
                type="button"
                onClick={onAiAction}
                disabled={aiActionDisabled}
                className={cn(
                  "transition-all duration-200 cursor-pointer",
                  aiActionDisabled
                    ? "text-warning/70  cursor-not-allowed"
                    : "text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg p-1.5"
                )}
              >
                <Icons.AiSpark className="h-4.5 w-4.5 " />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
      {name === "password" && <PasswordStrength name="password" />}
      {error && <ErrorMessage message={error} />}
    </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
