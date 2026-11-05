import { ChevronDown, ChevronUp, Copy, Lock, Maximize2, Minus, Plus, Search, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PosteDrawer } from '../components/PosteDrawer'
import { Avatar, Button, EmployeurPastille, StatutBadge, TypeContratBadge } from '../components/ui'
import { EMPLOYEURS, SERVICES } from '../data/seed'
import { dansPerimetre, estPerimetreRestreint, getRole } from '../roles'
import { useDemo } from '../store'
import type { Contrat, EmployeurId, Personne, Poste } from '../types'

type Ctx = {
  enfants: Map<string | null, Poste[]>
  personnes: Map<string, Personne>
  contrats: Map<string, Contrat>
  replies: Set<string>
  selection: string | null
  estAttenue: (p: Poste) => boolean
  estSurligne: (p: Poste) => boolean
  ouvrir: (id: string) => void
  basculer: (id: string) => void
}

const serviceNom = (id: string) => SERVICES.find((s) => s.id === id)?.nom ?? id

function compterDescendants(id: string, enfants: Map<string | null, Poste[]>): number {
  return (enfants.get(id) ?? []).reduce((n, c) => n + 1 + compterDescendants(c.id, enfants), 0)
}

function Carte({ poste, ctx, variante }: { poste: Poste; ctx: Ctx; variante: 'racine' | 'normale' | 'compacte' }) {
  const personne = poste.personneId ? ctx.personnes.get(poste.personneId) : undefined
  const contrat = ctx.contrats.get(poste.id)
  const enCours = contrat && contrat.statut !== 'actif'
  const attenue = ctx.estAttenue(poste)
  const surligne = ctx.estSurligne(poste)
  const selectionne = ctx.selection === poste.id
  const couleur = EMPLOYEURS.find((e) => e.id === poste.employeurId)!.couleur
  const nbEnfants = compterDescendants(poste.id, ctx.enfants)
  const replie = ctx.replies.has(poste.id)
  const largeur = variante === 'racine' ? 268 : variante === 'compacte' ? 188 : 214
  const racine = variante === 'racine'

  return (
    <div className="relative" style={{ width: largeur }}>
      <button
        data-carte
        data-poste={poste.id}
        onClick={() => ctx.ouvrir(poste.id)}
        className={`group relative block w-full overflow-hidden rounded-xl text-left transition duration-200 ${
          racine
            ? 'bg-nuit text-white shadow-lg shadow-encre/20'
            : personne
              ? 'border border-ligne bg-white shadow-[0_1px_2px_rgba(23,22,27,0.05)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-encre/[0.07]'
              : 'border border-dashed border-ligne-forte bg-papier/70 hover:border-or hover:bg-white'
        } ${attenue ? 'opacity-25 saturate-0' : ''} ${selectionne ? 'ring-2 ring-or ring-offset-2 ring-offset-ivoire' : ''} ${
          surligne ? 'ring-2 ring-or/70' : ''
        }`}
      >
        {!racine && <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: couleur }} />}
        <div className={racine ? 'px-4 py-3.5' : variante === 'compacte' ? 'px-3 py-2.5' : 'px-3.5 py-3'}>
          <div className="flex items-start justify-between gap-2">
            <div className={`leading-snug font-semibold ${racine ? 'font-display text-[15px] font-medium' : 'text-[12.5px]'}`}>
              {poste.intitule}
            </div>
            {!racine && <TypeContratBadge tc={poste.typeContrat} />}
          </div>
          {variante !== 'compacte' && (
            <div className={`mt-0.5 text-[11px] ${racine ? 'text-white/45' : 'text-gris'}`}>
              {serviceNom(poste.serviceId)}
              {racine && ' · ' + EMPLOYEURS.find((e) => e.id === poste.employeurId)!.nom}
            </div>
          )}
          <div className={`flex items-center gap-2 ${variante === 'compacte' ? 'mt-2' : 'mt-3'}`}>
            {personne ? (
              <>
                <Avatar personne={personne} size={variante === 'compacte' ? 22 : 26} />
                <span className={`truncate text-[12.5px] ${racine ? 'text-white/90' : 'text-encre-2'}`}>
                  {personne.prenom} {personne.nom}
                </span>
              </>
            ) : (
              <>
                <span
                  className="grid shrink-0 place-items-center rounded-full border border-dashed border-or/60 text-or"
                  style={{ width: variante === 'compacte' ? 22 : 26, height: variante === 'compacte' ? 22 : 26 }}
                >
                  <Plus size={12} />
                </span>
                <span className="text-[12px] font-medium text-or">Poste à pourvoir</span>
              </>
            )}
          </div>
          {enCours && (
            <div className="mt-2">
              <StatutBadge statut={contrat.statut} court />
            </div>
          )}
        </div>
      </button>
      {nbEnfants > 0 && (
        <button
          onClick={() => ctx.basculer(poste.id)}
          className="absolute -bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-ligne bg-white px-1.5 py-px text-[10px] font-semibold text-gris shadow-sm hover:text-encre"
        >
          {replie ? (
            <>
              {nbEnfants} <ChevronDown size={11} />
            </>
          ) : (
            <ChevronUp size={11} />
          )}
        </button>
      )}
    </div>
  )
}

