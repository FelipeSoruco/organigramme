import type { Poste, RoleId, TypeContrat } from './types'

export interface Role {
  id: RoleId
  libelle: string
  personne: string
  fonction: string
  /** null = tous les services */
  services: string[] | null
  /** null = toutes les populations */
  populations: TypeContrat[] | null
  /** Peut modifier l’organigramme (créer des postes, affecter des personnes) */
  peutEditer: boolean
  /** Accès à l’Administration (BO) */
  accesAdmin: boolean
}

export const ROLES: Role[] = [
  {
    id: 'resp_accueil',
    libelle: 'Responsable de service',
    personne: 'Sophie Marchand',
    fonction: 'Responsable Accueil & Protocole',
    services: ['accueil'],
    populations: null,
    peutEditer: false,
    accesAdmin: false,
  },
  {
    id: 'resp_presse',
    libelle: 'Responsable de service',
    personne: 'Julien Roux',
    fonction: 'Responsable presse',
    services: ['presse'],
    populations: null,
    peutEditer: false,
    accesAdmin: false,
  },
  {
    id: 'compta',
    libelle: 'Comptabilité & paie',
    personne: 'Nathalie Garnier',
    fonction: 'Responsable comptabilité & paie',
    services: null,
    populations: null,
    peutEditer: true,
    accesAdmin: true,
  },
  {
    id: 'direction',
    libelle: 'Direction',
    personne: 'Hélène Vasseur',
    fonction: 'Déléguée générale',
    services: null,
    populations: null,
    peutEditer: false,
    accesAdmin: false,
  },
  {
    id: 'lecteur_stagiaires',
    libelle: 'Lecture transversale · stagiaires',
    personne: 'Camille Fontaine',
    fonction: 'Chargée des stages & recrutement',
    services: null,
    populations: ['STAGE'],
    peutEditer: false,
    accesAdmin: false,
  },
  {
    id: 'admin',
    libelle: 'Administrateur',
    personne: 'Administrateur',
    fonction: 'Administration de la plateforme',
    services: null,
    populations: null,
    peutEditer: true,
    accesAdmin: true,
  },
  {
    id: 'collaborateur',
    libelle: 'Collaborateur',
    personne: 'Marie Dupont',
    fonction: 'Hôtesse d’accueil · CDD',
    services: [],
    populations: [],
    peutEditer: false,
    accesAdmin: false,
  },
]

export const getRole = (id: RoleId) => ROLES.find((r) => r.id === id) ?? ROLES[0]

/** Périmètre = service × population. Hors périmètre : structure visible, détails confidentiels. */
export function dansPerimetre(role: Role, poste: Poste): boolean {
  const okService = role.services === null || role.services.includes(poste.serviceId)
  const okPopulation = role.populations === null || role.populations.includes(poste.typeContrat)
  return okService && okPopulation
}

export const estPerimetreRestreint = (role: Role) => role.services !== null || role.populations !== null
