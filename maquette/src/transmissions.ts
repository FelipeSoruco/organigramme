// Envois simulés vers Silae (paie) et POSI (accréditations). Aucune connexion réelle.
import { PIECES } from './data/dossier'
import { ACCREDITATIONS } from './data/seed'
import type { Personne, Poste, Systeme, Transmission } from './types'

/** Pièces du dossier exigées par chaque système avant l’envoi. */
export const REQUIS: Record<Systeme, string[]> = {
  silae: ['secu', 'iban', 'adresse', 'naissance'],
  posi: ['photo', 'naissance', 'doc_identite'],
}

export const SYSTEMES: Record<Systeme, { nom: string; role: string; couleur: string; fond: string }> = {
  silae: { nom: 'Silae', role: 'Paie', couleur: '#3B46A8', fond: '#E6E8FB' },
  posi: { nom: 'POSI', role: 'Accréditations', couleur: '#8A4320', fond: '#F6E3D7' },
}

/** Première pièce manquante pour ce système, ou null si le dossier est prêt. */
export function pieceManquante(systeme: Systeme, p: Pick<Personne, 'infos' | 'documents'>) {
  return PIECES.find((x) => REQUIS[systeme].includes(x.id) && !x.fait(p)) ?? null
}

export const messageManque = (systeme: Systeme, libelle: string) =>
  `${SYSTEMES[systeme].nom} a rejeté l’envoi : ${libelle.toLowerCase()} manquant·e dans le dossier.`

/** Les prestataires ne passent pas par la paie : seulement POSI. */
export const systemesPour = (poste: Poste): Systeme[] => (poste.typeContrat === 'PRESTATION' ? ['posi'] : ['silae', 'posi'])

export function objet(systeme: Systeme, poste: Poste) {
  if (systeme === 'silae') return `Embauche ${poste.typeContrat === 'STAGE' ? 'stage' : poste.typeContrat} · ${poste.intitule}`
  return `Accréditation · ${ACCREDITATIONS.find((a) => a.id === poste.accreditationId)?.libelle ?? '—'}`
}

/** Crée l’envoi et le vérifie tout de suite contre le dossier de la personne. */
export function envoyer(
  systeme: Systeme,
  poste: Poste,
  personne: Personne,
  contratId: string,
  date: string,
  auteur: string,
): Transmission {
  const manque = pieceManquante(systeme, personne)
  const message = manque ? messageManque(systeme, manque.libelle) : undefined
  return {
    id: `t-${systeme}-${contratId}-${Date.now().toString(36)}`,
    contratId,
    personneId: personne.id,
    systeme,
    objet: objet(systeme, poste),
    date,
    statut: manque ? 'erreur' : 'envoye',
    cause: manque?.id,
    message,
    tentatives: [{ date, auteur, resultat: manque ? 'erreur' : 'ok', message }],
  }
}

/** Journal de départ : un envoi par contrat signé dans la plateforme (les CDI repris d’Organigram n’en ont pas). */
export function transmissionsInitiales(
  postes: Poste[],
  contrats: { id: string; posteId: string; personneId: string; statut: string; historique: { action: string; date: string }[] }[],
  personnes: Personne[],
): Transmission[] {
  const out: Transmission[] = []
  for (const c of contrats) {
    const signe = c.historique.find((e) => e.action === 'Signé par le collaborateur')
    if (c.statut !== 'actif' || !signe) continue
    const poste = postes.find((p) => p.id === c.posteId)!
    const pers = personnes.find((p) => p.id === c.personneId)!
    for (const s of systemesPour(poste)) {
      const t = envoyer(s, poste, pers, c.id, signe.date, 'Envoi automatique')
      t.id = `t-${s}-${c.id}`
      out.push(t)
    }
  }
  // Une erreur technique côté paie, pour montrer la relance.
  const tech = out.find((t) => t.systeme === 'silae' && t.personneId === 'p-benali')
  if (tech) {
    tech.statut = 'erreur'
    tech.cause = 'technique'
    tech.message = 'Silae : établissement SOGOFIF introuvable (code IDCC absent). Réessayer après correction du paramétrage.'
    tech.tentatives = [{ date: tech.date, auteur: 'Envoi automatique', resultat: 'erreur', message: tech.message }]
  }
  return out.sort((a, b) => b.date.localeCompare(a.date))
}