function Branche({ poste, ctx, racine = false }: { poste: Poste; ctx: Ctx; racine?: boolean }) {
  const enfants = ctx.enfants.get(poste.id) ?? []
  const replie = ctx.replies.has(poste.id)
  const feuilles = enfants.length > 0 && enfants.every((e) => !(ctx.enfants.get(e.id)?.length ?? 0))
  return (
    <li>
      <Carte poste={poste} ctx={ctx} variante={racine ? 'racine' : 'normale'} />
      {!replie && enfants.length > 0 &&
        (feuilles ? (
          <div className="org-stack" style={{ width: 232 }}>
            {enfants.map((e) => (
              <div key={e.id}>
                <Carte poste={e} ctx={ctx} variante="compacte" />
              </div>
            ))}
          </div>
        ) : (
          <ul>
            {enfants.map((e) => (
              <Branche key={e.id} poste={e} ctx={ctx} />
            ))}
          </ul>
        ))}
    </li>
  )
}

/* ---------- Toile avec déplacement et zoom ---------- */
function useToile() {
  const toile = useRef<HTMLDivElement>(null)
  const contenu = useRef<HTMLDivElement>(null)
  const [vue, setVue] = useState({ x: 0, y: 40, k: 0.8 })
  const glisse = useRef<{ x: number; y: number; vx: number; vy: number; bouge: boolean } | null>(null)
  const aBouge = useRef(false)

  const ajuster = useCallback(() => {
    const c = toile.current
    const i = contenu.current
    if (!c || !i) return
    const w = i.offsetWidth
    const h = i.offsetHeight
    const k = Math.max(0.42, Math.min(1, (c.clientWidth - 64) / w, (c.clientHeight - 80) / h))
    setVue({ k, x: (c.clientWidth - w * k) / 2, y: 40 })
  }, [])

  useLayoutEffect(() => {
    const c = toile.current
    const i = contenu.current
    if (!c || !i) return
    const w = i.offsetWidth
    const k = 0.8
    setVue({ k, x: (c.clientWidth - w * k) / 2, y: 40 })
  }, [])

  useEffect(() => {
    const c = toile.current
    if (!c) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = c.getBoundingClientRect()
      const mx = e.clientX - r.left
      const my = e.clientY - r.top
      setVue((v) => {
        const k = Math.min(1.6, Math.max(0.3, v.k * (1 - e.deltaY * 0.0015)))
        return { k, x: mx - ((mx - v.x) * k) / v.k, y: my - ((my - v.y) * k) / v.k }
      })
    }
    c.addEventListener('wheel', onWheel, { passive: false })
    return () => c.removeEventListener('wheel', onWheel)
  }, [])

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('button:not([data-carte]), input')) return
      glisse.current = { x: e.clientX, y: e.clientY, vx: vue.x, vy: vue.y, bouge: false }
    },
    onPointerMove: (e: React.PointerEvent) => {
      const g = glisse.current
      if (!g) return
      const dx = e.clientX - g.x
      const dy = e.clientY - g.y
      if (!g.bouge && Math.abs(dx) + Math.abs(dy) > 4) {
        g.bouge = true
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }
      if (g.bouge) setVue((v) => ({ ...v, x: g.vx + dx, y: g.vy + dy }))
    },
    onPointerUp: () => {
      aBouge.current = glisse.current?.bouge ?? false
      glisse.current = null
    },
    // Un glisser ne doit pas ouvrir la fiche du poste
    onClickCapture: (e: React.MouseEvent) => {
      if (aBouge.current) {
        e.stopPropagation()
        aBouge.current = false
      }
    },
  }

  /** Décale la toile pour que la carte ne soit pas cachée par la fiche (440 px à droite). */
  const reveler = (el: Element) => {
    const c = toile.current
    if (!c) return
    const rc = c.getBoundingClientRect()
    const re = el.getBoundingClientRect()
    const limite = rc.right - 440 - 32
    let dx = 0
    if (re.right > limite) dx = limite - re.right
    if (re.left + dx < rc.left + 24) dx = rc.left + 24 - re.left
    if (dx) setVue((v) => ({ ...v, x: v.x + dx }))
  }

  const zoomer = (f: number) => {
    const c = toile.current
    if (!c) return
    const mx = c.clientWidth / 2
    const my = c.clientHeight / 2
    setVue((v) => {
      const k = Math.min(1.6, Math.max(0.3, v.k * f))
      return { k, x: mx - ((mx - v.x) * k) / v.k, y: my - ((my - v.y) * k) / v.k }
    })
  }

  return { toile, contenu, vue, handlers, ajuster, zoomer, reveler }
}

