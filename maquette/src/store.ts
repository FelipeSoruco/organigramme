import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { calculerCompletude } from './data/dossier'
import { construireAnnee, PERSONNES } from './data/seed'
import { getRole } from './roles'
import type { Contrat, DocumentId, EvenementContrat, InfosPersonnelles, Personne, Poste, RoleId, StatutContrat } from './types'
import { notifier } from './ui-store'
import type { ActionContrat } from './workflow'

export interface Proposition {
  posteId: string
  personneId: string
  dateDebut: string
  dateFin: string | null
  echelonId: string | null
  salaire: number
  commentaire?: string
}

export type NouvellePersonne = Pick<Personne, 'civilite' | 'prenom' | 'nom' | 'email' | 'telephone' | 'ville'>

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
  creerPoste: (p: Omit<Poste, 'id' | 'personneId'>) => string
  creerPersonne: (p: NouvellePersonne, inviter: boolean) => string
  inviter: (personneId: string) => void
  majInfos: (personneId: string, infos: Partial<InfosPersonnelles>) => void
  deposerDocument: (personneId: string, doc: DocumentId, fichier: string | null) => void
  proposer: (p: Proposition) => string
  agir: (contratId: string, action: ActionContrat, commentaire?: string, modifs?: Partial<Proposition>) => void
  reinitialiser: () => void
}

