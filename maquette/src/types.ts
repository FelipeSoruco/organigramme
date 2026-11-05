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

/** Informations saisies par la personne dans son portail (toutes fictives dans la maquette). */
export interface InfosPersonnelles {
  adresse?: string
  codePostal?: string
  dateNaissance?: string
  lieuNaissance?: string
  nationalite?: string
  nir?: string
  iban?: string
  urgenceNom?: string
  urgenceTel?: string
  tenue?: string
  /** Photo réduite (data URL), stockée dans le navigateur */
  photo?: string
}

export type DocumentId = 'identite' | 'vitale' | 'rib' | 'domicile'

export interface DocumentDepose {
  fichier: string
  date: string
}

export interface Personne {
  id: string
  civilite: 'Mme' | 'M.'
  prenom: string
  nom: string
  email: string
  telephone: string
  ville: string
  /** Calculée à partir des infos et documents (voir data/dossier.ts) */
  completude: number
  portail: PortailStatut
  infos: InfosPersonnelles
  documents: Partial<Record<DocumentId, DocumentDepose>>
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

export interface EvenementContrat {
  date: string
  /** Nom de la personne qui agit (ou « Yousign », « Silae », « POSI ») */
  auteur: string
  action: string
  commentaire?: string
  statut?: StatutContrat
}

export interface Contrat {
  id: string
  posteId: string
  personneId: string
  statut: StatutContrat
  dateDebut: string
  dateFin: string | null
  echelonId: string | null
  salaire: number
  /** Rôle qui a proposé l’embauche : c’est lui qui corrige en cas de retour */
  proposePar: RoleId
  historique: EvenementContrat[]
}

export type RoleId =
  | 'resp_accueil'
  | 'resp_presse'
  | 'compta'
  | 'direction'
  | 'lecteur_stagiaires'
  | 'admin'
  | 'collaborateur'

export type Systeme = 'silae' | 'posi'
export type StatutTransmission = 'envoye' | 'erreur'

export interface TentativeTransmission {
  date: string
  auteur: string
  resultat: 'ok' | 'erreur'
  message?: string
}

/** Un envoi vers Silae (paie) ou POSI (accréditations), déclenché par la signature du contrat. */
export interface Transmission {
  id: string
  contratId: string
  personneId: string
  systeme: Systeme
  objet: string
  date: string
  statut: StatutTransmission
  /** Pièce du dossier manquante (id de PIECES) ou « technique » */
  cause?: string
  message?: string
  tentatives: TentativeTransmission[]
}
