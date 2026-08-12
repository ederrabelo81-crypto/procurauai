import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Plus, Map, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/buscar', icon: Search, label: 'Buscar' },
  { to: '/publicar', icon: Plus, label: 'Publicar', isAction: true },
  { to: '/mapa', icon: Map, label: 'Mapa' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

/**
 * Barra inferior no formato de fita impressa: filete hachurado no topo,
 * item ativo marcado com bloco de tinta e um traço sob o rótulo.
 */
export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/92 backdrop-blur-lg safe-bottom">
      {/* Filete hachurado — assinatura do design system */}
      <span aria-hidden className="absolute inset-x-0 -top-[3px] h-[3px] bg-hatch" />

      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className="group -mt-6 flex flex-col items-center justify-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground button-shadow transition-transform duration-200 group-active:translate-y-1 group-active:shadow-none">
                  <Icon className="h-7 w-7" strokeWidth={2.6} />
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-md transition-colors touch-target',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border transition-all duration-200',
                  isActive
                    ? 'border-primary/30 bg-primary/12'
                    : 'border-transparent'
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.9} />
              </span>

              <span
                className={cn(
                  'text-2xs leading-none transition-all',
                  isActive ? 'font-bold' : 'font-medium'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
