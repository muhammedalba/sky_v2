import * as React from "react"
import { cn } from "@/lib/utils"
import ErrorMessage from "./ErrorMessage";

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
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, name, placeholder, labelClassName, disabled=false, value, icon,inputWrapperClass, ...props }, ref) => {
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
              `pointer-events-none absolute inset-s-1 flex items-center gap-x-1 rounded-2xl bg-background z-10 px-2 py-1 text-sm transition-all duration-500 ` ,
              shouldFloat 
                ? '-top-4 text-xs text-foreground/80  w-fit' 
                : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground w-fit bg-transparent',
                
              labelClassName
            )}
          >
         
             {IconComponent && (
                    <IconComponent className={` ${shouldFloat ? 'text-primary' : 'text-muted-foreground'} inline h-4 text-primary`} />
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
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
     {error && <ErrorMessage  message={error} />}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
