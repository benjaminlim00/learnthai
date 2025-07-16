import { cn } from "@/lib/utils/style"
import { cva, type VariantProps } from "class-variance-authority"

const spinnerVariants = cva(
  "inline-flex h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        default: "h-4 w-4",
        lg: "h-6 w-6",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
        muted: "text-muted-foreground",
        current: "text-current",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string
}

function LoadingSpinner({
  className,
  size,
  variant,
  text,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn("flex flex-col items-center gap-2", className)}
      {...props}
    >
      <div
        className={cn(spinnerVariants({ size, variant }))}
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export { LoadingSpinner, spinnerVariants }
