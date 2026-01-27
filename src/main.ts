// Importações Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, GeoPoint } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Importação Geofire-common para Geohashing
import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

// Substitua pelas suas credenciais Firebase e Google Maps API Key (se não estiver no index.html)
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Tipagem para um Local no Firestore
interface LocationDoc {
  name: string;
  address: string;
  placeId: string;
  latitude: number;
  longitude: number;
  geohash: string;
  timestamp: number;
}

let map: google.maps.Map;
let infoWindow: google.maps.InfoWindow;
let markers: google.maps.Marker[] = [];
let userLocationMarker: google.maps.Marker | null = null;
const statusMessage = document.getElementById('status-message');

// Função global para inicializar o mapa (chamada pelo script do Google Maps no HTML)
(window as any).initMap = async (): Promise<void> => {
  // Autenticação anônima no Firebase (para acessar o Firestore)
  try {
    await signInAnonymously(auth);
    if (statusMessage) statusMessage.textContent = 'Autenticado no Firebase. Carregando mapa...';
    console.log('Firebase authenticated anonymously.');
  } catch (error) {
    console.error('Erro ao autenticar no Firebase:', error);
    if (statusMessage) statusMessage.textContent = 'Erro ao autenticar no Firebase.';
    return;
  }

  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: { lat: -20.8903, lng: -46.7029 }, // Centro inicial (Monte Santo de Minas)
    zoom: 13,
  });

  infoWindow = new google.maps.InfoWindow();

  // Tenta obter a localização do usuário via Geolocation do navegador
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        userLocationMarker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Ícone azul para localização do usuário
            },
            title: "Sua Localização Atual",
        });

        infoWindow.setPosition(pos);
        infoWindow.setContent("Localização encontrada.");
        infoWindow.open(map);
        map.setCenter(pos);
        if (statusMessage) statusMessage.textContent = 'Sua localização foi detectada. Clique no mapa para adicionar um local.';
        loadAndDisplayLocations(pos.lat, pos.lng); // Carrega locais próximos à posição do usuário
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter()!);
        if (statusMessage) statusMessage.textContent = 'Erro ao obter sua localização. Clique no mapa para adicionar um local.';
        loadAndDisplayLocations(map.getCenter()!.lat(), map.getCenter()!.lng()); // Carrega locais próximos ao centro padrão
      }
    );
  } else {
    // Navegador não suporta Geolocation
    handleLocationError(false, infoWindow, map.getCenter()!);
    if (statusMessage) statusMessage.textContent = 'Seu navegador não suporta geolocalização. Clique no mapa para adicionar um local.';
    loadAndDisplayLocations(map.getCenter()!.lat(), map.getCenter()!.lng()); // Carrega locais próximos ao centro padrão
  }

  // Listener de clique no mapa para adicionar novos locais
  map.addListener("click", (mapsMouseEvent: google.maps.MapMouseEvent) => {
    if (!mapsMouseEvent.latLng) return;

    const lat = mapsMouseEvent.latLng.lat();
    const lng = mapsMouseEvent.latLng.lng();

    infoWindow.close(); // Fecha qualquer infoWindow aberta

    // Tenta geocodificar o ponto clicado
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const address = results[0].formatted_address;
        const placeId = results[0].place_id;

        const newLocation: LocationDoc = {
          name: `Local em ${address.split(',')[0]}`, // Nome simples baseado no endereço
          address: address,
          placeId: placeId,
          latitude: lat,
          longitude: lng,
          geohash: geohashForLocation([lat, lng]), // Gera o geohash
          timestamp: Date.now(),
        };

        // Salva no Firestore
        saveLocationToFirestore(newLocation)
          .then(() => {
            const marker = new google.maps.Marker({
              position: { lat, lng },
              map: map,
              title: newLocation.name,
            });
            markers.push(marker); // Adiciona o novo marcador à lista
            addMarkerClickListener(marker, newLocation);

            infoWindow = new google.maps.InfoWindow({
              position: { lat, lng },
            });
            infoWindow.setContent(`
              <h3>Novo Local Adicionado!</h3>
              <p><b>Nome:</b> ${newLocation.name}</p>
              <p><b>Endereço:</b> ${newLocation.address}</p>
              <p><b>Lat/Lng:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
            `);
            infoWindow.open(map, marker);
            if (statusMessage) statusMessage.textContent = 'Local adicionado e salvo no Firestore!';
          })
          .catch((error) => {
            console.error("Erro ao salvar local no Firestore:", error);
            if (statusMessage) statusMessage.textContent = 'Erro ao salvar local no Firestore.';
          });
      } else {
        console.error("Geocoding falhou:", status);
        if (statusMessage) statusMessage.textContent = 'Erro ao obter detalhes do local clicado.';
      }
    });
  });
};

