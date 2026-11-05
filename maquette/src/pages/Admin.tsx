// oxlint-disable react/jsx-key -- cellules de tableau : les clés sont posées au rendu (Tableau)
import { ArrowRight, Check, Eye, Lock, Minus, Plug, PlugZap } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/Layout'
import { Avatar, Button, dateFr, euros, PageHeader, Puce, STATUTS, TypeContratBadge } from '../components/ui'
import { ACCREDITATIONS, ECHELONS, EMPLOIS, EMPLOYEURS, SERVICES } from '../data/seed'
import { getRole, ROLES, type Role } from '../roles'
import { useDemo } from '../store'
import { SYSTEMES } from '../transmissions'
import type { TypeContrat } from '../types'
import { notifier } from '../ui-store'
import { ETAPES_CIRCUIT } from '../workflow'

function Reserve({ children }: { children: ReactNode }) {
  const role = getRole(useDemo((s) => s.role))
  if (role.accesAdmin) return <>{children}</>
  return (
    <Shell>
      <PageHeader surtitre="Administration" titre="Accès réservé" />
      <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white px-6 py-5 text-[13px] text-gris ring-1 ring-ligne">
        <Lock size={16} /> L’administration est réservée à la comptabilité et à l’administrateur de la plateforme.
      </div>
    </Shell>
  )
}

