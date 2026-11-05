import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ContratDrawer } from '../components/Contrat'
import { Shell } from '../components/Layout'
import { Avatar, dateFr, EmployeurPastille, PageHeader, Puce, StatutBadge, TypeContratBadge } from '../components/ui'
import { SERVICES } from '../data/seed'
import { dansPerimetre, getRole } from '../roles'
import { useDemo } from '../store'
import type { Contrat, StatutContrat } from '../types'
import { estATraiter } from '../workflow'

type Onglet = 'a_traiter' | 'en_cours' | StatutContrat | 'tous'

const ONGLETS: { id: Onglet; libelle: string; test: (c: Contrat) => boolean }[] = [
  { id: 'en_cours', libelle: 'En cours', test: (c) => !['actif', 'refuse'].includes(c.statut) },
  { id: 'soumis', libelle: 'Comptabilité', test: (c) => c.statut === 'soumis' },
  { id: 'valide_compta', libelle: 'Direction', test: (c) => c.statut === 'valide_compta' },
  { id: 'signe_direction', libelle: 'Signature collaborateur', test: (c) => c.statut === 'signe_direction' },
  { id: 'a_corriger', libelle: 'À corriger', test: (c) => c.statut === 'a_corriger' },
  { id: 'actif', libelle: 'Signés', test: (c) => c.statut === 'actif' },
  { id: 'refuse', libelle: 'Refusés', test: (c) => c.statut === 'refuse' },
  { id: 'tous', libelle: 'Tous', test: () => true },
]

export function Contrats() {
  const { contrats, postes, personnes, annee, role: roleId } = useDemo()
  const role = getRole(roleId)
  const [params, setParams] = useSearchParams()
  const sel = params.get('c')
  const [q, setQ] = useState('')

  const visibles = useMemo(() => {
    const ps = new Map(postes.filter((p) => p.annee === annee).map((p) => [p.id, p]))
    return contrats.filter((c) => {
      const p = ps.get(c.posteId)
      return p && dansPerimetre(role, p)
    })
  }, [contrats, postes, annee, role])
  const aTraiter = visibles.filter((c) => estATraiter(role, c))
  const onglets = [{ id: 'a_traiter' as Onglet, libelle: 'À traiter par moi', test: (c: Contrat) => estATraiter(role, c) }, ...ONGLETS]
  const [onglet, setOnglet] = useState<Onglet>(aTraiter.length ? 'a_traiter' : 'en_cours')
  const test = onglets.find((o) => o.id === onglet)!.test

  const pers = new Map(personnes.map((p) => [p.id, p]))
  const pst = new Map(postes.map((p) => [p.id, p]))
  const liste = visibles
    .filter(test)
    .filter((c) => {
      const p = pers.get(c.personneId)
      const po = pst.get(c.posteId)
      return `${p?.prenom} ${p?.nom} ${po?.intitule}`.toLowerCase().includes(q.toLowerCase())
    })
    .sort((a, b) => (b.historique.at(-1)?.date ?? '').localeCompare(a.historique.at(-1)?.date ?? ''))
  const contratSel = contrats.find((c) => c.id === sel)

  return (
    <Shell panneau={!!contratSel}>
      <PageHeader surtitre={`Exercice ${annee}`} titre="Contrats">
        <div className="relative">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-gris-clair" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Personne ou poste…"
            className="w-[240px] rounded-lg border border-ligne bg-papier py-2 pr-3 pl-9 text-[13px] outline-none focus:border-or"
          />
        </div>
      </PageHeader>
      <p className="mt-1 max-w-[760px] text-[13.5px] text-gris">
        Responsable de service → comptabilité → direction (signature Yousign) → collaborateur. Chaque étape peut renvoyer le contrat pour
        correction. Une fois signé, il part automatiquement vers Silae et POSI.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {onglets.map((o) => (
          <Puce key={o.id} actif={onglet === o.id} onClick={() => setOnglet(o.id)} compte={visibles.filter(o.test).length}>
            {o.libelle}
          </Puce>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ligne bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-ligne bg-papier text-[11px] tracking-[0.08em] text-gris uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Collaborateur</th>
              <th className="px-3 py-3 font-semibold">Poste</th>
              <th className="px-3 py-3 font-semibold">Type</th>
              <th className="px-3 py-3 font-semibold">Période</th>
              <th className="px-3 py-3 font-semibold">Dernière action</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((c) => {
              const p = pers.get(c.personneId)!
              const po = pst.get(c.posteId)!
              const der = c.historique.at(-1)
              const moi = estATraiter(role, c)
              return (
                <tr
                  key={c.id}
                  onClick={() => setParams({ c: c.id })}
                  className={`cursor-pointer border-b border-ligne/70 transition last:border-0 hover:bg-papier ${sel === c.id ? 'bg-or-pale/40' : ''}`}
                >
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      {moi && <span className="size-2 shrink-0 rounded-full bg-or" title="À traiter par vous" />}
                      <Avatar personne={p} size={32} />
                      <span className="font-medium">
                        {p.prenom} {p.nom}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div>{po.intitule}</div>
                    <div className="flex items-center gap-2 text-[12px] text-gris">
                      <EmployeurPastille id={po.employeurId} withLabel={false} />
                      {SERVICES.find((s) => s.id === po.serviceId)?.nom}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <TypeContratBadge tc={po.typeContrat} />
                  </td>
                  <td className="px-3 py-3 text-[12.5px] text-gris tabular-nums">
                    {dateFr(c.dateDebut)} → {c.dateFin ? dateFr(c.dateFin) : '—'}
                  </td>
                  <td className="px-3 py-3 text-[12.5px]">
                    <div>{der?.action}</div>
                    <div className="text-gris">
                      {der?.auteur} · {dateFr(der?.date ?? null)}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatutBadge statut={c.statut} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {liste.length === 0 && <div className="px-6 py-12 text-center text-[13px] text-gris">Aucun contrat dans cette catégorie.</div>}
      </div>

      {contratSel && <ContratDrawer contrat={contratSel} onClose={() => setParams({})} />}
    </Shell>
  )
}
