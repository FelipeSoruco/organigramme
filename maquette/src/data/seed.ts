// Données entièrement fictives (R-002). Aucun nom, e-mail ou salaire réel.
import { dossierFictif } from './dossier'
import type {
  Contrat,
  EvenementContrat,
  RoleId,
  Echelon,
  Emploi,
  Employeur,
  EmployeurId,
  Personne,
  Poste,
  Service,
  StatutContrat,
  TypeAccreditation,
  TypeContrat,
} from '../types'

export const EMPLOYEURS: Employeur[] = [
  { id: 'affif', code: 'AFFIF', nom: 'AFFIF', couleur: '#4F5BD5' },
  { id: 'cinef', code: 'CINÉF', nom: 'Cinéfondation', couleur: '#C4622D' },
  { id: 'sogofif', code: 'SOGOFIF', nom: 'SOGOFIF', couleur: '#2E8B7A' },
]

export const SERVICES: Service[] = [
  { id: 'direction', nom: 'Direction générale' },
  { id: 'admin', nom: 'Administration & Finances' },
  { id: 'programmation', nom: 'Programmation' },
  { id: 'communication', nom: 'Communication' },
  { id: 'presse', nom: 'Presse' },
  { id: 'accueil', nom: 'Accueil & Protocole' },
  { id: 'technique', nom: 'Technique & Projection' },
  { id: 'logistique', nom: 'Logistique' },
  { id: 'cinefondation', nom: 'Cinéfondation' },
]

export const EMPLOIS: Emploi[] = [
  { id: 'direction', libelle: 'Direction' },
  { id: 'responsable', libelle: 'Responsable de service' },
  { id: 'coordination', libelle: 'Coordination' },
  { id: 'charge', libelle: 'Chargé·e de mission' },
  { id: 'comptable', libelle: 'Comptable' },
  { id: 'assistant', libelle: 'Assistant·e' },
  { id: 'attache_presse', libelle: 'Attaché·e de presse' },
  { id: 'accueil', libelle: 'Agent d’accueil' },
  { id: 'technicien', libelle: 'Technicien·ne' },
  { id: 'chauffeur', libelle: 'Chauffeur·se' },
  { id: 'prestataire', libelle: 'Prestataire' },
  { id: 'stagiaire', libelle: 'Stagiaire' },
]

export const ECHELONS: Echelon[] = [
  { id: 'E1', code: 'E1', libelle: 'Employé·e', salaireBase: 1850 },
  { id: 'E2', code: 'E2', libelle: 'Employé·e qualifié·e', salaireBase: 2050 },
  { id: 'E3', code: 'E3', libelle: 'Technicien·ne', salaireBase: 2300 },
  { id: 'E4', code: 'E4', libelle: 'Agent de maîtrise', salaireBase: 2650 },
  { id: 'E5', code: 'E5', libelle: 'Cadre', salaireBase: 3100 },
  { id: 'E6', code: 'E6', libelle: 'Cadre confirmé·e', salaireBase: 3700 },
  { id: 'E7', code: 'E7', libelle: 'Cadre supérieur·e', salaireBase: 4600 },
  { id: 'E8', code: 'E8', libelle: 'Direction', salaireBase: 6200 },
  { id: 'ST', code: 'ST', libelle: 'Gratification de stage', salaireBase: 660 },
]

export const ACCREDITATIONS: TypeAccreditation[] = [
  { id: 'permanent', libelle: 'Équipe permanente' },
  { id: 'festival', libelle: 'Équipe festival' },
  { id: 'presse', libelle: 'Presse' },
  { id: 'technique', libelle: 'Technique' },
  { id: 'stagiaire', libelle: 'Stagiaire' },
]