function LectureSeule() {
  return (
    <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-or-pale/60 px-4 py-2.5 text-[12.5px] text-[#7A5A12]">
      <Eye size={14} /> Maquette en lecture : dans la version réelle, l’administrateur ajoute et modifie ces éléments ici, sans développeur.
    </div>
  )
}

function Tableau({ colonnes, lignes }: { colonnes: string[]; lignes: ReactNode[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ligne bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-ligne bg-papier text-[11px] tracking-[0.08em] text-gris uppercase">
          <tr>
            {colonnes.map((c) => (
              <th key={c} className="px-5 py-3 font-semibold first:pl-6">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => (
            <tr key={i} className="border-b border-ligne/70 last:border-0">
              {l.map((v, j) => (
                <td key={j} className={`px-5 py-3 first:pl-6 ${j === 0 ? 'font-medium' : ''}`}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------------------------------------- Référentiels */

const TYPES_CONTRAT: { id: TypeContrat; libelle: string; modele: string; silae: boolean }[] = [
  { id: 'CDI', libelle: 'Contrat à durée indéterminée', modele: 'CDI – droit commun', silae: true },
  { id: 'CDD', libelle: 'Contrat à durée déterminée (saison festival)', modele: 'CDD d’usage – festival', silae: true },
  { id: 'STAGE', libelle: 'Convention de stage', modele: 'Convention tripartite', silae: true },
  { id: 'PRESTATION', libelle: 'Contrat de prestation', modele: 'Contrat de prestation de services', silae: false },
]

const MODELES = [
  { nom: 'CDI – droit commun', tc: 'CDI' as TypeContrat, emp: 'Tous', maj: '2026-01-12', champs: 14 },
  { nom: 'CDD d’usage – festival', tc: 'CDD' as TypeContrat, emp: 'AFFIF, SOGOFIF', maj: '2026-02-03', champs: 18 },
  { nom: 'CDD – Cinéfondation', tc: 'CDD' as TypeContrat, emp: 'Cinéfondation', maj: '2026-02-03', champs: 17 },
  { nom: 'Convention tripartite', tc: 'STAGE' as TypeContrat, emp: 'Tous', maj: '2025-11-20', champs: 21 },
  { nom: 'Contrat de prestation de services', tc: 'PRESTATION' as TypeContrat, emp: 'Tous', maj: '2025-10-08', champs: 11 },
]

type Ref = 'employeurs' | 'services' | 'emplois' | 'echelons' | 'types' | 'accreditations' | 'modeles' | 'circuit'

export function Referentiels() {
  const { postes, annee } = useDemo()
  const [ref, setRef] = useState<Ref>('employeurs')
  const ps = postes.filter((p) => p.annee === annee)
  const n = (f: (p: (typeof ps)[number]) => boolean) => <span className="tabular-nums">{ps.filter(f).length}</span>

  const contenus: Record<Ref, { libelle: string; compte: number; colonnes: string[]; lignes: ReactNode[][] }> = {
    employeurs: {
      libelle: 'Employeurs',
      compte: EMPLOYEURS.length,
      colonnes: ['Employeur', 'Code', 'Couleur', `Postes ${annee}`],
      lignes: EMPLOYEURS.map((e) => [
        e.nom,
        <code className="text-[12px]">{e.code}</code>,
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ background: e.couleur }} />
          <span className="text-[12px] text-gris">{e.couleur}</span>
        </span>,
        n((p) => p.employeurId === e.id),
      ]),
    },
    services: {
      libelle: 'Services',
      compte: SERVICES.length,
      colonnes: ['Service', `Postes ${annee}`, 'Responsable(s) avec accès'],
      lignes: SERVICES.map((s) => [
        s.nom,
        n((p) => p.serviceId === s.id),
        ROLES.filter((r) => r.services?.includes(s.id))
          .map((r) => r.personne)
          .join(', ') || <span className="text-gris-clair">—</span>,
      ]),
    },
    emplois: {
      libelle: 'Emplois',
      compte: EMPLOIS.length,
      colonnes: ['Emploi', `Postes ${annee}`],
      lignes: EMPLOIS.map((e) => [e.libelle, n((p) => p.emploiId === e.id)]),
    },
    echelons: {
      libelle: 'Échelons',
      compte: ECHELONS.length,
      colonnes: ['Code', 'Libellé', 'Salaire mensuel de base', `Postes ${annee}`],
      lignes: ECHELONS.map((e) => [e.code, e.libelle, <span className="tabular-nums">{euros(e.salaireBase)}</span>, n((p) => p.echelonId === e.id)]),
    },
    types: {
      libelle: 'Types de contrat',
      compte: TYPES_CONTRAT.length,
      colonnes: ['Type', 'Libellé', 'Modèle par défaut', 'Envoi Silae', 'Envoi POSI'],
      lignes: TYPES_CONTRAT.map((t) => [
        <TypeContratBadge tc={t.id} />,
        t.libelle,
        t.modele,
        t.silae ? <Check size={15} className="text-[#2E8B7A]" /> : <Minus size={15} className="text-gris-clair" />,
        <Check size={15} className="text-[#2E8B7A]" />,
      ]),
    },
    accreditations: {
      libelle: 'Accréditations POSI',
      compte: ACCREDITATIONS.length,
      colonnes: ['Type d’accréditation', `Postes ${annee}`, 'Pièces exigées par POSI'],
      lignes: ACCREDITATIONS.map((a) => [
        a.libelle,
        n((p) => p.accreditationId === a.id),
        <span className="text-gris">Photo, date et lieu de naissance, pièce d’identité</span>,
      ]),
    },
    modeles: {
      libelle: 'Modèles de contrat',
      compte: MODELES.length,
      colonnes: ['Modèle', 'Type', 'Employeurs', 'Champs fusionnés', 'Mis à jour'],
      lignes: MODELES.map((m) => [
        m.nom,
        <TypeContratBadge tc={m.tc} />,
        m.emp,
        <span className="tabular-nums">{m.champs}</span>,
        <span className="text-gris tabular-nums">{dateFr(m.maj)}</span>,
      ]),
    },
    circuit: {
      libelle: 'Circuit des contrats',
      compte: ETAPES_CIRCUIT.length,
      colonnes: ['Ordre', 'Étape (fixe)', 'Libellé affiché', 'Qui agit'],
      lignes: ETAPES_CIRCUIT.map((e, i) => [
        <span className="tabular-nums">{i + 1}</span>,
        <code className="text-[12px] text-gris">{e.statut}</code>,
        STATUTS[e.statut].libelle,
        ['Comptabilité & paie', 'Direction (signature Yousign)', 'Le collaborateur (Yousign)', 'Envoi automatique Silae + POSI'][i],
      ]),
    },
  }
  const c = contenus[ref]

  return (
    <Reserve>
      <Shell>
        <PageHeader surtitre="Administration" titre="Référentiels" />
        <p className="mt-1 max-w-[760px] text-[13.5px] text-gris">
          Les listes de référence utilisées partout dans la plateforme : à la création d’un poste, dans les contrats et dans les envois vers
          Silae et POSI.
        </p>
        <LectureSeule />
        <div className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(contenus) as Ref[]).map((k) => (
            <Puce key={k} actif={ref === k} onClick={() => setRef(k)} compte={contenus[k].compte}>
              {contenus[k].libelle}
            </Puce>
          ))}
        </div>
        <div className="mt-5">
          <Tableau colonnes={c.colonnes} lignes={c.lignes} />
        </div>
        {ref === 'circuit' && (
          <p className="mt-3 text-[12.5px] text-gris">
            Les étapes du circuit sont fixes (elles garantissent la signature et les envois) ; seuls leurs libellés sont personnalisables.
          </p>
        )}
      </Shell>
    </Reserve>
  )
}

/* ---------------------------------------------------------------- Droits */

const DROITS: { libelle: string; test: (r: Role) => boolean }[] = [
  { libelle: 'Organigramme', test: (r) => r.id !== 'collaborateur' },
  { libelle: 'Proposer une embauche', test: (r) => ['compta', 'admin'].includes(r.id) || (!!r.services && r.services.length > 0) },
  { libelle: 'Valider (compta)', test: (r) => ['compta', 'admin'].includes(r.id) },
  { libelle: 'Valider et signer', test: (r) => ['direction', 'admin'].includes(r.id) },
  { libelle: 'NIR / IBAN', test: (r) => ['compta', 'admin'].includes(r.id) },
  { libelle: 'Administration', test: (r) => r.accesAdmin },
]

function perimetre(r: Role) {
  if (r.id === 'collaborateur') return 'Son propre dossier'
  const s = r.services ? r.services.map((x) => SERVICES.find((y) => y.id === x)?.nom).join(', ') : 'Tous les services'
  const p = r.populations ? (r.populations.includes('STAGE') ? 'stagiaires uniquement' : r.populations.join(', ')) : 'toutes populations'
  return `${s} · ${p}`
}

export function Droits() {
  return (
    <Reserve>
      <Shell>
        <PageHeader surtitre="Administration" titre="Utilisateurs & droits" />
        <p className="mt-1 max-w-[780px] text-[13.5px] text-gris">
          Chaque utilisateur a un rôle et un périmètre. Le périmètre combine des <b className="text-encre">services</b> et des{' '}
          <b className="text-encre">populations</b> (par exemple : tous les stagiaires, quel que soit le service). Hors périmètre,
          l’organigramme reste visible mais les détails sont confidentiels.
        </p>
        <LectureSeule />
        <div className="mt-6 overflow-hidden rounded-2xl border border-ligne bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-ligne bg-papier text-[11px] tracking-[0.06em] text-gris uppercase">
              <tr>
                <th className="py-3 pr-3 pl-6 font-semibold">Utilisateur</th>
                <th className="px-3 py-3 font-semibold">Périmètre</th>
                {DROITS.map((d) => (
                  <th key={d.libelle} className="px-2 py-3 text-center font-semibold">
                    {d.libelle}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => {
                const [p, ...nom] = r.personne.split(' ')
                return (
                  <tr key={r.id} className="border-b border-ligne/70 last:border-0">
                    <td className="py-3 pr-3 pl-6">
                      <span className="flex items-center gap-3">
                        <Avatar personne={{ prenom: p, nom: nom.join(' ') || 'A' }} size={32} />
                        <span>
                          <span className="block font-medium">{r.personne}</span>
                          <span className="block text-[12px] text-gris">{r.libelle}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12.5px] text-encre-2">{perimetre(r)}</td>
                    {DROITS.map((d) => (
                      <td key={d.libelle} className="px-2 py-3 text-center">
                        {d.test(r) ? (
                          <Check size={16} strokeWidth={2.5} className="mx-auto text-[#2E8B7A]" />
                        ) : (
                          <Minus size={14} className="mx-auto text-ligne-forte" />
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] text-gris">
          Les collaborateurs n’ont accès qu’au portail : leurs informations, leurs documents et leurs contrats à signer. L’accès aux données
          sensibles (NIR, IBAN) est tracé.
        </p>
      </Shell>
    </Reserve>
  )
}

/* ---------------------------------------------------------------- Connecteurs */

export function Connecteurs() {
  const { transmissions, contrats } = useDemo()
  const erreurs = (s: 'silae' | 'posi') => transmissions.filter((t) => t.systeme === s && t.statut === 'erreur').length
  const envois = (s: 'silae' | 'posi') => transmissions.filter((t) => t.systeme === s).length
  const signatures = contrats.filter((c) => c.historique.some((e) => e.auteur === 'Yousign')).length

  const cartes = [
    {
      nom: 'Yousign',
      role: 'Signature électronique',
      couleur: '#6B2F86',
      fond: '#F1E4F6',
      etat: 'Connecté',
      details: [
        ['Compte', 'Organigramme – démo'],
        ['Signataire direction', 'Hélène Vasseur'],
        ['Validation', 'Code SMS à usage unique'],
        ['Contrats envoyés', String(signatures)],
      ],
      erreurs: 0,
    },
    {
      nom: SYSTEMES.silae.nom,
      role: 'Paie',
      couleur: SYSTEMES.silae.couleur,
      fond: SYSTEMES.silae.fond,
      etat: 'Connecté',
      details: [
        ['Dossiers de paie', 'AFFIF · Cinéfondation · SOGOFIF'],
        ['Envoyé à la signature', 'Salarié, contrat, échelon, salaire'],
        ['Non envoyé', 'Prestations (hors paie)'],
        ['Envois', String(envois('silae'))],
      ],
      erreurs: erreurs('silae'),
    },
    {
      nom: SYSTEMES.posi.nom,
      role: 'Accréditations',
      couleur: SYSTEMES.posi.couleur,
      fond: SYSTEMES.posi.fond,
      etat: 'Connecté',
      details: [
        ['Envoyé à la signature', 'Identité, photo, type d’accréditation'],
        ['Types d’accréditation', String(ACCREDITATIONS.length)],
        ['Pièces exigées', 'Photo, naissance, pièce d’identité'],
        ['Envois', String(envois('posi'))],
      ],
      erreurs: erreurs('posi'),
    },
  ]

  return (
    <Reserve>
      <Shell>
        <PageHeader surtitre="Administration" titre="Connecteurs" />
        <p className="mt-1 max-w-[760px] text-[13.5px] text-gris">
          Les services externes avec lesquels la plateforme échange. Dans la maquette, les connexions sont simulées : aucune donnée ne
          quitte votre navigateur.
        </p>
        <LectureSeule />
        <div className="mt-6 grid grid-cols-3 gap-5">
          {cartes.map((c) => (
            <section key={c.nom} className="flex flex-col rounded-2xl border border-ligne bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl" style={{ background: c.fond, color: c.couleur }}>
                    <Plug size={20} />
                  </div>
                  <div>
                    <div className="font-display text-[20px] leading-tight font-medium">{c.nom}</div>
                    <div className="text-[12px] text-gris">{c.role}</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DFF1EA] px-2.5 py-1 text-[11px] font-medium text-[#1E6656]">
                  <span className="size-1.5 rounded-full bg-current" /> {c.etat}
                </span>
              </div>
              <dl className="mt-5 flex-1 divide-y divide-ligne/70 text-[12.5px]">
                {c.details.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-2">
                    <dt className="text-gris">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              {c.erreurs > 0 && (
                <Link
                  to="/transmissions"
                  className="mt-3 flex items-center justify-between rounded-xl bg-[#FDF3F3] px-3 py-2 text-[12.5px] font-medium text-[#9B2C2C] hover:bg-[#FBE3E3]"
                >
                  {c.erreurs} envoi{c.erreurs > 1 ? 's' : ''} en erreur <ArrowRight size={14} />
                </Link>
              )}
              <Button
                variant="secondary"
                className="mt-4"
                icon={<PlugZap size={15} />}
                onClick={() => notifier(`Connexion ${c.nom} : OK`, 'Test simulé dans la maquette')}
              >
                Tester la connexion
              </Button>
            </section>
          ))}
        </div>
      </Shell>
    </Reserve>
  )
}
