// Circuit de contrats : les états sont fixes (R-003 / D-005), seuls les libellés sont configurables.
import type { Role } from './roles'
import type { Contrat } from './types'

export type ActionContrat = 'valider_compta' | 'signer_direction' | 'renvoyer' | 'refuser' | 'corriger' | 'relancer' | 'signer_collaborateur'

export const ACTIONS: Record<ActionContrat, { libelle: string; motif?: boolean }> = {
  valider_compta: { libelle: 'Valider' },
  signer_direction: { libelle: 'Valider et signer' },
  renvoyer: { libelle: 'Renvoyer pour correction', motif: true },
  refuser: { libelle: 'Refuser', motif: true },
  corriger: { libelle: 'Corriger et renvoyer' },
  relancer: { libelle: 'Relancer le collaborateur' },
  signer_collaborateur: { libelle: 'Signer mon contrat' },
}

export function actionsPossibles(role: Role, c: Contrat): ActionContrat[] {
  const admin = role.id === 'admin'
  const compta = role.id === 'compta' || admin
  const direction = role.id === 'direction' || admin
  const a: ActionContrat[] = []
  switch (c.statut) {
    case 'soumis':
      if (compta) a.push('valider_compta', 'renvoyer')
      break
    case 'valide_compta':
      if (direction) a.push('signer_direction', 'renvoyer', 'refuser')
      break
    case 'signe_direction':
      if (role.personneId === c.personneId) a.push('signer_collaborateur')
      else if (compta) a.push('relancer')
      break
    case 'a_corriger':
      if (role.id === c.proposePar || admin) a.push('corriger')
      break
  }
  return a
}

/** Un contrat est « à traiter » si le rôle peut le faire avancer (relancer ne compte pas). */
export const estATraiter = (role: Role, c: Contrat) => actionsPossibles(role, c).some((x) => x !== 'relancer')

/** Le contrat en vigueur ou en cours d’un poste (les refusés ne comptent plus). */
export const contratDuPoste = (contrats: Contrat[], posteId: string) =>
  contrats.filter((c) => c.posteId === posteId && c.statut !== 'refuse').at(-1)

export const ETAPES_CIRCUIT = [
  { statut: 'soumis', libelle: 'Comptabilité' },
  { statut: 'valide_compta', libelle: 'Direction' },
  { statut: 'signe_direction', libelle: 'Collaborateur' },
  { statut: 'actif', libelle: 'Signé' },
] as const
