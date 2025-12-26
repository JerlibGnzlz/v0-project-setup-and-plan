import { useQuery } from '@tanstack/react-query'
import { solicitudesCredencialesApi, type SolicitudCredencial } from '@api/solicitudes-credenciales'

/**
 * Hook para obtener las solicitudes de credenciales del usuario actual
 */
export function useMisSolicitudes() {
  return useQuery<SolicitudCredencial[]>({
    queryKey: ['solicitudes-credenciales', 'mis-solicitudes'],
    queryFn: () => solicitudesCredencialesApi.getMisSolicitudes(),
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: 2,
  })
}

