import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botões do design system "Almanaque".
 *
 * Física: os botões sólidos têm uma "espessura" (sombra dura embaixo) e
 * afundam ao serem pressionados — parece um carimbo, não um retângulo chapado.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground button-shadow hover:brightness-110 active:translate-y-0.5 active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_2px_0_0_hsl(var(--destructive)/0.55)] hover:brightness-110 active:translate-y-0.5 active:shadow-none",
        outline:
          "border border-border bg-card text-foreground card-shadow hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_2px_0_0_hsl(var(--secondary)/0.5)] hover:brightness-110 active:translate-y-0.5 active:shadow-none",
        accent:
          "bg-accent text-accent-foreground shadow-[0_2px_0_0_hsl(var(--accent)/0.55)] hover:brightness-105 active:translate-y-0.5 active:shadow-none",
        ghost: "text-foreground hover:bg-muted hover:text-primary",
        link: "text-primary underline-offset-4 decoration-primary/40 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
