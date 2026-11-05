import { create } from 'zustand'

export interface Toast {
  id: number
  texte: string
  detail?: string
}

/** Notifications éphémères (non conservées). */
export const useToasts = create<{ toasts: Toast[]; notifier: (texte: string, detail?: string) => void; fermer: (id: number) => void }>(
  (set) => ({
    toasts: [],
    notifier: (texte, detail) => {
      const id = Date.now() + Math.random()
      set((s) => ({ toasts: [...s.toasts, { id, texte, detail }] }))
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4200)
    },
    fermer: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  }),
)

export const notifier = (texte: string, detail?: string) => useToasts.getState().notifier(texte, detail)
