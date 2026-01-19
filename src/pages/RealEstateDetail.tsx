import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, MessageCircle, Bed, Bath, Car, Maximize } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { realEstate } from "@/data/newListingTypes";
import { formatTag } from "@/lib/tags";

export default function RealEstateDetail() {
  const { id } = useParams();
  const item = realEstate.find((r) => r.id === id);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  if (!item) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Link to="/imoveis" className="text-primary underline">Voltar para Imóveis</Link>
        <p className="mt-4 text-muted-foreground">Imóvel não encontrado.</p>
      </div>
    );
  }

  const whatsapp = item.whatsapp;
  const phone = item.phone;

  const priceText =
    item.transactionType === "alugar"
      ? `${formatPrice(item.rentPrice || 0)}/mês`
      : formatPrice(item.price || 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/imoveis" className="p-2 -ml-2 rounded-full hover:bg-muted touch-target">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">{item.title}</h1>
            <p className="text-xs text-muted-foreground truncate">
              {formatTag(item.transactionType)} • {formatTag(item.propertyType)}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        <div className="bg-card rounded-2xl overflow-hidden card-shadow">
          <div className="relative aspect-video">
            <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
          </div>

          <div className="p-4">
            <p className="text-lg font-bold text-primary">
              {priceText}
              {item.condoFee ? (
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  + {formatPrice(item.condoFee)} cond.
                </span>
              ) : null}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
              {item.bedrooms ? (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" /> {item.bedrooms} quarto{item.bedrooms > 1 ? 's' : ''}
                </span>
              ) : null}
              {item.bathrooms ? (
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" /> {item.bathrooms} banheiro{item.bathrooms > 1 ? 's' : ''}
                </span>
              ) : null}
              {item.parkingSpots ? (
                <span className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" /> {item.parkingSpots} vaga{item.parkingSpots > 1 ? 's' : ''}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" /> {item.areaM2}m²
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <MapPin className="w-3.5 h-3.5" />
              {item.neighborhood}, {item.city}
            </div>

            {/* Description */}
            {item.description && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )}

            {/* Amenities */}
            {item.amenities && item.amenities.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Comodidades</h3>
                <div className="flex flex-wrap gap-2">
                  {item.amenities.map((amenity) => (
                    <span key={amenity} className="px-2 py-1 bg-muted rounded-full text-xs">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags - formatted */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {item.tags.slice(0, 12).map((t) => (
                  <Chip key={t}>{formatTag(t)}</Chip>
                ))}
              </div>
            )}

            {/* Extra info */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/50 rounded-lg p-2">
                <span className="text-muted-foreground">Mobília:</span>{' '}
                <span className="font-medium">{formatTag(item.furnished)}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <span className="text-muted-foreground">Disponibilidade:</span>{' '}
                <span className="font-medium">{item.availability === 'imediata' ? 'Imediata' : 'A negociar'}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 col-span-2">
                <span className="text-muted-foreground">Pet Friendly:</span>{' '}
                <span className="font-medium">{item.petFriendly ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            {(whatsapp || phone) && (
              <div className="flex gap-2 mt-4">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${String(whatsapp).replace(/\D/g, "")}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${String(phone).replace(/\s/g, "")}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted font-medium"
                  >
                    <Phone className="w-4 h-4" /> Ligar
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