const aujourdhui = () => new Date().toISOString().slice(0, 10)

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
    (set, get) => {
      const majPersonne = (id: string, f: (p: Personne) => Personne) =>
        set((s) => ({
          personnes: s.personnes.map((p) => {
            if (p.id !== id) return p
            const n = f(p)
            return { ...n, completude: calculerCompletude(n) }
          }),
        }))
      const auteur = () => getRole(get().role).personne
      const nomDe = (id: string) => {
        const p = get().personnes.find((x) => x.id === id)
        return p ? `${p.prenom} ${p.nom}` : ''
      }

      return {
        ...initial(),
        setRole: (role) => set({ role }),
        setAnnee: (annee) => set({ annee }),
        affecter: (posteId, personneId) =>
          set((s) => ({
            postes: s.postes.map((p) => (p.id === posteId ? { ...p, personneId } : p)),
            // Libérer un poste retire ses contrats ; affecter directement n’en crée pas (on passe par « Préparer le contrat »).
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
        creerPoste: (p) => {
          const id = `${p.annee}-n${Date.now().toString(36)}`
          set((s) => ({ postes: [...s.postes, { ...p, id, personneId: null }] }))
          notifier('Poste créé', p.intitule)
          return id
        },
        creerPersonne: (p, inviter) => {
          const id = `p-n${Date.now().toString(36)}`
          const personne: Personne = { ...p, id, completude: 0, portail: inviter ? 'invite' : 'non_invite', infos: {}, documents: {} }
          set((s) => ({ personnes: [...s.personnes, personne] }))
          notifier(`${p.prenom} ${p.nom} ajouté·e au vivier`, inviter ? `Invitation au portail envoyée à ${p.email}` : undefined)
          return id
        },
        inviter: (personneId) => {
          const p = get().personnes.find((x) => x.id === personneId)
          if (!p) return
          majPersonne(personneId, (x) => ({ ...x, portail: x.portail === 'actif' ? 'actif' : 'invite' }))
          notifier(p.portail === 'non_invite' ? 'Invitation envoyée' : 'Rappel envoyé', `E-mail envoyé à ${p.email}`)
        },
        majInfos: (personneId, infos) => majPersonne(personneId, (p) => ({ ...p, infos: { ...p.infos, ...infos } })),
        deposerDocument: (personneId, doc, fichier) =>
          majPersonne(personneId, (p) => {
            const documents = { ...p.documents }
            if (fichier) documents[doc] = { fichier, date: aujourdhui() }
            else delete documents[doc]
            return { ...p, documents }
          }),
        proposer: (pr) => {
          const s = get()
          const id = `c-${pr.posteId}-${Date.now().toString(36)}`
          const contrat: Contrat = {
            id,
            posteId: pr.posteId,
            personneId: pr.personneId,
            statut: 'soumis',
            dateDebut: pr.dateDebut,
            dateFin: pr.dateFin,
            echelonId: pr.echelonId,
            salaire: pr.salaire,
            proposePar: s.role,
            historique: [
              { date: aujourdhui(), auteur: auteur(), action: 'Proposition d’embauche', commentaire: pr.commentaire || undefined, statut: 'soumis' },
            ],
          }
          set({
            contrats: [...s.contrats.filter((c) => !(c.posteId === pr.posteId && c.statut === 'brouillon')), contrat],
            postes: s.postes.map((p) => (p.id === pr.posteId ? { ...p, personneId: pr.personneId } : p)),
          })
          notifier('Proposition envoyée à la comptabilité', `${nomDe(pr.personneId)} · Nathalie Garnier est notifiée par e-mail`)
          return id
        },
        agir: (contratId, action, commentaire, modifs) => {
          const s = get()
          const c = s.contrats.find((x) => x.id === contratId)
          if (!c) return
          const qui = nomDe(c.personneId)
          const ev: EvenementContrat[] = []
          let statut: StatutContrat = c.statut
          let message = ''
          let detail: string | undefined
          const d = aujourdhui()
          switch (action) {
            case 'valider_compta':
              statut = 'valide_compta'
              ev.push({ date: d, auteur: auteur(), action: 'Validé par la comptabilité', commentaire, statut })
              message = 'Contrat validé'
              detail = 'Transmis à la direction pour validation et signature'
              break
            case 'signer_direction':
              statut = 'signe_direction'
              ev.push({ date: d, auteur: auteur(), action: 'Validé et signé par la direction', commentaire, statut })
              ev.push({ date: d, auteur: 'Yousign', action: `Envoyé pour signature à ${qui}` })
              message = 'Contrat signé'
              detail = `Yousign envoie le contrat à ${qui} pour signature`
              break
            case 'renvoyer':
              statut = 'a_corriger'
              ev.push({ date: d, auteur: auteur(), action: 'Renvoyé pour correction', commentaire, statut })
              message = 'Contrat renvoyé pour correction'
              detail = `${getRole(c.proposePar).personne} est notifié·e par e-mail`
              break
            case 'refuser':
              statut = 'refuse'
              ev.push({ date: d, auteur: auteur(), action: 'Refusé', commentaire, statut })
              message = 'Proposition refusée'
              detail = 'Le poste redevient à pourvoir'
              break
            case 'corriger':
              statut = 'soumis'
              ev.push({ date: d, auteur: auteur(), action: 'Corrigé et renvoyé à la comptabilité', commentaire, statut })
              message = 'Contrat corrigé'
              detail = 'De nouveau en attente de la comptabilité'
              break
            case 'relancer':
              ev.push({ date: d, auteur: auteur(), action: `Relance envoyée à ${qui}` })
              message = 'Relance envoyée'
              detail = `Yousign renvoie le lien de signature à ${qui}`
              break
            case 'signer_collaborateur':
              statut = 'actif'
              ev.push({ date: d, auteur: qui, action: 'Signé par le collaborateur', statut })
              ev.push({ date: d, auteur: 'Silae', action: 'Salarié et contrat transmis à la paie' })
              ev.push({ date: d, auteur: 'POSI', action: 'Demande d’accréditation transmise' })
              message = 'Contrat signé'
              detail = 'Merci ! Votre contrat signé est disponible dans « Mes contrats ».'
              break
          }
          set({
            contrats: s.contrats.map((x) =>
              x.id === contratId ? { ...x, ...(modifs ?? {}), statut, historique: [...x.historique, ...ev] } : x,
            ),
            postes: statut === 'refuse' ? s.postes.map((p) => (p.id === c.posteId ? { ...p, personneId: null } : p)) : s.postes,
          })
          notifier(message, detail)
        },
        reinitialiser: () => set(initial()),
      }
    },
    { name: 'organigramme-demo-v2', storage: createJSONStorage(() => localStorage) },
  ),
)
