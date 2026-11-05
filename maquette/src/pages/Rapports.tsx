import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Shell } from '../components/Layout'
import { Button, dateFr, euros, PageHeader, Puce, STATUTS } from '../components/ui'
import { piecesManquantes } from '../data/dossier'
import { EMPLOYEURS, SERVICES } from '../data/seed'
import { dansPerimetre, getRole } from '../roles'
import { useDemo } from '../store'
import type { Contrat, EmployeurId, Personne, Poste, TypeContrat } from '../types'
import { contratDuPoste } from '../workflow'
import { notifier } from '../ui-store'

type Format = 'texte' | 'nombre' | 'euros'
interface Colonne {
  titre: string
  format?: Format
}
type Cellule = string | number
interface Rapport {
  colonnes: Colonne[]
  lignes: Cellule[][]
  total?: Cellule[]
}

type RapportId = 'service' | 'employeur' | 'type' | 'nominatif' | 'dossiers'

const RAPPORTS: { id: RapportId; titre: string; description: string }[] = [
  { id: 'service', titre: 'Effectifs par service', description: 'Postes, pourvoi et salaires mensuels par service.' },
  { id: 'employeur', titre: 'Par employeur', description: 'Répartition entre AFFIF, Cinéfondation et SOGOFIF.' },
  { id: 'type', titre: 'Par type de contrat', description: 'CDI, CDD, stages et prestations.' },
  { id: 'nominatif', titre: 'Liste nominative', description: 'Un poste par ligne, avec la personne et l’état du contrat.' },
  { id: 'dossiers', titre: 'Dossiers incomplets', description: 'Personnes affectées dont le dossier n’est pas complet.' },
]

const TYPES: { id: TypeContrat; libelle: string }[] = [
  { id: 'CDI', libelle: 'CDI' },
  { id: 'CDD', libelle: 'CDD' },
  { id: 'STAGE', libelle: 'Stage' },
  { id: 'PRESTATION', libelle: 'Prestation' },
]

const COLS_SYNTHESE: Colonne[] = [
  { titre: 'Postes', format: 'nombre' },
  { titre: 'Pourvus', format: 'nombre' },
  { titre: 'À pourvoir', format: 'nombre' },
  { titre: 'Contrats en cours', format: 'nombre' },
  { titre: 'Salaires mensuels bruts', format: 'euros' },
]

function synthese(postes: Poste[], contrats: Contrat[]): Cellule[] {
  const pourvus = postes.filter((p) => p.personneId)
  const enCours = postes.filter((p) => {
    const c = contratDuPoste(contrats, p.id)
    return c && c.statut !== 'actif'
  })
  return [postes.length, pourvus.length, postes.length - pourvus.length, enCours.length, pourvus.reduce((a, p) => a + p.salaire, 0)]
}

function grouper<K extends string>(postes: Poste[], contrats: Contrat[], groupes: { id: K; libelle: string }[], cle: (p: Poste) => K): Rapport {
  const lignes = groupes
    .map((g) => [g.libelle, ...synthese(postes.filter((p) => cle(p) === g.id), contrats)])
    .filter((l) => (l[1] as number) > 0)
  return { colonnes: [{ titre: '' }, ...COLS_SYNTHESE], lignes, total: ['Total', ...synthese(postes, contrats)] }
}

function construire(id: RapportId, postes: Poste[], contrats: Contrat[], personnes: Personne[]): Rapport {
  const nom = (pid: string | null) => {
    const p = personnes.find((x) => x.id === pid)
    return p ? `${p.prenom} ${p.nom}` : ''
  }
  const service = (sid: string) => SERVICES.find((s) => s.id === sid)?.nom ?? ''
  const emp = (eid: EmployeurId) => EMPLOYEURS.find((e) => e.id === eid)?.nom ?? ''
  switch (id) {
    case 'service': {
      const r = grouper(postes, contrats, SERVICES.map((s) => ({ id: s.id, libelle: s.nom })), (p) => p.serviceId)
      r.colonnes[0] = { titre: 'Service' }
      return r
    }
    case 'employeur': {
      const r = grouper(postes, contrats, EMPLOYEURS.map((e) => ({ id: e.id, libelle: e.nom })), (p) => p.employeurId)
      r.colonnes[0] = { titre: 'Employeur' }
      return r
    }
    case 'type': {
      const r = grouper(postes, contrats, TYPES, (p) => p.typeContrat)
      r.colonnes[0] = { titre: 'Type de contrat' }
      return r
    }
    case 'nominatif':
      return {
        colonnes: [
          { titre: 'Poste' },
          { titre: 'Service' },
          { titre: 'Employeur' },
          { titre: 'Type' },
          { titre: 'Collaborateur' },
          { titre: 'Début' },
          { titre: 'Fin' },
          { titre: 'Contrat' },
          { titre: 'Salaire mensuel', format: 'euros' },
        ],
        lignes: postes.map((p) => {
          const c = contratDuPoste(contrats, p.id)
          return [
            p.intitule,
            service(p.serviceId),
            emp(p.employeurId),
            TYPES.find((t) => t.id === p.typeContrat)!.libelle,
            nom(p.personneId) || 'À pourvoir',
            dateFr(p.dateDebut),
            p.dateFin ? dateFr(p.dateFin) : '—',
            c ? STATUTS[c.statut].court : '—',
            p.salaire,
          ]
        }),
      }
    case 'dossiers': {
      const lignes: Cellule[][] = []
      for (const p of postes) {
        const pers = personnes.find((x) => x.id === p.personneId)
        if (!pers || pers.completude >= 100) continue
        lignes.push([
          `${pers.prenom} ${pers.nom}`,
          p.intitule,
          service(p.serviceId),
          pers.completude,
          piecesManquantes(pers)
            .map((m) => m.libelle)
            .join(', '),
          { actif: 'Actif', invite: 'Invité·e', non_invite: 'Non invité·e' }[pers.portail],
        ])
      }
      lignes.sort((a, b) => (a[3] as number) - (b[3] as number))
      return {
        colonnes: [
          { titre: 'Collaborateur' },
          { titre: 'Poste' },
          { titre: 'Service' },
          { titre: 'Complété (%)', format: 'nombre' },
          { titre: 'Éléments manquants' },
          { titre: 'Portail' },
        ],
        lignes,
      }
    }
  }
}

