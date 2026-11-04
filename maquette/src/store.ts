import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { construireAnnee, PERSONNES } from './data/seed'
import type { Contrat, Personne, Poste, RoleId } from './types'

interface DemoState {
  role: RoleId
  annee: number
  annees: number[]
  postes: Poste[]
  personnes: Personne[]
  contrats: Contrat[]
  setRole: (r: RoleId) => void
  setAnnee: (a: number) => void
  affecter: (posteId: string, personneId: string | null) => void
  preparerAnnee: (depuis: number, vers: number) => void
  reinitialiser: () => void
}

const initial = () => {
  const { postes, contrats } = construireAnnee(2026)
  return {
    role: 'compta' as RoleId,
    annee: 2026,
    annees: [2026],
    postes,
    personnes: PERSONNES,
    contrats,
  }
}

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initial(),
      setRole: (role) => set({ role }),
      setAnnee: (annee) => set({ annee }),
      affecter: (posteId, personneId) =>
        set((s) => ({
          postes: s.postes.map((p) => (p.id === posteId ? { ...p, personneId } : p)),
          // Libérer un poste retire le contrat en cours de préparation ; affecter n’en crée pas encore (phase 4).
          contrats: personneId === null ? s.contrats.filter((c) => c.posteId !== posteId) : s.contrats,
        })),
      preparerAnnee: (depuis, vers) => {
        const s = get()
        if (s.annees.includes(vers)) return
        const source = s.postes.filter((p) => p.annee === depuis)
        const idMap = new Map(source.map((p) => [p.id, p.id.replace(`${depuis}-`, `${vers}-`)]))
        const shift = (date: string | null) => (date ? date.replace(String(depuis), String(vers)) : null)
        const nouveaux: Poste[] = source.map((p) => ({
          ...p,
          id: idMap.get(p.id)!,
          annee: vers,
          parentId: p.parentId ? idMap.get(p.parentId) ?? null : null,
          dateDebut: shift(p.dateDebut)!,
          dateFin: shift(p.dateFin),
          // Les CDI continuent ; les autres postes sont à pourvoir.
          personneId: p.typeContrat === 'CDI' ? p.personneId : null,
        }))
        set({ postes: [...s.postes, ...nouveaux], annees: [...s.annees, vers].sort(), annee: vers })
      },
      reinitialiser: () => set(initial()),
    }),
    { name: 'organigramme-demo-v1', storage: createJSONStorage(() => localStorage) },
  ),
)