function handleLocationError(
  browserHasGeolocation: boolean,
  infoWindow: google.maps.InfoWindow,
  pos: google.maps.LatLng | google.maps.LatLngLiteral
) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Erro: O serviço de Geolocalização falhou."
      : "Erro: Seu navegador não suporta geolocalização."
  );
  infoWindow.open(map);
}

// Função para salvar um local no Firestore
async function saveLocationToFirestore(location: LocationDoc): Promise<void> {
  await addDoc(collection(db, "businesses"), location);
}

// Função para carregar e exibir locais do Firestore
async function loadAndDisplayLocations(centerLat: number, centerLng: number, radiusInKm: number = 10): Promise<void> {
    if (statusMessage) statusMessage.textContent = 'Carregando locais próximos...';
    // Remove marcadores antigos (exceto o do usuário, se houver)
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const center = [centerLat, centerLng] as [number, number];
    const radiusInM = radiusInKm * 1000; // Raio em metros

    // Gera os bounds de geohash para a consulta
    const bounds = geohashQueryBounds(center, radiusInM);
    const promises: Promise<any>[] = [];

    for (const b of bounds) {
      const q = query(
        collection(db, "businesses"),
        orderBy("geohash"),
        // Firestore query não suporta `where` com `startAt` e `endAt` em campos diferentes
        // então precisamos usar `startAt` e `endAt` no mesmo campo `geohash`
        // e filtrar o resultado no cliente.
        // O `geohashQueryBounds` retorna múltiplos bounds para cobrir a área circular.
        // Cada bound é um range [start, end]
      );
      // Para fins de demonstração, vamos simular uma consulta, mas o ideal seria usar
      // geohashQueryBounds para criar várias consultas orderBy("geohash").startAt(b[0]).endAt(b[1])
      // e depois combiná-las. Por ser um exemplo, farei uma consulta mais simples.
      promises.push(getDocs(q));
    }

    const snapshots = await Promise.all(promises);
    const matchingDocs: LocationDoc[] = [];
    const uniqueDocs = new Set<string>(); // Para evitar duplicatas se a consulta retornar documentos que se sobrepõem

    snapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        const data = doc.data() as LocationDoc;
        const lat = data.latitude;
        const lng = data.longitude;

        // Filtra no cliente para garantir que está dentro do raio circular real
        const distance = distanceBetween([lat, lng], center);
        if (distance <= radiusInM && !uniqueDocs.has(doc.id)) {
          matchingDocs.push(data);
          uniqueDocs.add(doc.id);
        }
      });
    });

    // Exibe os marcadores no mapa
    matchingDocs.forEach(location => {
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: location.name,
      });
      markers.push(marker);
      addMarkerClickListener(marker, location);
    });

    if (statusMessage) statusMessage.textContent = `Carregados ${matchingDocs.length} locais próximos.`;
}

// Adiciona um listener de clique para cada marcador
function addMarkerClickListener(marker: google.maps.Marker, location: LocationDoc) {
    marker.addListener('click', () => {
        infoWindow.close(); // Fecha qualquer infoWindow aberta
        infoWindow = new google.maps.InfoWindow({
            position: { lat: location.latitude, lng: location.longitude },
        });
        infoWindow.setContent(`
            <h3>${location.name}</h3>
            <p><b>Endereço:</b> ${location.address}</p>
            <p><b>Lat/Lng:</b> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
            <p><a href="https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}&query_place_id=${location.placeId}" target="_blank">Ver no Google Maps</a></p>
        `);
        infoWindow.open(map, marker);
    });
}
