import { Link } from "react-router-dom";
import {
  VerifiedBadge,
  OpenBadge,
  ClosedBadge,
  RatingBadge,
} from "@/components/ui/BadgePill";
import { TagChip } from "@/components/ui/TagChip";
import { CTAGrid } from "@/components/ui/ActionButtons";
import { SmartImage } from "@/components/ui/SmartImage";
import { MiniMap } from "@/components/maps";
import type { Business } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { getBusinessTags } from "@/lib/businessTags";
import { isOpenNow } from "@/lib/tagUtils";
import { normalizeBusinessData } from "@/lib/dataNormalization";
import { PHOTO_PLACEHOLDER, resolveBusinessPhotos } from "@/lib/businessPhotos";
import { useStreetViewProbe } from "@/hooks/useStreetViewProbe";
import { buildPlaceQuery, toLatLng } from "@/lib/maps";

interface BusinessCardProps {
  business: Business & { latitude?: number; longitude?: number };
  variant?: "default" | "compact";
  className?: string;
}

export function BusinessCard({
  business: rawBusiness,
  variant = "default",
  className,
}: BusinessCardProps) {
  const business = normalizeBusinessData(rawBusiness);

  const isCompact = variant === "compact";
  const tags = getBusinessTags(business);
  const open = isOpenNow(business.hours);
  const position = toLatLng(
    rawBusiness.latitude ?? business.latitude,
    rawBusiness.longitude ?? business.longitude,
  );

  // Foto própria do comércio: capa gravada, logo ou acervo curado. Não depende
  // da consulta de cobertura, então é estável entre renders — é o que decide se
  // vale consultar o Street View.
  const ownPhotos = resolveBusinessPhotos(business, {
    useStreetView: false,
    fallbackToPlaceholder: false,
  });

  // Só consulta a cobertura de quem depende dela: quem já tem foto própria não
  // precisa de fachada. Quando a resposta chega, o hook re-renderiza e
  // `coverImages` passa a incluir o Street View.
  useStreetViewProbe(ownPhotos.length === 0 ? position : null);

  // Sem foto nenhuma, o mapa da localização é uma capa melhor do que o desenho
  // vazio — por isso o placeholder sai da lista.
  const photos =
    ownPhotos.length > 0
      ? ownPhotos
      : business.coverImages.filter((photo) => photo !== PHOTO_PLACEHOLDER);

  const rating = business.averageRating;
  const reviewCount = business.reviewCount;
  const detailUrl = `/comercio/${business.categorySlug}/${business.id}`;

  return (
    <article
      className={cn("almanac-card flex flex-col overflow-hidden", className)}
    >
      {/* Capa: a foto do comércio manda; o mapa entra só quando não há foto.
          Era o contrário — bastava ter coordenada para o mapa cobrir a foto, e
          a carga de comércios preencheu latitude/longitude de toda a base. */}
      <Link to={detailUrl} className="block">
        <div
          className={cn(
            "relative overflow-hidden",
            isCompact ? "h-28" : "h-36",
          )}
        >
          {photos.length > 0 ? (
            <SmartImage
              sources={photos}
              alt={business.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.06]"
              loading="lazy"
            />
          ) : (
            <MiniMap
              position={position}
              title={business.name}
              label={business.neighborhood}
              className="h-full"
            />
          )}

          <div className="absolute left-2 top-2 flex items-center gap-1.5">
            {open === true && <OpenBadge />}
            {open === false && <ClosedBadge />}
            {typeof rating === "number" && !Number.isNaN(rating) && (
              <RatingBadge rating={rating} count={reviewCount} />
            )}
          </div>

          {business.isVerified && (
            <div className="absolute right-2 top-2">
              <VerifiedBadge />
            </div>
          )}
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-grow flex-col p-3">
        <Link to={detailUrl} className="flex-grow">
          <h3 className="mb-0.5 line-clamp-1 font-display text-base font-bold text-foreground">
            {business.name}
          </h3>
          <p className="eyebrow mb-3 line-clamp-1 text-muted-foreground">
            {business.category}
          </p>
        </Link>

        {!isCompact && tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <TagChip key={tag} size="sm" variant="tag">
                {tag}
              </TagChip>
            ))}
          </div>
        )}

        <CTAGrid
          whatsapp={business.whatsapp}
          mapsQuery={
            position
              ? `${position.lat},${position.lng}`
              : buildPlaceQuery(business.name, business.address)
          }
          phone={business.phone}
          size="sm"
        />
      </div>
    </article>
  );
}
