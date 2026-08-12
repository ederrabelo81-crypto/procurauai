import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDarkMode } from '@/hooks/useDarkMode';

interface ThemeToggleProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function ThemeToggle({ className, variant = 'compact' }: ThemeToggleProps) {
  const { theme, setTheme, isDark } = useDarkMode();

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card transition-colors",
          "text-foreground hover:border-primary/50 hover:text-primary",
          className
        )}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <div className={cn("almanac-card p-4", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-3">Aparência</h3>
      <div className="flex gap-2">
        {[
          { id: 'light' as const, icon: Sun, label: 'Claro' },
          { id: 'dark' as const, icon: Moon, label: 'Escuro' },
          { id: 'system' as const, icon: Monitor, label: 'Sistema' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
              theme === id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
