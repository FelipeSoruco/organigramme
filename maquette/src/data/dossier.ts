// Dossier du collaborateur : 10 éléments, 10 % chacun. Données fictives (R-002).
import type { DocumentId, InfosPersonnelles, Personne } from '../types'

export interface Piece {
  id: string
  libelle: string
  /** Où la personne la complète dans son portail */
  ou: 'infos' | 'documents'
  fait: (p: Pick<Personne, 'infos' | 'documents'>) => boolean
}

export const DOCUMENTS: { id: DocumentId; libelle: string; aide: string }[] = [
  { id: 'identite', libelle: 'Pièce d’identité', aide: 'Carte d’identité ou passeport, recto verso' },
  { id: 'vitale', libelle: 'Carte Vitale', aide: 'Ou attestation de droits à l’assurance maladie' },
  { id: 'rib', libelle: 'RIB', aide: 'Au nom de la personne, pour le versement du salaire' },
  { id: 'domicile', libelle: 'Justificatif de domicile', aide: 'De moins de 3 mois' },
]

const doc = (id: DocumentId): Piece => ({
  id: `doc_${id}`,
  libelle: DOCUMENTS.find((d) => d.id === id)!.libelle,
  ou: 'documents',
  fait: (p) => !!p.documents[id],
})

export const PIECES: Piece[] = [
  { id: 'photo', libelle: 'Photo (badge d’accréditation)', ou: 'infos', fait: (p) => !!p.infos.photo },
  { id: 'adresse', libelle: 'Adresse postale', ou: 'infos', fait: (p) => !!(p.infos.adresse && p.infos.codePostal) },
  { id: 'naissance', libelle: 'Date et lieu de naissance', ou: 'infos', fait: (p) => !!(p.infos.dateNaissance && p.infos.lieuNaissance) },
  { id: 'secu', libelle: 'N° de sécurité sociale', ou: 'infos', fait: (p) => !!p.infos.nir },
  { id: 'iban', libelle: 'IBAN', ou: 'infos', fait: (p) => !!p.infos.iban },
  { id: 'urgence', libelle: 'Contact d’urgence', ou: 'infos', fait: (p) => !!(p.infos.urgenceNom && p.infos.urgenceTel) },
  doc('identite'),
  doc('vitale'),
  doc('rib'),
  doc('domicile'),
]

export const calculerCompletude = (p: Pick<Personne, 'infos' | 'documents'>) =>
  Math.round((PIECES.filter((x) => x.fait(p)).length / PIECES.length) * 100)

export const piecesManquantes = (p: Pick<Personne, 'infos' | 'documents'>) => PIECES.filter((x) => !x.fait(p))

/** Génère un dossier fictif rempli à ~`pourcentage` %, dans l’ordre des pièces. */
export function dossierFictif(
  pourcentage: number,
  graine: number,
): { infos: InfosPersonnelles; documents: Personne['documents'] } {
  const n = Math.round((pourcentage / 100) * PIECES.length)
  const ids = new Set(PIECES.slice(0, n).map((x) => x.id))
  const g = (k: number) => String((graine * 37 + k * 11) % 90 + 10)
  const infos: InfosPersonnelles = { nationalite: 'Française' }
  // La photo fictive est dessinée à partir des initiales (pas d’image réelle)
  if (ids.has('photo')) infos.photo = 'initiales'
  if (ids.has('adresse')) {
    infos.adresse = `${g(1)} rue des Lilas`
    infos.codePostal = `06${g(2)}0`
  }
  if (ids.has('naissance')) {
    infos.dateNaissance = `19${75 + (graine % 24)}-0${(graine % 9) + 1}-1${graine % 9}`
    infos.lieuNaissance = 'Lyon'
  }
  if (ids.has('secu')) infos.nir = `2 ${g(4)} 0${(graine % 9) + 1} 75 ${g(5)}4 ${g(6)}2 ${g(7)}`
  if (ids.has('iban')) infos.iban = `FR76 3000 6000 01${g(8)} 4567 8901 ${g(9)}9`
  if (ids.has('urgence')) {
    infos.urgenceNom = 'Contact fictif'
    infos.urgenceTel = `06 00 00 ${g(10)} ${g(11)}`
  }
  const documents: Personne['documents'] = {}
  for (const d of DOCUMENTS) if (ids.has(`doc_${d.id}`)) documents[d.id] = { fichier: `${d.id}.pdf`, date: '2026-03-02' }
  return { infos, documents }
}

/** Masque une donnée sensible : « •••• •••• 4589 » */
export const masquer = (v?: string) => (v ? `•••• •••• ${v.replace(/\s/g, '').slice(-4)}` : '—')
