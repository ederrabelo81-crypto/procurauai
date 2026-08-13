import { useEffect, useMemo, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { PHOTO_PLACEHOLDER } from "@/lib/businessPhotos";

interface SmartImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> {
  /** Candidatas em ordem de preferência; a primeira que carregar é exibida. */
  sources: Array<string | null | undefined>;
  alt: string;
  /** Imagem final quando todas falharem. */
  placeholder?: string;
}

/**
 * `<img>` que degrada em vez de quebrar.
 *
 * Nenhuma imagem do app tinha `onError`: uma URL morta — link de foto do
 * Google que expirou, objeto removido do Storage, `cover_images` com string
 * vazia — deixava o ícone de imagem quebrada na tela. Aqui cada falha avança
 * para a próxima candidata e a última é sempre o placeholder.
 */
export function SmartImage({
  sources,
  alt,
  placeholder = PHOTO_PLACEHOLDER,
  className,
  ...imgProps
}: SmartImageProps) {
  const candidates = useMemo(() => {
    const cleaned = sources
      .map((source) => source?.trim())
      .filter((source): source is string => Boolean(source));

    // O placeholder fecha a fila; sem ele um erro na última candidata deixaria
    // a imagem quebrada.
    if (!cleaned.includes(placeholder)) cleaned.push(placeholder);

    return Array.from(new Set(cleaned));
  }, [sources, placeholder]);

  const [index, setIndex] = useState(0);

  // Lista nova (outro comércio reusando o mesmo nó) recomeça a fila.
  useEffect(() => {
    setIndex(0);
  }, [candidates]);

  const current = candidates[Math.min(index, candidates.length - 1)];
  const isPlaceholder = current === placeholder;

  return (
    <img
      {...imgProps}
      src={current}
      alt={alt}
      // O placeholder é um desenho, não uma foto: `contain` evita esticá-lo.
      className={cn(
        className,
        isPlaceholder && "object-contain p-4 opacity-70",
      )}
      onError={() => {
        setIndex((previous) =>
          previous < candidates.length - 1 ? previous + 1 : previous,
        );
      }}
    />
  );
}
