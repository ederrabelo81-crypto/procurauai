import React from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type CallButtonProps = {
  phone?: string | null;
  className?: string;
  size?: "sm" | "md";
  children?: React.ReactNode;
};

/**
 * Botão simples para ligar (tel:)
 * - Só renderiza se houver telefone válido
 * - Normaliza para tel: removendo espaços e caracteres comuns
 */
export function CallButton({
  phone,
  className,
  size = "sm",
  children,
}: CallButtonProps) {
  const raw = (phone || "").trim();
  if (!raw) return null;

  // Mantém + e dígitos (bom o suficiente pro cenário atual)
  const tel = raw.replace(/[^\d+]/g, "");
  if (!tel) return null;

  const sizeClasses =
    size === "sm"
      ? "h-10 px-4 text-sm rounded-lg"
      : "h-12 px-5 text-base rounded-lg";

  return (
    <a
      href={`tel:${tel}`}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold border border-border bg-background hover:bg-muted transition-colors",
        sizeClasses,
        className
      )}
      aria-label={`Ligar para ${raw}`}
    >
      <Phone className="w-4 h-4" />
      {children ?? "Ligar"}
    </a>
  );
}
