import { cn } from '@/lib/utils';

interface ChipProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

export function Chip({ 
  children, 
  isActive = false, 
  onClick, 
  variant = 'default',
  size = 'md',
  className 
}: ChipProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all touch-target whitespace-nowrap";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs min-h-[32px]",
    md: "px-4 py-2 text-sm min-h-[40px]"
  };

  const variantStyles = {
    default: cn(
      "border",
      isActive 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-card text-foreground border-border hover:border-primary/50"
    ),
    outline: cn(
      "border-2",
      isActive 
        ? "border-primary text-primary bg-primary/5" 
        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
    ),
    secondary: cn(
      isActive 
        ? "bg-secondary text-secondary-foreground" 
        : "bg-muted text-muted-foreground hover:bg-muted/80"
    )
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        onClick && "cursor-pointer active:scale-95",
        className
      )}
    >
      {children}
    </button>
  );
}