const P = (
  id: string,
  civilite: 'Mme' | 'M.',
  prenom: string,
  nom: string,
  ville: string,
  completude = 100,
  portail: Personne['portail'] = 'actif',
): Personne => ({
  ...dossierFictif(completude, id.length * 13 + id.charCodeAt(2)),
  id,
  civilite,
  prenom,
  nom,
  email: `${prenom}.${nom}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z.]/g, '') + '@exemple.fr',
  telephone: `06 00 00 ${String(10 + (id.charCodeAt(id.length - 1) % 89)).padStart(2, '0')} ${String(10 + (id.length * 7) % 89)}`,
  ville,
  completude: Math.round(completude / 10) * 10,
  portail,
})

export const PERSONNES: Personne[] = [
  P('p-vasseur', 'Mme', 'Hélène', 'Vasseur', 'Paris'),
  P('p-leclerc', 'M.', 'Bertrand', 'Leclerc', 'Paris'),
  P('p-garnier', 'Mme', 'Nathalie', 'Garnier', 'Paris'),
  P('p-moreau', 'Mme', 'Isabelle', 'Moreau', 'Vincennes'),
  P('p-bernard', 'M.', 'Lucas', 'Bernard', 'Montreuil', 90),
  P('p-fontaine', 'Mme', 'Camille', 'Fontaine', 'Paris'),
  P('p-delmas', 'M.', 'Antoine', 'Delmas', 'Paris'),
  P('p-dubois', 'Mme', 'Claire', 'Dubois', 'Boulogne'),
  P('p-petit', 'M.', 'Thomas', 'Petit', 'Lyon', 85),
  P('p-girard', 'Mme', 'Léa', 'Girard', 'Paris', 60),
  P('p-laurent', 'Mme', 'Inès', 'Laurent', 'Lille', 95),
  P('p-lefevre', 'M.', 'Marc', 'Lefèvre', 'Paris'),
  P('p-roux', 'M.', 'Julien', 'Roux', 'Paris'),
  P('p-rousseau', 'Mme', 'Emma', 'Rousseau', 'Nice', 100),
  P('p-faure', 'M.', 'Hugo', 'Faure', 'Marseille', 75),
  P('p-mercier', 'Mme', 'Chloé', 'Mercier', 'Bordeaux', 80),
  P('p-blanc', 'M.', 'Nicolas', 'Blanc', 'Paris'),
  P('p-chevalier', 'Mme', 'Manon', 'Chevalier', 'Nantes', 70),
  P('p-lambert', 'M.', 'Paul', 'Lambert', 'Cannes', 100),
  P('p-marchand', 'Mme', 'Sophie', 'Marchand', 'Cannes'),
  P('p-gauthier', 'M.', 'Romain', 'Gauthier', 'Antibes', 100),
  P('p-dupont', 'Mme', 'Marie', 'Dupont', 'Nice', 65),
  P('p-perrin', 'Mme', 'Jade', 'Perrin', 'Cannes', 90),
  P('p-robin', 'M.', 'Louis', 'Robin', 'Grasse', 100),
  P('p-morel', 'Mme', 'Sarah', 'Morel', 'Toulouse', 55),
  P('p-fournier', 'M.', 'Victor', 'Fournier', 'Cannes', 100),
  P('p-henry', 'M.', 'Olivier', 'Henry', 'Cannes'),
  P('p-masson', 'Mme', 'Julie', 'Masson', 'Antibes'),
  P('p-garcia', 'M.', 'Maxime', 'Garcia', 'Nice', 85),
  P('p-roussel', 'Mme', 'Alice', 'Roussel', 'Cannes', 100),
  P('p-muller', 'M.', 'Benoît', 'Muller', 'Mandelieu', 100),
  P('p-bonnet', 'M.', 'Pierre', 'Bonnet', 'Cannes'),
  P('p-benali', 'M.', 'Karim', 'Benali', 'Le Cannet', 100),
  P('p-lemaire', 'Mme', 'Anne', 'Lemaire', 'Paris'),
  P('p-picard', 'M.', 'Clément', 'Picard', 'Paris', 90),
  P('p-fabre', 'Mme', 'Laura', 'Fabre', 'Paris', 100),
  // Vivier : personnes créées, pas encore affectées
  P('p-haddad', 'Mme', 'Yasmine', 'Haddad', 'Cannes', 40, 'invite'),
  P('p-lemoine', 'M.', 'Arthur', 'Lemoine', 'Nice', 100, 'actif'),
  P('p-carpentier', 'Mme', 'Zoé', 'Carpentier', 'Paris', 20, 'invite'),
  P('p-leroy', 'M.', 'Mathis', 'Leroy', 'Antibes', 0, 'non_invite'),
  P('p-vidal', 'Mme', 'Clara', 'Vidal', 'Lyon', 75, 'actif'),
  P('p-brun', 'M.', 'Noah', 'Brun', 'Cannes', 10, 'invite'),
]

type Def = {
  k: string
  t: string
  s: string
  e: string
  ech: string | null
  emp: EmployeurId
  tc: TypeContrat
  acc: string
  p: string | null
  st?: StatutContrat
  c?: Def[]
}

const d = (
  k: string,
  t: string,
  s: string,
  e: string,
  ech: string | null,
  emp: EmployeurId,
  tc: TypeContrat,
  acc: string,
  p: string | null,
  c?: Def[],
  st?: StatutContrat,
): Def => ({ k, t, s, e, ech, emp, tc, acc, p, c, st })

const ARBRE_2026: Def = d('dg', 'Délégué·e général·e', 'direction', 'direction', 'E8', 'affif', 'CDI', 'permanent', 'p-vasseur', [
  d('sg', 'Secrétaire général·e', 'admin', 'direction', 'E7', 'affif', 'CDI', 'permanent', 'p-leclerc', [
    d('rcompta', 'Responsable comptabilité & paie', 'admin', 'responsable', 'E6', 'affif', 'CDI', 'permanent', 'p-garnier', [
      d('comptable', 'Comptable', 'admin', 'comptable', 'E4', 'affif', 'CDI', 'permanent', 'p-moreau'),
      d('asscompta', 'Assistant·e comptable', 'admin', 'assistant', 'E2', 'affif', 'CDD', 'festival', 'p-bernard'),
      d('stgestion', 'Stagiaire contrôle de gestion', 'admin', 'stagiaire', 'ST', 'affif', 'STAGE', 'stagiaire', null),
    ]),
    d('rstages', 'Chargé·e des stages & recrutement', 'admin', 'charge', 'E4', 'affif', 'CDI', 'permanent', 'p-fontaine'),
  ]),
  d('da', 'Directeur·rice artistique', 'programmation', 'direction', 'E8', 'affif', 'CDI', 'permanent', 'p-delmas', [
    d('coordprog', 'Coordinateur·rice programmation', 'programmation', 'coordination', 'E5', 'affif', 'CDI', 'permanent', 'p-dubois', [
      d('chprog1', 'Chargé·e de programmation', 'programmation', 'charge', 'E4', 'affif', 'CDD', 'festival', 'p-petit'),
      d('chprog2', 'Chargé·e de programmation', 'programmation', 'charge', 'E4', 'affif', 'CDD', 'festival', 'p-girard', undefined, 'a_corriger'),
      d('stprog', 'Stagiaire programmation', 'programmation', 'stagiaire', 'ST', 'affif', 'STAGE', 'stagiaire', 'p-laurent'),
    ]),
  ]),
  d('dircom', 'Directeur·rice de la communication', 'communication', 'direction', 'E7', 'affif', 'CDI', 'permanent', 'p-lefevre', [
    d('rpresse', 'Responsable presse', 'presse', 'responsable', 'E6', 'affif', 'CDI', 'presse', 'p-roux', [
      d('att1', 'Attaché·e de presse', 'presse', 'attache_presse', 'E3', 'affif', 'CDD', 'presse', 'p-rousseau'),
      d('att2', 'Attaché·e de presse', 'presse', 'attache_presse', 'E3', 'affif', 'CDD', 'presse', 'p-faure', undefined, 'soumis'),
      d('att3', 'Attaché·e de presse', 'presse', 'attache_presse', 'E3', 'affif', 'CDD', 'presse', null),
      d('stpresse', 'Stagiaire presse', 'presse', 'stagiaire', 'ST', 'affif', 'STAGE', 'stagiaire', 'p-mercier'),
    ]),
    d('rdigital', 'Responsable digital', 'communication', 'responsable', 'E5', 'affif', 'CDI', 'permanent', 'p-blanc', [
      d('cm', 'Community manager', 'communication', 'charge', 'E3', 'affif', 'CDD', 'festival', 'p-chevalier', undefined, 'soumis'),
      d('photo', 'Photographe', 'communication', 'prestataire', null, 'affif', 'PRESTATION', 'presse', 'p-lambert'),
    ]),
  ]),
  d('raccueil', 'Responsable Accueil & Protocole', 'accueil', 'responsable', 'E6', 'affif', 'CDI', 'permanent', 'p-marchand', [
    d('chefacc', 'Chef·fe d’accueil', 'accueil', 'coordination', 'E4', 'affif', 'CDD', 'festival', 'p-gauthier', [
      d('hote1', 'Hôte·sse d’accueil', 'accueil', 'accueil', 'E1', 'affif', 'CDD', 'festival', 'p-dupont', undefined, 'signe_direction'),
      d('hote2', 'Hôte·sse d’accueil', 'accueil', 'accueil', 'E1', 'affif', 'CDD', 'festival', 'p-perrin', undefined, 'valide_compta'),
      d('hote3', 'Hôte·sse d’accueil', 'accueil', 'accueil', 'E1', 'affif', 'CDD', 'festival', 'p-robin'),
      d('hote4', 'Hôte·sse d’accueil', 'accueil', 'accueil', 'E1', 'affif', 'CDD', 'festival', null),
      d('stacc', 'Stagiaire accueil', 'accueil', 'stagiaire', 'ST', 'affif', 'STAGE', 'stagiaire', 'p-morel', undefined, 'soumis'),
    ]),
    d('protocole', 'Chargé·e de protocole', 'accueil', 'charge', 'E4', 'affif', 'CDD', 'festival', 'p-fournier'),
  ]),
  d('dtech', 'Directeur·rice technique', 'technique', 'direction', 'E7', 'sogofif', 'CDI', 'technique', 'p-henry', [
    d('regie', 'Régisseur·se général·e', 'technique', 'responsable', 'E5', 'sogofif', 'CDI', 'technique', 'p-masson', [
      d('proj1', 'Projectionniste', 'technique', 'technicien', 'E3', 'sogofif', 'CDD', 'technique', 'p-garcia', undefined, 'valide_compta'),
      d('proj2', 'Projectionniste', 'technique', 'technicien', 'E3', 'sogofif', 'CDD', 'technique', 'p-roussel'),
      d('proj3', 'Projectionniste', 'technique', 'technicien', 'E3', 'sogofif', 'CDD', 'technique', null),
      d('son', 'Technicien·ne son', 'technique', 'prestataire', null, 'sogofif', 'PRESTATION', 'technique', 'p-muller'),
    ]),
    d('rlog', 'Responsable logistique', 'logistique', 'responsable', 'E5', 'sogofif', 'CDI', 'technique', 'p-bonnet', [
      d('chauf1', 'Chauffeur·se', 'logistique', 'chauffeur', 'E1', 'sogofif', 'CDD', 'festival', 'p-benali'),
      d('chauf2', 'Chauffeur·se', 'logistique', 'chauffeur', 'E1', 'sogofif', 'CDD', 'festival', null),
    ]),
  ]),
  d('rcf', 'Responsable Cinéfondation', 'cinefondation', 'responsable', 'E6', 'cinef', 'CDI', 'permanent', 'p-lemaire', [
    d('coordres', 'Coordinateur·rice résidence', 'cinefondation', 'coordination', 'E4', 'cinef', 'CDD', 'festival', 'p-picard'),
    d('selection', 'Chargé·e de sélection', 'cinefondation', 'charge', 'E4', 'cinef', 'CDD', 'festival', 'p-fabre'),
    d('stcf', 'Stagiaire Cinéfondation', 'cinefondation', 'stagiaire', 'ST', 'cinef', 'STAGE', 'stagiaire', null),
  ]),
])

function dates(tc: TypeContrat, annee: number): [string, string | null] {
  switch (tc) {
    case 'CDI':
      return [`${annee}-01-01`, null]
    case 'CDD':
      return [`${annee}-04-01`, `${annee}-06-15`]
    case 'STAGE':
      return [`${annee}-02-02`, `${annee}-07-31`]
    case 'PRESTATION':
      return [`${annee}-05-08`, `${annee}-05-28`]
  }
}

const NOMS_ROLES: Record<string, string> = {
  resp_accueil: 'Sophie Marchand',
  resp_presse: 'Julien Roux',
  compta: 'Nathalie Garnier',
  direction: 'Hélène Vasseur',
}

/** Historique plausible selon l’étape atteinte. */
function historiqueFictif(def: Def, statut: StatutContrat, proposePar: RoleId, i: number, annee: number): EvenementContrat[] {
  const pers = PERSONNES.find((p) => p.id === def.p)!
  if (def.tc === 'CDI' && statut === 'actif')
    return [{ date: `${annee}-01-05`, auteur: 'Reprise Organigram', action: 'Contrat CDI repris de l’ancien logiciel', statut: 'actif' }]
  const jour = (j: number) => `${annee}-03-${String(Math.min(28, 2 + ((i * 3 + j) % 20) + j)).padStart(2, '0')}`
  const h: EvenementContrat[] = [
    { date: jour(0), auteur: NOMS_ROLES[proposePar], action: 'Proposition d’embauche', statut: 'soumis' },
  ]
  const ordre: StatutContrat[] = ['soumis', 'valide_compta', 'signe_direction', 'actif']
  const rang = statut === 'a_corriger' ? 1 : ordre.indexOf(statut)
  if (rang >= 1) h.push({ date: jour(2), auteur: NOMS_ROLES.compta, action: 'Validé par la comptabilité', statut: 'valide_compta' })
  if (rang >= 2) {
    h.push({ date: jour(4), auteur: NOMS_ROLES.direction, action: 'Validé et signé par la direction', statut: 'signe_direction' })
    h.push({ date: jour(4), auteur: 'Yousign', action: `Envoyé pour signature à ${pers.prenom} ${pers.nom}` })
  }
  if (rang >= 3) {
    h.push({ date: jour(6), auteur: `${pers.prenom} ${pers.nom}`, action: 'Signé par le collaborateur', statut: 'actif' })
    h.push({ date: jour(6), auteur: 'Silae', action: 'Salarié et contrat transmis à la paie' })
  }
  if (statut === 'a_corriger')
    h.push({
      date: jour(4),
      auteur: NOMS_ROLES.direction,
      action: 'Renvoyé pour correction',
      commentaire: 'Merci de vérifier l’échelon proposé (E4 → E3 ?).',
      statut: 'a_corriger',
    })
  return h
}

function salaire(def: Def): number {
  if (def.tc === 'PRESTATION') return def.k === 'photo' ? 4200 : 3800
  const base = ECHELONS.find((e) => e.id === def.ech)?.salaireBase ?? 0
  return base
}

export function construireAnnee(annee: number): { postes: Poste[]; contrats: Contrat[] } {
  const postes: Poste[] = []
  const contrats: Contrat[] = []
  const walk = (def: Def, parentId: string | null) => {
    const id = `${annee}-${def.k}`
    const [dateDebut, dateFin] = dates(def.tc, annee)
    const poste: Poste = {
      id,
      annee,
      intitule: def.t,
      serviceId: def.s,
      emploiId: def.e,
      echelonId: def.ech,
      employeurId: def.emp,
      typeContrat: def.tc,
      accreditationId: def.acc,
      parentId,
      dateDebut,
      dateFin,
      salaire: salaire(def),
      personneId: def.p,
    }
    postes.push(poste)
    if (def.p) {
      const statut = def.st ?? 'actif'
      const proposePar: RoleId = def.s === 'accueil' ? 'resp_accueil' : def.s === 'presse' ? 'resp_presse' : 'compta'
      contrats.push({
        id: `c-${id}`,
        posteId: id,
        personneId: def.p,
        statut,
        dateDebut,
        dateFin,
        echelonId: def.ech,
        salaire: poste.salaire,
        proposePar,
        historique: historiqueFictif(def, statut, proposePar, contrats.length, annee),
      })
    }
    def.c?.forEach((c) => walk(c, id))
  }
  walk(ARBRE_2026, null)
  return { postes, contrats }
}
