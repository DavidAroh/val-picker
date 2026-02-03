import * as React from "react";
// import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
    {
        variants: {
            variant: {
                primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground shadow-none",
                link: "text-primary underline-offset-4 hover:underline shadow-none",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            },
            size: {
                default: "h-10 px-6 py-2",
                sm: "h-9 px-4",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
            fullWidth: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, asChild = false, loading, children, ...props }, ref) => {
        // We haven't installed @radix-ui/react-slot, so let's stick to standard button for now or install it.
        // For simplicity without extra deps, I'll remove Slot support unless required. 
        // Spec didn't ask for Radix specifically, but it's good practice. 
        // I will use standard button for now to avoid installing more deps if I don't need to.
        const Comp = "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                disabled={props.disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
