import { CallButton, WhatsAppButton } from "@/components/ui/ActionButtons";
import {
  CATEGORIA_SERVICO_LABELS,
  type HealthService,
} from "@/services/healthServices";
import { cn } from "@/lib/utils";

interface HealthServiceCardProps {
  service: HealthService;
  className?: string;
}

/** Contato de saúde/serviço público — sem foto, sem mapa, sem cadastro comercial. */
export function HealthServiceCard({
  service,
  className,
}: HealthServiceCardProps) {
  const digits = service.telefone.replace(/\D/g, "");
  const hasPhone = digits.length > 0;

  return (
    <article className={cn("almanac-card flex flex-col gap-3 p-4", className)}>
      <div>
        <p className="eyebrow mb-1 text-muted-foreground">
          {CATEGORIA_SERVICO_LABELS[service.categoria_servico]}
        </p>
        <h3 className="font-display text-base font-bold text-foreground">
          {service.nome}
        </h3>
      </div>

      {hasPhone ? (
        <div className="flex gap-2">
          <WhatsAppButton whatsapp={digits} size="sm" className="flex-1" />
          <CallButton phone={service.telefone} size="sm" className="flex-1" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Telefone não confirmado ainda.
        </p>
      )}
    </article>
  );
}
