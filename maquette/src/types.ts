export type EmployeurId = 'affif' | 'cinef' | 'sogofif'
export type TypeContrat = 'CDI' | 'CDD' | 'PRESTATION' | 'STAGE'

export interface Employeur {
  id: EmployeurId
  code: string
  nom: string
  couleur: string
}

export interface Service {
  id: string
  nom: string
}

export interface Emploi {
  id: string
  libelle: string
}

export interface Echelon {
  id: string
  code: string
  libelle: string
  salaireBase: number
}

export interface TypeAccreditation {
  id: string
  libelle: string
}

/** Un poste existe pour une année donnée. L'ensemble des postes d'une année forme l'organigramme. */
export interface Poste {
  id: string
  annee: number
  intitule: string
  serviceId: string
  emploiId: string
  echelonId: string | null
  employeurId: EmployeurId
  typeContrat: TypeContrat
  accreditationId: string
  parentId: string | null
  dateDebut: string
  dateFin: string | null
  salaire: number
  /** 1 poste = 1 personne par année (D-003) */
  personneId: string | null
}

export type PortailStatut = 'non_invite' | 'invite' | 'actif'

export interface Personne {
  id: string
  civilite: 'Mme' | 'M.'
  prenom: string
  nom: string
  email: string
  telephone: string
  ville: string
  completude: number
  portail: PortailStatut
}

/** États fixes du circuit (R-003). */
export type StatutContrat =
  | 'brouillon'
  | 'soumis'
  | 'valide_compta'
  | 'signe_direction'
  | 'actif'
  | 'a_corriger'
  | 'refuse'

export interface Contrat {
  id: string
  posteId: string
  personneId: string
  statut: StatutContrat
  dateDebut: string
  dateFin: string | null
  salaire: number
}

export type RoleId =
  | 'resp_accueil'
  | 'resp_presse'
  | 'compta'
  | 'direction'
  | 'lecteur_stagiaires'
  | 'admin'
  | 'collaborateur'
