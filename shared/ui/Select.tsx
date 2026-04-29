import * as React from "react"
import { cn } from "@/lib/utils"
import ErrorMessage from "./ErrorMessage";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  label?: string
  error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, ...props }, ref) => {
    return (<div className="w-full">
      {label && <label htmlFor={props.id} className="text-sm font-medium text-muted-foreground p-2">
        {label}
      </label>}
      <select
        id={props.id}
        className={cn(
          "flex mt-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <ErrorMessage message={error} />}
    </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
