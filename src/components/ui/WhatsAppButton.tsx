import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  whatsapp: string;
  message?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'outline';
}

export function WhatsAppButton({ 
  whatsapp, 
  message = 'Olá! Vi seu anúncio no Monte de Tudo.',
  label = 'WhatsApp',
  size = 'md',
  className,
  variant = 'default'
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsapp}?text=${encodedMessage}`, '_blank');
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm gap-1.5',
    md: 'h-11 px-4 text-base gap-2',
    lg: 'h-14 px-6 text-lg gap-2.5'
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 touch-target",
        variant === 'default' 
          ? "bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 button-shadow" 
          : "border-2 border-whatsapp text-whatsapp hover:bg-whatsapp/10",
        sizeStyles[size],
        className
      )}
    >
      <MessageCircle className={iconSize[size]} />
      {label}
    </button>
  );
}
