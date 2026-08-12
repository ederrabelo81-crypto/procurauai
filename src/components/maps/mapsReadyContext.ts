import { createContext, useContext } from 'react';

/**
 * Contexto que diz se a Maps JavaScript API foi carregada nesta árvore.
 *
 * Fica separado de `MapsProvider.tsx` porque o Fast Refresh só funciona em
 * arquivos que exportam apenas componentes — misturar hook e componente no
 * mesmo módulo derruba o HMR do provider inteiro.
 */
export const MapsReadyContext = createContext(false);

/** Componentes que renderizam `<Map>` devem checar isso antes. */
export function useMapsReady(): boolean {
  return useContext(MapsReadyContext);
}
