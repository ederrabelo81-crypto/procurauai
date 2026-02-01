import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { supabase } from '@/lib/supabaseClient';

interface BusinessDoc {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  category?: string;
  categorySlug?: string;
  neighborhood?: string;
  coverImages?: string[];
  phone?: string;
  whatsapp?: string;
  hours?: string;
  description?: string;
  isVerified?: boolean;
}

// Calcula distância entre duas coordenadas em km (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const GoogleMaps: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [markers, setMarkers] = useState<BusinessDoc[]>([]);
  const [statusMessage, setStatusMessage] = useState('Carregando...');
  const [selectedLocation, setSelectedLocation] = useState<BusinessDoc | null>(null);
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  useEffect(() => {
    const init = async () => {
      setStatusMessage('Obtendo localização...');

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLocation(pos);
            setStatusMessage('Localização obtida. Carregando locais...');
            loadAndDisplayLocations(pos.lat, pos.lng);
          },
          () => {
            setStatusMessage('Erro ao obter localização. Carregando locais padrão...');
            loadAndDisplayLocations(-20.8903, -46.7029);
          }
        );
      } else {
        setStatusMessage('Geolocalização não suportada. Carregando locais padrão...');
        loadAndDisplayLocations(-20.8903, -46.7029);
      }
    };
    init();
  }, []);

  const loadAndDisplayLocations = async (lat: number, lng: number, radiusInKm: number = 25) => {
    try {
      // Busca todos os negócios que têm coordenadas
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, address, latitude, longitude, category, category_slug, neighborhood, cover_images, phone, whatsapp, hours, description, is_verified')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Erro ao carregar locais:', error);
        setStatusMessage('Erro ao carregar locais do banco de dados.');
        setMarkers([]);
        return;
      }

      if (!data || data.length === 0) {
        setStatusMessage('Nenhum local com coordenadas encontrado.');
        setMarkers([]);
        return;
      }

      // Filtra por distância no cliente
      const nearbyBusinesses: BusinessDoc[] = data
        .filter((row) => {
          const distance = calculateDistance(lat, lng, row.latitude, row.longitude);
          return distance <= radiusInKm;
        })
        .map((row) => ({
          id: row.id,
          name: row.name,
          address: row.address,
          latitude: row.latitude,
          longitude: row.longitude,
          category: row.category,
          categorySlug: row.category_slug,
          neighborhood: row.neighborhood,
          coverImages: row.cover_images,
          phone: row.phone,
          whatsapp: row.whatsapp,
          hours: row.hours,
          description: row.description,
          isVerified: row.is_verified,
        }));

      setMarkers(nearbyBusinesses);
      setStatusMessage(`${nearbyBusinesses.length} locais carregados.`);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      setStatusMessage('Erro ao carregar locais.');
      setMarkers([]);
    }
  };

  const handleMarkerClick = (location: BusinessDoc) => {
    setSelectedLocation(location);
    setInfoWindowShown(true);
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">
          Google Maps API Key não configurada. Defina VITE_GOOGLE_MAPS_API_KEY.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height: '100vh', width: '100%' }}>
        <h1 className="p-4 text-xl font-semibold">Procura UAI - Mapa</h1>
        <p className="px-4 pb-2 text-sm text-muted-foreground">{statusMessage}</p>
        <Map
          defaultCenter={{ lat: -20.8903, lng: -46.7029 }}
          defaultZoom={13}
          mapId="procura-uai-map"
        >
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Sua Localização">
              <Pin background={'blue'} borderColor={'white'} glyphColor={'white'} />
            </AdvancedMarker>
          )}
          {markers.map((location) => (
            <AdvancedMarker
              key={location.id}
              position={{ lat: location.latitude, lng: location.longitude }}
              title={location.name}
              onClick={() => handleMarkerClick(location)}
            />
          ))}
          {infoWindowShown && selectedLocation && (
            <InfoWindow
              position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
              onCloseClick={() => setInfoWindowShown(false)}
            >
              <div>
                <h3 className="font-semibold">{selectedLocation.name}</h3>
                {selectedLocation.address && <p className="text-sm">{selectedLocation.address}</p>}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm underline"
                >
                  Ver no Google Maps
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default GoogleMaps;
