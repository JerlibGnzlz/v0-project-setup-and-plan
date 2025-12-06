'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  noticiasApi,
  CreateNoticiaData,
  UpdateNoticiaData,
  CategoriaNoticia,
} from '@/lib/api/noticias'
import { toast } from 'sonner'
import { useSmartSync, useSmartPolling } from './use-smart-sync'

// Hook para obtener todas las noticias (admin)
export function useNoticias() {
  // Sincronización inteligente
  useSmartSync()

  // Polling que se pausa cuando la pestaña no está visible
  const pollingInterval = useSmartPolling(['noticias'], 60000) // 60 segundos

  return useQuery({
    queryKey: ['noticias'],
    queryFn: noticiasApi.getAll,
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: pollingInterval,
  })
}

// Hook para obtener noticias publicadas (público)
export function useNoticiasPublicadas(limit?: number) {
  // Sincronización inteligente para la landing
  useSmartSync()

  const pollingInterval = useSmartPolling(['noticias', 'publicadas'], 30000) // 30 segundos

  return useQuery({
    queryKey: ['noticias', 'publicadas', limit],
    queryFn: () => noticiasApi.getPublicadas(limit),
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: pollingInterval,
  })
}

// Hook para obtener noticias destacadas
export function useNoticiasDestacadas(limit: number = 3) {
  useSmartSync()

  const pollingInterval = useSmartPolling(['noticias', 'destacadas'], 30000)

  return useQuery({
    queryKey: ['noticias', 'destacadas', limit],
    queryFn: () => noticiasApi.getDestacadas(limit),
    staleTime: 1000 * 30,
    refetchInterval: pollingInterval,
  })
}

// Hook para obtener noticias por categoría
export function useNoticiasByCategoria(categoria: CategoriaNoticia, limit?: number) {
  return useQuery({
    queryKey: ['noticias', 'categoria', categoria, limit],
    queryFn: () => noticiasApi.getByCategoria(categoria, limit),
    staleTime: 1000 * 60,
  })
}

// Hook para obtener una noticia por slug
export function useNoticiaBySlug(slug: string) {
  return useQuery({
    queryKey: ['noticia', 'slug', slug],
    queryFn: () => noticiasApi.getBySlug(slug),
    enabled: !!slug,
  })
}

// Hook para crear noticia
export function useCreateNoticia() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (data: CreateNoticiaData) => noticiasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      notifyChange('all')
      toast.success('Noticia creada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la noticia')
    },
  })
}

// Hook para actualizar noticia
export function useUpdateNoticia() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoticiaData }) =>
      noticiasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      notifyChange('all')
      toast.success('Noticia actualizada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la noticia')
    },
  })
}

// Hook para eliminar noticia
export function useDeleteNoticia() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (id: string) => noticiasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      notifyChange('all')
      toast.success('Noticia eliminada exitosamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la noticia')
    },
  })
}

// Hook para toggle publicado
export function useTogglePublicado() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (id: string) => noticiasApi.togglePublicado(id),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      notifyChange('all')
      toast.success(data.publicado ? 'Noticia publicada' : 'Noticia despublicada')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cambiar estado')
    },
  })
}

// Hook para toggle destacado
export function useToggleDestacado() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (id: string) => noticiasApi.toggleDestacado(id),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      notifyChange('all')
      toast.success(data.destacado ? 'Noticia destacada' : 'Noticia quitada de destacados')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cambiar estado')
    },
  })
}
