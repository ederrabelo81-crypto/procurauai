
import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';
import { db, auth } from '@/firebase'; // Importa a instância do db e auth

// Tipagem para um Local no Firestore
interface LocationDoc {
  id?: string;
  name: string;
  address: string;
  placeId: string;
  latitude: number;
  longitude: number;
  geohash: string;
  timestamp: number;
}

const GoogleMaps: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [markers, setMarkers] = useState<LocationDoc[]>([]);
  const [statusMessage, setStatusMessage] = useState('Carregando...');
  const [selectedLocation, setSelectedLocation] = useState<LocationDoc | null>(null);
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await signInAnonymously(auth);
        setStatusMessage('Autenticado no Firebase. Obtendo localização...');

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setUserLocation(pos);
              setStatusMessage('Localização obtida. Carregando locais próximos...');
              loadAndDisplayLocations(pos.lat, pos.lng);
            },
            () => {
              setStatusMessage('Erro ao obter localização. Carregando locais padrão...');
              loadAndDisplayLocations(-20.8903, -46.7029); // Localização padrão
            }
          );
        } else {
          setStatusMessage('Geolocalização não suportada. Carregando locais padrão...');
          loadAndDisplayLocations(-20.8903, -46.7029); // Localização padrão
        }
      } catch (error) {
        console.error('Erro ao autenticar no Firebase:', error);
        setStatusMessage('Erro de autenticação com o Firebase.');
      }
    };
    init();
  }, []);

  const loadAndDisplayLocations = async (lat: number, lng: number, radiusInKm: number = 10) => {
    const center: [number, number] = [lat, lng];
    const radiusInM = radiusInKm * 1000;
    const bounds = geohashQueryBounds(center, radiusInM);

    const promises = bounds.map(b => {
      const q = query(
        collection(db, 'businesses'),
        orderBy('geohash'),
      );
      return getDocs(q);
    });

    try {
      const snapshots = await Promise.all(promises);
      const uniqueDocs = new Set<string>();
      const matchingDocs: LocationDoc[] = [];

      snapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          if (doc.exists()) {
            const data = doc.data() as LocationDoc;
            const distance = distanceBetween([data.latitude, data.longitude], center);
            if (distance <= radiusInM && !uniqueDocs.has(doc.id)) {
              matchingDocs.push({ ...data, id: doc.id });
              uniqueDocs.add(doc.id);
            }
          }
        });
      });

      setMarkers(matchingDocs);
      setStatusMessage(`${matchingDocs.length} locais carregados.`);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      setStatusMessage('Erro ao carregar locais do Firestore.');
    }
  };

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, async (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const newLocation: LocationDoc = {
          name: `Novo Local em ${results[0].formatted_address.split(',')[0]}`,
          address: results[0].formatted_address,
          placeId: results[0].place_id,
          latitude: lat,
          longitude: lng,
          geohash: geohashForLocation([lat, lng]),
          timestamp: Date.now(),
        };

        try {
          const docRef = await addDoc(collection(db, 'businesses'), newLocation);
          setMarkers(prev => [...prev, { ...newLocation, id: docRef.id }]);
          setStatusMessage('Novo local adicionado ao Firestore!');
        } catch (error) {
          console.error('Erro ao salvar local:', error);
          setStatusMessage('Erro ao salvar novo local.');
        }
      } else {
        setStatusMessage('Falha na geocodificação.');
      }
    });
  };

  const handleMarkerClick = (location: LocationDoc) => {
    setSelectedLocation(location);
    setInfoWindowShown(true);
  };

  return (
    <APIProvider apiKey="AIzaSyDIyDkwKhYR_zUk93how05riX1aXWoxvP8">
      <div style={{ height: '100vh', width: '100%' }}>
        <h1>Procura UAI - Mapa</h1>
        <p>{statusMessage}</p>
        <Map
          defaultCenter={{ lat: -20.8903, lng: -46.7029 }}
          defaultZoom={13}
          mapId="procura-uai-map"
          onClick={handleMapClick}
        >
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Sua Localização">
              <Pin background={'blue'} borderColor={'white'} glyphColor={'white'} />
            </AdvancedMarker>
          )}
          {markers.map(location => (
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
                <h3>{selectedLocation.name}</h3>
                <p>{selectedLocation.address}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.latitude},${selectedLocation.longitude}&query_place_id=${selectedLocation.placeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
