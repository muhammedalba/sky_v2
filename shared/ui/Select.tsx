import * as React from "react"
import { cn } from "@/lib/utils"
import ErrorMessage from "./ErrorMessage";
import { Icons } from "./Icons";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  icon?: React.ComponentType<{ className?: string }>
  label?: string
  error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, icon, ...props }, ref) => {
    const IconComponent = icon;

    return (<div className={cn("w-full flex items-center h-10 relative  ",className)}>
      {/* {label && <label htmlFor={props.id} className="text-sm font-medium text-muted-foreground p-2">
        {label} 
      </label>}*/}
      <select
        id={props.id}
        className={cn(
          "flex h-10 py-2 ps-5 w-full rounded-md border border-input bg-background   text-sm ring-offset-background ",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-none focus:outline-none focus:ring-1 focus:ring-primary/80  disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive"
        )}
        ref={ref}
        {...props}
      >
        <option className="" value="" disabled>{label || 'Select'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {IconComponent ? <IconComponent className="absolute top-1/2 inset-s-3 my-auto w-4 h-4 text-cyan-500 pointer-events-none" />
        : <Icons.Edit className="absolute top-1/3 inset-s-2 my-auto w-4 h-4 text-cyan-500 pointer-events-none" /> }
      {/* <Icons.ChevronDown className="absolute top-1/2 inset-e-3 my-auto w-4 h-4 text-muted-foreground pointer-events-none" /> */}
      {error && <ErrorMessage message={error} />}
    </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
