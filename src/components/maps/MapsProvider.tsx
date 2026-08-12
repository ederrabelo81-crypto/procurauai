import type { ReactNode } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MAPS_API_KEY, hasMapsKey } from '@/lib/maps';
import { MapsReadyContext } from './mapsReadyContext';

interface MapsProviderProps {
  children: ReactNode;
}

/**
 * Carrega a Maps JavaScript API **uma única vez** para todo o app.
 *
 * Antes, cada card montava seu próprio `<APIProvider>`, o que instanciava um
 * loader por card. Agora o provider vive na raiz e os componentes de mapa
 * apenas consomem o contexto via `useMapsReady()`.
 *
 * Sem chave configurada, nada é carregado: o contexto fica `false` e os
 * componentes caem no fallback estático, sem quebrar a renderização.
 */
export function MapsProvider({ children }: MapsProviderProps) {
  if (!hasMapsKey) {
    return (
      <MapsReadyContext.Provider value={false}>
        {children}
      </MapsReadyContext.Provider>
    );
  }

  return (
    <APIProvider apiKey={MAPS_API_KEY} language="pt-BR" region="BR">
      <MapsReadyContext.Provider value={true}>
        {children}
      </MapsReadyContext.Provider>
    </APIProvider>
  );
}
