import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/maps";
import {
  checkStreetViewCoverage,
  getStreetViewCoverage,
  type StreetViewCoverage,
} from "@/lib/streetView";

/**
 * Dispara a consulta de cobertura do Street View e re-renderiza quando ela
 * responde.
 *
 * `resolveBusinessPhotos()` é síncrona e só oferece Street View quando a
 * cobertura já é conhecida. Este hook é a metade assíncrona: pergunta uma vez
 * por coordenada (a consulta é gratuita e fica em cache na sessão) e devolve o
 * resultado, o que faz o componente renderizar de novo — aí a cadeia de fotos
 * passa a incluir a fachada.
 *
 * Passe `null` quando o comércio já tem foto: sem coordenada a consultar, o
 * hook não faz nada.
 */
export function useStreetViewProbe(
  position: LatLng | null | undefined,
): StreetViewCoverage | undefined {
  const [coverage, setCoverage] = useState<StreetViewCoverage | undefined>(() =>
    getStreetViewCoverage(position),
  );

  // Chave primitiva: `position` costuma ser um objeto novo a cada render, e
  // como dependência direta reexecutaria o efeito para sempre.
  const key = position ? `${position.lat},${position.lng}` : null;

  useEffect(() => {
    if (!position) {
      setCoverage(undefined);
      return;
    }

    const known = getStreetViewCoverage(position);
    if (known) {
      setCoverage(known);
      return;
    }

    let ativo = true;
    checkStreetViewCoverage(position).then((result) => {
      if (ativo) setCoverage(result);
    });

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return coverage;
}
