import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-500  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary shadow hover:bg-primary hover:text-primary-foreground",
        secondary:
          "border-transparent bg-foreground/5  shadow hover:bg-secondary text-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-destructive shadow hover:bg-destructive/80 hover:text-destructive-foreground",
        danger:
          "border-transparent bg-destructive/10 text-destructive shadow hover:bg-destructive/80 hover:text-destructive-foreground",
        success:
          "border-transparent shadow hover:bg-success text-[10px] bg-success/10 text-success hover:text-white",
        warning:
          "border-transparent bg-warning/10 text-warning shadow hover:bg-warning/80 hover:text-warning-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
export default Badge

