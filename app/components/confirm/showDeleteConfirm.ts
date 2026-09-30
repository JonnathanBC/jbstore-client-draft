import { useConfirmStore, type ConfirmOptions } from './confirm.store'

export function showDeleteConfirm(options: ConfirmOptions = {}) {
  return useConfirmStore.getState().request({
    title: '¿Seguro que quieres eliminar?',
    description: 'Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    ...options,
  })
}
