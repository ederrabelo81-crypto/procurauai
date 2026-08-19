import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TransporteService } from "@/services/transporteServices";
import { TRANSPORTE_CATEGORIA_LABELS } from "@/services/transporteServices";
import { Phone, TrendingUp, MessageCircle } from "lucide-react";

interface TransporteServiceCardProps {
  service: TransporteService;
}

export function TransporteServiceCard({ service }: TransporteServiceCardProps) {
  const categoriaLabel = TRANSPORTE_CATEGORIA_LABELS[service.categoria];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{service.nome}</h3>
            <Badge variant="secondary" className="mt-1">
              {categoriaLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
            <TrendingUp className="h-3 w-3" />
            {service.vezes_pedido}x
          </div>
        </div>

        {service.exemplos_pedido && service.exemplos_pedido.length > 0 && (
          <p className="text-sm text-muted-foreground italic line-clamp-2">
            "{service.exemplos_pedido[0]}"
          </p>
        )}

        <div className="flex items-center gap-2 pt-2">
          {service.contato_vcf_encontrado ? (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                // Tenta abrir o WhatsApp ou discar
                window.location.href = `tel:${service.contato_vcf_encontrado}`;
              }}
            >
              <Phone className="h-4 w-4 mr-2" />
              Ligar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Abre busca no Google Maps para o serviço
                const query = encodeURIComponent(`${service.nome} ${categoriaLabel} Monte Santo MG`);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
              }}
            >
              Buscar no Maps
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // Abre WhatsApp com mensagem genérica
              window.open(`https://wa.me/?text=Olá, vi seu contato no app da cidade e gostaria de saber mais sobre ${service.nome}`, "_blank");
            }}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          {service.status === "nao_listado" && (
            <Badge variant="destructive" className="text-[10px]">
              Não listado no app
            </Badge>
          )}
          {service.confianca === "alta" && (
            <Badge variant="default" className="text-[10px]">
              Alta confiança
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
