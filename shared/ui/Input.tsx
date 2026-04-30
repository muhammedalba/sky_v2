import * as React from "react"
import { cn } from "@/lib/utils"
import ErrorMessage from "./ErrorMessage";
import { Icons } from "./Icons";
import { Tooltip } from "./Tooltip";


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
  ({ className, type, label, error, name, placeholder, labelClassName, disabled=false, value, icon, iconColor, inputWrapperClass, showAiAction, onAiAction, aiActionTooltip, aiActionDisabled, ...props }, ref) => {
      const IconComponent = icon;
      const [isFocused, setIsFocused] = React.useState(false);
      
      // Determine if label should float
      const shouldFloat = isFocused || (value && value.length > 0);
      
    return (<div className={cn("w-full  ", inputWrapperClass)}>  
      <div className=" relative">
        {label && (
          <label 
            htmlFor={name} 
            className={cn(
              `pointer-events-none absolute inset-s-1 flex items-center gap-x-1.5 rounded-2xl bg-background z-10 px-2 py-1 text-sm transition-all duration-500 ` ,
              shouldFloat 
                ? '-top-4 text-xs text-foreground/80  w-fit' 
                : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground w-fit bg-transparent',
                
              labelClassName
            )}
          >
         
             {IconComponent && (
                    <IconComponent className={cn("inline h-4 w-4 transition-colors", iconColor ?  iconColor  : " text-primary")} />
                )}   {label}
          </label>
        )}
        <input
          type={type}
          placeholder={placeholder}
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
            `w-full border py-3 text-sm md:text-md leading-relaxed  focus:outline-none px-4 rounded-xl border-border/50 bg-secondary/30 
            transition-all duration-200 focus:border-primary/50 group-hover:border-primary/30 ${error ? 'focus:border-destructive border-destructive' : ''}`,
            showAiAction && "pe-12",
            className
          )}
          ref={ref}
          {...props}
        />
        {showAiAction && (
          <div className="absolute inset-y-0 inset-e-3 flex items-center justify-center">
            <Tooltip content={aiActionTooltip || ""}>
              <button
                type="button"
                onClick={onAiAction}
                disabled={aiActionDisabled}
                className={cn(
                  "transition-all duration-200",
                  aiActionDisabled 
                    ? "text-slate-200 cursor-not-allowed" 
                    : "text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg p-1.5"
                )}
              >
                <Icons.AiSpark className="h-4.5 w-4.5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
     {error && <ErrorMessage  message={error} />}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