function exporterCsv(nomFichier: string, r: Rapport) {
  const esc = (v: Cellule) => {
    const s = String(v)
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lignes = [r.colonnes.map((c) => c.titre), ...r.lignes, ...(r.total ? [r.total] : [])]
  // Point-virgule et BOM : s’ouvre directement dans Excel en français.
  const csv = '﻿' + lignes.map((l) => l.map(esc).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier
  a.click()
  URL.revokeObjectURL(url)
  notifier('Export téléchargé', nomFichier)
}

export function Rapports() {
  const { postes: tous, contrats, personnes, annee, role: roleId } = useDemo()
  const role = getRole(roleId)
  const [id, setId] = useState<RapportId>('service')
  const [emp, setEmp] = useState<EmployeurId | 'tous'>('tous')
  const [tc, setTc] = useState<TypeContrat | 'tous'>('tous')

  const postes = useMemo(
    () =>
      tous.filter(
        (p) => p.annee === annee && dansPerimetre(role, p) && (emp === 'tous' || p.employeurId === emp) && (tc === 'tous' || p.typeContrat === tc),
      ),
    [tous, annee, role, emp, tc],
  )
  const rapport = construire(id, postes, contrats, personnes)
  const def = RAPPORTS.find((r) => r.id === id)!
  const affiche = (v: Cellule, f?: Format) => (f === 'euros' ? euros(v as number) : f === 'nombre' ? Number(v).toLocaleString('fr-FR') : v)
  const SELECT = 'rounded-lg border border-ligne bg-papier px-3 py-2 text-[13px] outline-none focus:border-or'

  return (
    <Shell>
      <PageHeader surtitre={`Exercice ${annee}`} titre="Rapports">
        <Button
          icon={<Download size={15} />}
          onClick={() => exporterCsv(`organigramme-${id}-${annee}.csv`, rapport)}
          disabled={rapport.lignes.length === 0}
        >
          Exporter (CSV / Excel)
        </Button>
      </PageHeader>
      <p className="mt-1 max-w-[760px] text-[13.5px] text-gris">
        Extractions prêtes à l’emploi sur l’exercice {annee}, limitées à votre périmètre. L’export s’ouvre directement dans Excel.
      </p>

      <div className="mt-7 grid grid-cols-[250px_1fr] gap-6">
        <nav className="space-y-1">
          {RAPPORTS.map((r) => (
            <button
              key={r.id}
              onClick={() => setId(r.id)}
              className={`block w-full rounded-xl px-4 py-3 text-left transition ${
                id === r.id ? 'bg-white shadow-sm ring-1 ring-ligne' : 'hover:bg-white/60'
              }`}
            >
              <div className={`text-[13.5px] font-medium ${id === r.id ? 'text-encre' : 'text-encre-2'}`}>{r.titre}</div>
              <div className="mt-0.5 text-[12px] leading-snug text-gris">{r.description}</div>
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <select value={emp} onChange={(e) => setEmp(e.target.value as EmployeurId | 'tous')} className={SELECT}>
              <option value="tous">Tous les employeurs</option>
              {EMPLOYEURS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <Puce actif={tc === 'tous'} onClick={() => setTc('tous')}>
                Tous types
              </Puce>
              {TYPES.map((t) => (
                <Puce key={t.id} actif={tc === t.id} onClick={() => setTc(t.id)}>
                  {t.libelle}
                </Puce>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-ligne bg-white">
            <div className="flex items-baseline justify-between border-b border-ligne px-5 py-4">
              <h2 className="font-display text-[18px] font-medium">{def.titre}</h2>
              <span className="text-[12px] text-gris">{rapport.lignes.length} ligne{rapport.lignes.length > 1 ? 's' : ''}</span>
            </div>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 border-b border-ligne bg-papier text-[11px] tracking-[0.08em] text-gris uppercase">
                  <tr>
                    {rapport.colonnes.map((c, i) => (
                      <th key={i} className={`px-4 py-3 font-semibold whitespace-nowrap ${c.format ? 'text-right' : ''}`}>
                        {c.titre}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rapport.lignes.map((l, i) => (
                    <tr key={i} className="border-b border-ligne/70 last:border-0 hover:bg-papier">
                      {l.map((v, j) => (
                        <td key={j} className={`px-4 py-2.5 ${rapport.colonnes[j].format ? 'text-right tabular-nums' : ''} ${j === 0 ? 'font-medium' : ''}`}>
                          {affiche(v, rapport.colonnes[j].format)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {rapport.total && rapport.lignes.length > 0 && (
                  <tfoot className="border-t-2 border-ligne-forte bg-ivoire/60 font-semibold">
                    <tr>
                      {rapport.total.map((v, j) => (
                        <td key={j} className={`px-4 py-3 ${rapport.colonnes[j].format ? 'text-right tabular-nums' : ''}`}>
                          {affiche(v, rapport.colonnes[j].format)}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
              {rapport.lignes.length === 0 && <div className="px-6 py-12 text-center text-[13px] text-gris">Aucune donnée pour ces filtres.</div>}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