/* ---------- Page ---------- */
export function Organigramme() {
  const { postes: tous, personnes: lp, contrats: lc, annee, annees, role: roleId, preparerAnnee } = useDemo()
  const role = getRole(roleId)
  const postes = useMemo(() => tous.filter((p) => p.annee === annee), [tous, annee])
  const [selection, setSelection] = useState<string | null>(null)
  const [replies, setReplies] = useState<Set<string>>(new Set())
  const [filtreEmp, setFiltreEmp] = useState<EmployeurId | null>(null)
  const [recherche, setRecherche] = useState('')
  const [monPerimetre, setMonPerimetre] = useState(false)
  const [preparer, setPreparer] = useState(false)
  const { toile, contenu, vue, handlers, ajuster, zoomer, reveler } = useToile()

  const personnes = useMemo(() => new Map(lp.map((p) => [p.id, p])), [lp])
  const contrats = useMemo(() => new Map(lc.filter((c) => c.statut !== 'refuse').map((c) => [c.posteId, c])), [lc])
  const enfants = useMemo(() => {
    const m = new Map<string | null, Poste[]>()
    postes.forEach((p) => m.set(p.parentId, [...(m.get(p.parentId) ?? []), p]))
    return m
  }, [postes])
  const racine = enfants.get(null)?.[0]

  const q = recherche.trim().toLowerCase()
  const correspond = (p: Poste) => {
    if (!q) return false
    const pers = p.personneId ? personnes.get(p.personneId) : undefined
    return `${p.intitule} ${pers?.prenom ?? ''} ${pers?.nom ?? ''}`.toLowerCase().includes(q)
  }

  const ctx: Ctx = {
    enfants,
    personnes,
    contrats,
    replies,
    selection,
    estAttenue: (p) =>
      (filtreEmp !== null && p.employeurId !== filtreEmp) ||
      (q !== '' && !correspond(p)) ||
      (monPerimetre && !dansPerimetre(role, p)),
    estSurligne: (p) => q !== '' && correspond(p),
    ouvrir: (id) => {
      setSelection(id)
      const el = toile.current?.querySelector(`[data-poste="${id}"]`)
      if (el) reveler(el)
    },
    basculer: (id) =>
      setReplies((s) => {
        const n = new Set(s)
        if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      }),
  }

  const pourvus = postes.filter((p) => p.personneId).length
  const enCours = postes.filter((p) => {
    const c = contrats.get(p.id)
    return c && c.statut !== 'actif'
  }).length
  const anneeSuivante = Math.max(...annees) + 1
  const peutPreparer = role.peutEditer && annee === Math.max(...annees)
  const restreint = estPerimetreRestreint(role)
  const posteSel = postes.find((p) => p.id === selection)

  useEffect(() => setSelection(null), [annee])
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setSelection(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  return (
    <div className="relative flex h-full flex-col">
      {/* En-tête */}
      <div className="flex shrink-0 items-end justify-between gap-6 border-b border-ligne bg-ivoire px-10 pt-7 pb-5">
        <div>
          <div className="mb-1 text-xs font-semibold tracking-[0.14em] text-or uppercase">Exercice {annee}</div>
          <h1 className="font-display text-[34px] leading-tight font-medium tracking-tight">Organigramme</h1>
          <div className="mt-2 flex items-center gap-5 text-[13px] text-gris">
            <span>
              <b className="font-semibold text-encre tabular-nums">{postes.length}</b> postes
            </span>
            <span>
              <b className="font-semibold text-encre tabular-nums">{pourvus}</b> pourvus
            </span>
            <span>
              <b className="font-semibold text-or tabular-nums">{postes.length - pourvus}</b> à pourvoir
            </span>
            <span>
              <b className="font-semibold text-encre tabular-nums">{enCours}</b> contrats en cours de validation
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-gris-clair" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Poste ou personne…"
              className="w-[260px] rounded-lg border border-ligne bg-papier py-2 pr-8 pl-9 text-[13px] outline-none placeholder:text-gris-clair focus:border-or"
            />
            {recherche && (
              <button onClick={() => setRecherche('')} className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gris">
                <X size={14} />
              </button>
            )}
          </div>
          {restreint && (
            <Button variant={monPerimetre ? 'primary' : 'secondary'} onClick={() => setMonPerimetre(!monPerimetre)} icon={<Lock size={14} />}>
              Mon périmètre
            </Button>
          )}
          {peutPreparer && (
            <Button variant="or" icon={<Sparkles size={15} />} onClick={() => setPreparer(true)}>
              Préparer {anneeSuivante}
            </Button>
          )}
        </div>
      </div>

      {/* Toile */}
      <div className="relative min-h-0 flex-1">
      <div
        ref={toile}
        {...handlers}
        className="grain absolute inset-0 cursor-grab overflow-hidden select-none active:cursor-grabbing"
      >
        <div
          ref={contenu}
          className="org absolute top-0 left-0 w-max origin-top-left pb-24"
          style={{ transform: `translate(${vue.x}px, ${vue.y}px) scale(${vue.k})` }}
        >
          {racine && (
            <ul>
              <Branche poste={racine} ctx={ctx} racine />
            </ul>
          )}
        </div>

        {/* Légende */}
        <div className="absolute bottom-5 left-6 flex items-center gap-1 rounded-xl border border-ligne bg-white/90 p-1.5 shadow-sm backdrop-blur">
          {EMPLOYEURS.map((e) => (
            <button
              key={e.id}
              onClick={() => setFiltreEmp(filtreEmp === e.id ? null : e.id)}
              className={`rounded-lg px-2.5 py-1.5 transition ${filtreEmp === e.id ? 'bg-ivoire ring-1 ring-ligne-forte' : 'hover:bg-ivoire'} ${
                filtreEmp && filtreEmp !== e.id ? 'opacity-40' : ''
              }`}
            >
              <EmployeurPastille id={e.id} />
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-ligne" />
          <span className="flex items-center gap-1.5 px-2 text-xs text-gris">
            <span className="size-3 rounded border border-dashed border-or" /> À pourvoir
          </span>
        </div>

        {/* Zoom */}
        <div className="absolute right-6 bottom-5 flex items-center gap-0.5 rounded-xl border border-ligne bg-white/90 p-1 shadow-sm backdrop-blur">
          <button onClick={() => zoomer(1 / 1.2)} className="grid size-8 place-items-center rounded-lg text-gris hover:bg-ivoire hover:text-encre">
            <Minus size={15} />
          </button>
          <span className="w-12 text-center text-xs font-medium text-gris tabular-nums">{Math.round(vue.k * 100)} %</span>
          <button onClick={() => zoomer(1.2)} className="grid size-8 place-items-center rounded-lg text-gris hover:bg-ivoire hover:text-encre">
            <Plus size={15} />
          </button>
          <div className="mx-1 h-5 w-px bg-ligne" />
          <button onClick={ajuster} className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-gris hover:bg-ivoire hover:text-encre">
            <Maximize2 size={13} /> Ajuster
          </button>
        </div>
      </div>

      {posteSel && <PosteDrawer poste={posteSel} onClose={() => setSelection(null)} />}
      </div>

      {preparer && (
        <PreparerModal
          depuis={annee}
          vers={anneeSuivante}
          postes={postes}
          onCancel={() => setPreparer(false)}
          onConfirm={() => {
            preparerAnnee(annee, anneeSuivante)
            setPreparer(false)
          }}
        />
      )}
    </div>
  )
}

function PreparerModal({
  depuis,
  vers,
  postes,
  onCancel,
  onConfirm,
}: {
  depuis: number
  vers: number
  postes: Poste[]
  onCancel: () => void
  onConfirm: () => void
}) {
  const cdi = postes.filter((p) => p.typeContrat === 'CDI' && p.personneId).length
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-encre/30 backdrop-blur-[2px]" onClick={onCancel}>
      <div className="anim-fade w-[480px] rounded-2xl bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 grid size-11 place-items-center rounded-xl bg-or-pale text-or">
          <Copy size={20} />
        </div>
        <h2 className="font-display text-[24px] font-medium tracking-tight">Préparer l’exercice {vers}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-gris">
          L’organigramme {depuis} sert de point de départ. Vous pourrez ensuite ajouter, supprimer ou réorganiser les postes.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            [postes.length, 'postes copiés', 'avec leur hiérarchie'],
            [cdi, 'CDI reconduits', 'personne conservée'],
            [postes.length - cdi, 'postes à pourvoir', 'CDD, stages, prestations'],
          ].map(([n, l, s]) => (
            <div key={l} className="rounded-xl border border-ligne bg-papier p-3">
              <div className="font-display text-[26px] leading-none font-medium tabular-nums">{n}</div>
              <div className="mt-1.5 text-[12.5px] font-medium">{l}</div>
              <div className="text-[11px] text-gris">{s}</div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Créer l’exercice {vers}
          </Button>
        </div>
      </div>
    </div>
  )
}
