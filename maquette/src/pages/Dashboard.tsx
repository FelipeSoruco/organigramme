import { ArrowRight, ArrowUpRight, Network } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/Layout'
import { Avatar, PageHeader, StatutBadge, TypeContratBadge, employeur } from '../components/ui'
import { EMPLOYEURS, SERVICES } from '../data/seed'
import { dansPerimetre, getRole } from '../roles'
import { useDemo } from '../store'
import type { StatutContrat } from '../types'

const A_TRAITER: Partial<Record<string, StatutContrat[]>> = {
  compta: ['soumis', 'a_corriger'],
  direction: ['valide_compta'],
}

export function Dashboard() {
  const { postes: tous, personnes, contrats, annee, role: roleId } = useDemo()
  const role = getRole(roleId)
  const postes = useMemo(() => tous.filter((p) => p.annee === annee && dansPerimetre(role, p)), [tous, annee, role])
  const ids = new Set(postes.map((p) => p.id))
  const enCours = contrats.filter((c) => ids.has(c.posteId) && c.statut !== 'actif')
  const aTraiter = A_TRAITER[role.id] ? enCours.filter((c) => A_TRAITER[role.id]!.includes(c.statut)) : enCours
  const pourvus = postes.filter((p) => p.personneId).length
  const persIds = new Set(postes.map((p) => p.personneId).filter(Boolean))
  const incomplets = personnes.filter((p) => persIds.has(p.id) && p.completude < 100).length
  const prenom = role.personne.split(' ')[0]
  const aujourdhui = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  const kpis = [
    { v: postes.length, l: `Postes ${annee}`, s: role.services || role.populations ? 'dans votre périmètre' : 'tous employeurs' },
    { v: `${postes.length ? Math.round((pourvus / postes.length) * 100) : 0} %`, l: 'Taux de pourvoi', s: `${postes.length - pourvus} postes à pourvoir` },
    { v: aTraiter.length, l: 'Contrats à traiter', s: 'en attente de votre action', accent: true },
    { v: incomplets, l: 'Dossiers incomplets', s: 'relance automatique par e-mail' },
  ]

  return (
    <Shell>
      <PageHeader surtitre={aujourdhui} titre={`Bonjour ${prenom === 'Administrateur' ? '' : prenom}`.trim()}>
        <Link to="/organigramme">
          <span className="inline-flex items-center gap-2 rounded-lg bg-encre px-3.5 py-2 text-sm font-medium text-ivoire shadow-sm hover:bg-encre-2">
            <Network size={15} /> Ouvrir l’organigramme {annee}
          </span>
        </Link>
      </PageHeader>
      <p className="mt-1 text-[14px] text-gris">
        {role.fonction}
        {role.services && ` · périmètre : ${role.services.map((s) => SERVICES.find((x) => x.id === s)?.nom).join(', ')}`}
        {role.populations && ' · périmètre : stagiaires de tous les services'}
      </p>

      <div className="mt-8 grid grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div
            key={k.l}
            className={`anim-fade rounded-2xl border p-5 ${k.accent ? 'border-encre bg-nuit text-white' : 'border-ligne bg-white'}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`text-[12.5px] ${k.accent ? 'text-white/55' : 'text-gris'}`}>{k.l}</div>
            <div className={`font-display mt-2 text-[40px] leading-none font-medium tabular-nums ${k.accent ? 'text-or-clair' : ''}`}>{k.v}</div>
            <div className={`mt-2 text-[12px] ${k.accent ? 'text-white/45' : 'text-gris-clair'}`}>{k.s}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[1.6fr_1fr] gap-6">
        <section className="rounded-2xl border border-ligne bg-white">
          <div className="flex items-center justify-between border-b border-ligne px-6 py-4">
            <h2 className="font-display text-[19px] font-medium">À traiter</h2>
            <span className="flex items-center gap-1 text-[12.5px] text-gris">
              Tous les contrats <ArrowRight size={13} />
            </span>
          </div>
          {aTraiter.length === 0 && <div className="px-6 py-10 text-center text-[13px] text-gris">Rien à traiter pour le moment.</div>}
          <ul>
            {aTraiter.map((c) => {
              const p = personnes.find((x) => x.id === c.personneId)!
              const poste = tous.find((x) => x.id === c.posteId)!
              return (
                <li key={c.id} className="flex items-center gap-4 border-b border-ligne/70 px-6 py-3.5 last:border-0 hover:bg-papier">
                  <Avatar personne={p} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium">
                      {p.prenom} {p.nom}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gris">
                      <span className="size-1.5 rounded-full" style={{ background: employeur(poste.employeurId).couleur }} />
                      {poste.intitule} · {SERVICES.find((s) => s.id === poste.serviceId)?.nom}
                    </div>
                  </div>
                  <TypeContratBadge tc={poste.typeContrat} />
                  <StatutBadge statut={c.statut} />
                  <ArrowUpRight size={15} className="text-gris-clair" />
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-ligne bg-white p-6">
          <h2 className="font-display text-[19px] font-medium">Par employeur</h2>
          <div className="mt-5 space-y-5">
            {EMPLOYEURS.map((e) => {
              const ps = postes.filter((p) => p.employeurId === e.id)
              const ok = ps.filter((p) => p.personneId).length
              return (
                <div key={e.id}>
                  <div className="mb-2 flex items-baseline justify-between text-[13px]">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="size-2.5 rounded-full" style={{ background: e.couleur }} />
                      {e.nom}
                    </span>
                    <span className="text-gris tabular-nums">
                      {ok} / {ps.length} postes
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ivoire">
                    <div className="h-full rounded-full" style={{ width: `${ps.length ? (ok / ps.length) * 100 : 0}%`, background: e.couleur }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-7 rounded-xl bg-ivoire p-4 text-[12.5px] leading-relaxed text-gris">
            Une fois signés, les contrats sont transmis automatiquement à <b className="text-encre">Silae</b> (paie) et à{' '}
            <b className="text-encre">POSI</b> (accréditations).
          </div>
        </section>
      </div>
    </Shell>
  )
}
