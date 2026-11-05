import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  FileSignature,
  LayoutDashboard,
  Network,
  Plug,
  RotateCcw,
  Shield,
  Users,
  BriefcaseBusiness,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { getRole, ROLES } from '../roles'
import { useDemo } from '../store'
import { Avatar } from './ui'

const NAV_TRAVAIL = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/organigramme', label: 'Organigramme', icon: Network },
  { to: '/postes', label: 'Postes', icon: BriefcaseBusiness },
  { to: '/personnes', label: 'Personnes', icon: Users },
  { to: '/contrats', label: 'Contrats', icon: FileSignature },
  { to: '/transmissions', label: 'Transmissions', icon: ArrowLeftRight },
  { to: '/rapports', label: 'Rapports', icon: BarChart3 },
]
const NAV_ADMIN = [
  { to: '/admin/referentiels', label: 'Référentiels', icon: BookOpen },
  { to: '/admin/droits', label: 'Utilisateurs & droits', icon: Shield },
  { to: '/admin/connecteurs', label: 'Connecteurs', icon: Plug },
]

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Network }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition ${
          isActive ? 'bg-or-pale font-medium text-encre' : 'text-gris hover:bg-ivoire hover:text-encre'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} strokeWidth={1.8} className={isActive ? 'text-or' : ''} />
          {label}
        </>
      )}
    </NavLink>
  )
}

function Sidebar() {
  const role = getRole(useDemo((s) => s.role))
  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-ligne bg-white px-4 py-6 text-encre">
      <div className="mb-9 flex items-center gap-3 px-2">
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-or-clair to-or text-white shadow-sm shadow-or/30">
          <Network size={18} />
        </div>
        <div>
          <div className="font-display text-[19px] leading-none font-medium tracking-tight">Organigramme</div>
          <div className="mt-1 text-[12px] text-gris">Espace RH</div>
        </div>
      </div>
      <div className="mb-2 px-3 text-[11.5px] font-medium text-gris-clair">Espace de travail</div>
      <nav className="flex flex-col gap-0.5">
        {NAV_TRAVAIL.map((n) => (
          <NavItem key={n.to} {...n} />
        ))}
      </nav>
      {role.accesAdmin && (
        <>
          <div className="mt-8 mb-2 px-3 text-[11.5px] font-medium text-gris-clair">Administration</div>
          <nav className="flex flex-col gap-0.5">
            {NAV_ADMIN.map((n) => (
              <NavItem key={n.to} {...n} />
            ))}
          </nav>
        </>
      )}
      <div className="mt-auto rounded-xl bg-ivoire p-3 text-[11.5px] leading-relaxed text-gris">
        <span className="font-medium text-or">Maquette</span> — données fictives. Changez de rôle en haut à droite pour voir
        ce que voit chacun.
      </div>
    </aside>
  )
}

export function RoleSwitcher() {
  const { role, setRole } = useDemo()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const r = getRole(role)
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const [prenom, ...nom] = r.personne.split(' ')
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl border border-ligne bg-papier py-1.5 pr-3 pl-1.5 transition hover:border-ligne-forte"
      >
        <Avatar personne={{ prenom, nom: nom.join(' ') || 'A' }} size={32} />
        <div className="text-left">
          <div className="text-[13px] leading-tight font-medium">{r.personne}</div>
          <div className="text-[11px] leading-tight text-gris">{r.libelle}</div>
        </div>
        <ChevronDown size={15} className="ml-1 text-gris" />
      </button>
      {open && (
        <div className="anim-fade absolute top-full right-0 z-50 mt-2 w-[330px] rounded-2xl border border-ligne bg-white p-2 shadow-xl shadow-encre/10">
          <div className="px-3 pt-2 pb-2 text-[12px] font-medium text-gris">
            Voir la plateforme en tant que…
          </div>
          {ROLES.map((x) => {
            const [p, ...n] = x.personne.split(' ')
            return (
              <button
                key={x.id}
                onClick={() => {
                  setRole(x.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-ivoire ${
                  x.id === role ? 'bg-ivoire' : ''
                }`}
              >
                <Avatar personne={{ prenom: p, nom: n.join(' ') || 'A' }} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium">{x.personne}</div>
                  <div className="truncate text-[11.5px] text-gris">
                    {x.libelle} · {x.fonction}
                  </div>
                </div>
                {x.id === role && <Check size={15} className="text-or" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function YearSwitcher() {
  const { annee, annees, setAnnee } = useDemo()
  return (
    <div className="flex items-center rounded-xl border border-ligne bg-papier p-1">
      {annees.map((a) => (
        <button
          key={a}
          onClick={() => setAnnee(a)}
          className={`rounded-lg px-3 py-1.5 text-[13px] font-medium tabular-nums transition ${
            a === annee ? 'bg-encre text-ivoire shadow-sm' : 'text-gris hover:text-encre'
          }`}
        >
          {a}
        </button>
      ))}
    </div>
  )
}

export function ResetButton({ dark = false }: { dark?: boolean }) {
  const reinitialiser = useDemo((s) => s.reinitialiser)
  return (
    <button
      title="Réinitialiser la démo"
      onClick={() => confirm('Réinitialiser toutes les données de démonstration ?') && reinitialiser()}
      className={`grid size-10 place-items-center rounded-xl border transition ${
        dark ? 'border-white/10 text-white/50 hover:text-white' : 'border-ligne bg-papier text-gris hover:text-encre'
      }`}
    >
      <RotateCcw size={16} />
    </button>
  )
}

/** Remet le défilement en haut à chaque changement de page. */
export function useHautDePage() {
  const { pathname } = useLocation()
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    ref.current?.scrollTo(0, 0)
  }, [pathname])
  return ref
}

export function Layout() {
  const { pathname } = useLocation()
  const main = useHautDePage()
  const pleinEcran = pathname.startsWith('/organigramme')
  return (
    <div className="flex h-full min-w-[1280px]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-[60] flex h-[68px] shrink-0 items-center justify-end gap-3 border-b border-ligne bg-ivoire/80 px-8 backdrop-blur">
          <span className="mr-1 text-[12px] text-gris">Exercice</span>
          <YearSwitcher />
          <div className="mx-2 h-6 w-px bg-ligne" />
          <RoleSwitcher />
          <ResetButton />
        </header>
        <main ref={main} className={`min-h-0 flex-1 ${pleinEcran ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** `panneau` : une fiche latérale (460 px) est ouverte, le contenu se resserre pour rester visible. */
export function Shell({ children, panneau = false }: { children: ReactNode; panneau?: boolean }) {
  return (
    <div className={`py-9 transition-[padding] duration-200 ${panneau ? 'pr-[490px] pl-10' : 'mx-auto max-w-[1320px] px-10'}`}>{children}</div>
  )
}
