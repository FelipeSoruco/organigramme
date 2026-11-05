import { Lock, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Shell } from '../components/Layout'
import { PosteDrawer } from '../components/PosteDrawer'
import {
  Avatar,
  Button,
  Champ,
  dateFr,
  EmployeurPastille,
  euros,
  INPUT,
  Modal,
  PageHeader,
  Puce,
  StatutBadge,
  TypeContratBadge,
} from '../components/ui'
import { ACCREDITATIONS, ECHELONS, EMPLOIS, EMPLOYEURS, SERVICES } from '../data/seed'
import { dansPerimetre, estPerimetreRestreint, getRole } from '../roles'
import { useDemo } from '../store'
import type { EmployeurId, Poste, TypeContrat } from '../types'
import { contratDuPoste } from '../workflow'

type Etat = 'tous' | 'pourvus' | 'a_pourvoir' | 'en_cours'

export function Postes() {
  const { postes: tous, personnes, contrats, annee, role: roleId } = useDemo()
  const role = getRole(roleId)
  const restreint = estPerimetreRestreint(role)
  const [q, setQ] = useState('')
  const [service, setService] = useState('')
  const [emp, setEmp] = useState<EmployeurId | ''>('')
  const [tc, setTc] = useState<TypeContrat | ''>('')
  const [etat, setEtat] = useState<Etat>('tous')
  const [perimetre, setPerimetre] = useState(restreint)
  const [sel, setSel] = useState<string | null>(null)
  const [creer, setCreer] = useState(false)

  const postes = useMemo(() => tous.filter((p) => p.annee === annee), [tous, annee])
  const pers = useMemo(() => new Map(personnes.map((p) => [p.id, p])), [personnes])

  const base = postes.filter((p) => {
    if (perimetre && !dansPerimetre(role, p)) return false
    if (service && p.serviceId !== service) return false
    if (emp && p.employeurId !== emp) return false
    if (tc && p.typeContrat !== tc) return false
    if (q) {
      const x = p.personneId ? pers.get(p.personneId) : undefined
      if (!`${p.intitule} ${x?.prenom ?? ''} ${x?.nom ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false
    }
    return true
  })
  const enCours = (p: Poste) => {
    const c = contratDuPoste(contrats, p.id)
    return !!c && c.statut !== 'actif'
  }
  const compte = {
    tous: base.length,
    pourvus: base.filter((p) => p.personneId).length,
    a_pourvoir: base.filter((p) => !p.personneId).length,
    en_cours: base.filter(enCours).length,
  }
  const liste = base.filter((p) =>
    etat === 'pourvus' ? p.personneId : etat === 'a_pourvoir' ? !p.personneId : etat === 'en_cours' ? enCours(p) : true,
  )
  const posteSel = postes.find((p) => p.id === sel)

  return (
    <Shell panneau={!!posteSel}>
      <PageHeader surtitre={`Exercice ${annee}`} titre="Postes">
        {role.peutEditer && (
          <Button icon={<Plus size={15} />} onClick={() => setCreer(true)}>
            Nouveau poste
          </Button>
        )}
      </PageHeader>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-gris-clair" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Poste ou titulaire…"
            className="w-[240px] rounded-lg border border-ligne bg-papier py-2 pr-3 pl-9 text-[13px] outline-none focus:border-or"
          />
        </div>
        <select value={service} onChange={(e) => setService(e.target.value)} className={`${INPUT} !w-auto`}>
          <option value="">Tous les services</option>
          {SERVICES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </select>
        <select value={emp} onChange={(e) => setEmp(e.target.value as EmployeurId | '')} className={`${INPUT} !w-auto`}>
          <option value="">Tous les employeurs</option>
          {EMPLOYEURS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom}
            </option>
          ))}
        </select>
        <select value={tc} onChange={(e) => setTc(e.target.value as TypeContrat | '')} className={`${INPUT} !w-auto`}>
          <option value="">Tous les contrats</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="STAGE">Stage</option>
          <option value="PRESTATION">Prestation</option>
        </select>
        {restreint && (
          <label className="ml-1 flex items-center gap-2 text-[13px] text-gris">
            <input type="checkbox" checked={perimetre} onChange={(e) => setPerimetre(e.target.checked)} className="size-4 accent-[#b08a3e]" />
            Mon périmètre
          </label>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Puce actif={etat === 'tous'} onClick={() => setEtat('tous')} compte={compte.tous}>
          Tous
        </Puce>
        <Puce actif={etat === 'pourvus'} onClick={() => setEtat('pourvus')} compte={compte.pourvus}>
          Pourvus
        </Puce>
        <Puce actif={etat === 'a_pourvoir'} onClick={() => setEtat('a_pourvoir')} compte={compte.a_pourvoir}>
          À pourvoir
        </Puce>
        <Puce actif={etat === 'en_cours'} onClick={() => setEtat('en_cours')} compte={compte.en_cours}>
          Contrat en cours
        </Puce>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ligne bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-ligne bg-papier text-[11px] tracking-[0.08em] text-gris uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Poste</th>
              <th className="px-3 py-3 font-semibold">Service</th>
              <th className="px-3 py-3 font-semibold">Contrat</th>
              <th className="px-3 py-3 font-semibold">Titulaire</th>
              <th className="px-3 py-3 font-semibold">Période</th>
              <th className="px-3 py-3 text-right font-semibold">Rémunération</th>
              <th className="px-5 py-3 font-semibold">Circuit</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((p) => {
              const x = p.personneId ? pers.get(p.personneId) : undefined
              const c = contratDuPoste(contrats, p.id)
              const voit = dansPerimetre(role, p)
              return (
                <tr
                  key={p.id}
                  onClick={() => setSel(p.id)}
                  className={`cursor-pointer border-b border-ligne/70 transition last:border-0 hover:bg-papier ${sel === p.id ? 'bg-or-pale/40' : ''}`}
                >
                  <td className="px-5 py-3">
                    <div className="font-medium">{p.intitule}</div>
                    <EmployeurPastille id={p.employeurId} />
                  </td>
                  <td className="px-3 py-3 text-gris">{SERVICES.find((s) => s.id === p.serviceId)?.nom}</td>
                  <td className="px-3 py-3">
                    <TypeContratBadge tc={p.typeContrat} />
                  </td>
                  <td className="px-3 py-3">
                    {x ? (
                      <span className="flex items-center gap-2">
                        <Avatar personne={x} size={26} />
                        {x.prenom} {x.nom}
                      </span>
                    ) : (
                      <span className="rounded-md border border-dashed border-or/60 px-2 py-0.5 text-[12px] text-or">À pourvoir</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[12.5px] text-gris tabular-nums">
                    {dateFr(p.dateDebut)} → {p.dateFin ? dateFr(p.dateFin) : '—'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {voit ? euros(p.salaire) : <Lock size={13} className="ml-auto text-gris-clair" />}
                  </td>
                  <td className="px-5 py-3">{c ? <StatutBadge statut={c.statut} court /> : <span className="text-gris-clair">—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {liste.length === 0 && <div className="px-6 py-12 text-center text-[13px] text-gris">Aucun poste ne correspond aux filtres.</div>}
      </div>

      {posteSel && <PosteDrawer poste={posteSel} onClose={() => setSel(null)} />}
      {creer && <NouveauPosteModal annee={annee} postes={postes} onClose={() => setCreer(false)} onCree={setSel} />}
    </Shell>
  )
}

function NouveauPosteModal({
  annee,
  postes,
  onClose,
  onCree,
}: {
  annee: number
  postes: Poste[]
  onClose: () => void
  onCree: (id: string) => void
}) {
  const creerPoste = useDemo((s) => s.creerPoste)
  const [f, setF] = useState({
    intitule: '',
    serviceId: 'accueil',
    emploiId: 'accueil',
    echelonId: 'E1' as string | null,
    employeurId: 'affif' as EmployeurId,
    typeContrat: 'CDD' as TypeContrat,
    accreditationId: 'festival',
    parentId: postes.find((p) => p.serviceId === 'accueil' && p.emploiId === 'coordination')?.id ?? null,
    dateDebut: `${annee}-04-01`,
    dateFin: `${annee}-06-15` as string | null,
  })
  const salaire = f.typeContrat === 'PRESTATION' ? 3000 : (ECHELONS.find((e) => e.id === f.echelonId)?.salaireBase ?? 0)
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Modal
      surtitre={`Exercice ${annee}`}
      titre="Nouveau poste"
      onClose={onClose}
      largeur={620}
      pied={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            disabled={!f.intitule.trim()}
            onClick={() => {
              const id = creerPoste({ ...f, annee, salaire, intitule: f.intitule.trim() })
              onClose()
              onCree(id)
            }}
          >
            Créer le poste
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Champ label="Intitulé" className="col-span-2">
          <input autoFocus value={f.intitule} onChange={(e) => set('intitule', e.target.value)} placeholder="Ex. : Hôte·sse d’accueil" className={INPUT} />
        </Champ>
        <Champ label="Service">
          <select value={f.serviceId} onChange={(e) => set('serviceId', e.target.value)} className={INPUT}>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>
        </Champ>
        <Champ label="Rattaché à">
          <select value={f.parentId ?? ''} onChange={(e) => set('parentId', e.target.value || null)} className={INPUT}>
            {postes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.intitule}
              </option>
            ))}
          </select>
        </Champ>
        <Champ label="Emploi">
          <select value={f.emploiId} onChange={(e) => set('emploiId', e.target.value)} className={INPUT}>
            {EMPLOIS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.libelle}
              </option>
            ))}
          </select>
        </Champ>
        <Champ label="Employeur">
          <select value={f.employeurId} onChange={(e) => set('employeurId', e.target.value as EmployeurId)} className={INPUT}>
            {EMPLOYEURS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
        </Champ>
        <Champ label="Type de contrat">
          <select
            value={f.typeContrat}
            onChange={(e) => {
              const t = e.target.value as TypeContrat
              setF((x) => ({
                ...x,
                typeContrat: t,
                echelonId: t === 'PRESTATION' ? null : t === 'STAGE' ? 'ST' : x.echelonId === 'ST' || !x.echelonId ? 'E1' : x.echelonId,
                dateFin: t === 'CDI' ? null : x.dateFin ?? `${annee}-06-15`,
              }))
            }}
            className={INPUT}
          >
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="STAGE">Stage</option>
            <option value="PRESTATION">Prestation</option>
          </select>
        </Champ>
        <Champ label="Échelon">
          <select
            value={f.echelonId ?? ''}
            disabled={f.typeContrat === 'PRESTATION'}
            onChange={(e) => set('echelonId', e.target.value)}
            className={INPUT}
          >
            {f.typeContrat === 'PRESTATION' && <option value="">Hors grille</option>}
            {ECHELONS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} · {e.libelle}
              </option>
            ))}
          </select>
        </Champ>
        <Champ label="Début">
          <input type="date" value={f.dateDebut} onChange={(e) => set('dateDebut', e.target.value)} className={INPUT} />
        </Champ>
        <Champ label="Fin">
          <input
            type="date"
            value={f.dateFin ?? ''}
            disabled={f.typeContrat === 'CDI'}
            onChange={(e) => set('dateFin', e.target.value || null)}
            className={INPUT}
          />
        </Champ>
        <Champ label="Accréditation POSI">
          <select value={f.accreditationId} onChange={(e) => set('accreditationId', e.target.value)} className={INPUT}>
            {ACCREDITATIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.libelle}
              </option>
            ))}
          </select>
        </Champ>
        <div className="flex items-end pb-2 text-[12.5px] text-gris">
          Rémunération de référence : <b className="ml-1 text-encre">{euros(salaire)}</b>
        </div>
      </div>
    </Modal>
  )
}
