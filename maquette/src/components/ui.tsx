import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { EMPLOYEURS } from '../data/seed'
import type { EmployeurId, Personne, StatutContrat, TypeContrat } from '../types'

const AVATAR_TONS = ['#E9E2F7', '#F6E3D7', '#DCEFE9', '#F3E9CC', '#E1E8F5', '#F5DDE3', '#E4EEDA']
const AVATAR_ENCRE = ['#4B3A86', '#8A4320', '#1E6656', '#7A5A12', '#2F4C86', '#8A2E48', '#3F6326']

export function initiales(p: Pick<Personne, 'prenom' | 'nom'>) {
  return (p.prenom[0] + p.nom[0]).toUpperCase()
}

export function Avatar({
  personne,
  size = 32,
}: {
  personne: Pick<Personne, 'prenom' | 'nom'> & { infos?: Personne['infos'] }
  size?: number
}) {
  const photo = personne.infos?.photo
  if (photo?.startsWith('data:'))
    return <img src={photo} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  const h = [...(personne.prenom + personne.nom)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONS.length
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: AVATAR_TONS[h],
        color: AVATAR_ENCRE[h],
      }}
    >
      {initiales(personne)}
    </span>
  )
}

export const employeur = (id: EmployeurId) => EMPLOYEURS.find((e) => e.id === id)!

export function EmployeurPastille({ id, withLabel = true }: { id: EmployeurId; withLabel?: boolean }) {
  const e = employeur(id)
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-encre-2">
      <span className="size-2 rounded-full" style={{ background: e.couleur }} />
      {withLabel && e.nom}
    </span>
  )
}

const TC_STYLE: Record<TypeContrat, string> = {
  CDI: 'bg-encre text-ivoire',
  CDD: 'bg-or-pale text-[#7A5A12]',
  STAGE: 'bg-[#E8EEF9] text-[#2F4C86]',
  PRESTATION: 'bg-[#EFEDE8] text-gris',
}
const TC_LABEL: Record<TypeContrat, string> = { CDI: 'CDI', CDD: 'CDD', STAGE: 'Stage', PRESTATION: 'Prestation' }

export function TypeContratBadge({ tc }: { tc: TypeContrat }) {
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${TC_STYLE[tc]}`}>
      {TC_LABEL[tc]}
    </span>
  )
}

export const STATUTS: Record<StatutContrat, { libelle: string; court: string; ton: string }> = {
  brouillon: { libelle: 'Brouillon', court: 'Brouillon', ton: 'bg-[#EFEDE8] text-gris' },
  soumis: { libelle: 'En attente · comptabilité', court: 'Compta', ton: 'bg-[#FCEFD9] text-[#8A5A0E]' },
  valide_compta: { libelle: 'En attente · direction', court: 'Direction', ton: 'bg-[#E6E8FB] text-[#3B46A8]' },
  signe_direction: { libelle: 'En attente · signature collaborateur', court: 'Signature', ton: 'bg-[#F1E4F6] text-[#6B2F86]' },
  actif: { libelle: 'Signé · actif', court: 'Actif', ton: 'bg-[#DFF1EA] text-[#1E6656]' },
  a_corriger: { libelle: 'À corriger', court: 'À corriger', ton: 'bg-[#FBE3E3] text-[#9B2C2C]' },
  refuse: { libelle: 'Refusé', court: 'Refusé', ton: 'bg-[#EFEDE8] text-gris' },
}

export function StatutBadge({ statut, court = false }: { statut: StatutContrat; court?: boolean }) {
  const s = STATUTS[statut]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.ton}`}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {court ? s.court : s.libelle}
    </span>
  )
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  icon,
  title,
  className = '',
}: {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'or'
  onClick?: () => void
  disabled?: boolean
  icon?: ReactNode
  title?: string
  className?: string
}) {
  const v = {
    primary: 'bg-encre text-ivoire hover:bg-encre-2 shadow-sm',
    secondary: 'bg-papier text-encre border border-ligne hover:border-ligne-forte hover:bg-white',
    ghost: 'text-gris hover:text-encre hover:bg-encre/5',
    or: 'bg-or text-white hover:bg-[#9c7832] shadow-sm',
  }[variant]
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${v} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}

export function Progress({ value }: { value: number }) {
  const ton = value >= 100 ? '#2E8B7A' : value >= 70 ? '#B08A3E' : '#C4622D'
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ligne">
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: ton }} />
    </div>
  )
}

export const euros = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export const dateFr = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '—'

export function PageHeader({ surtitre, titre, children }: { surtitre?: string; titre: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        {surtitre && <div className="mb-1 text-[13px] font-medium text-or first-letter:uppercase">{surtitre}</div>}
        <h1 className="font-display text-[34px] leading-tight font-medium tracking-tight text-encre">{titre}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

export function Modal({
  titre,
  surtitre,
  children,
  onClose,
  largeur = 520,
  pied,
}: {
  titre: ReactNode
  surtitre?: string
  children: ReactNode
  onClose: () => void
  largeur?: number
  pied?: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-nuit/40 p-6 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div
        className="anim-fade flex max-h-[90vh] w-full flex-col rounded-2xl border border-ligne bg-white shadow-2xl shadow-encre/20"
        style={{ maxWidth: largeur }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ligne px-7 pt-6 pb-5">
          <div>
            {surtitre && <div className="mb-1 text-[12.5px] font-medium text-or">{surtitre}</div>}
            <h2 className="font-display text-[22px] leading-tight font-medium tracking-tight">{titre}</h2>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-gris hover:bg-ivoire hover:text-encre">
            <X size={17} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">{children}</div>
        {pied && <div className="flex justify-end gap-2 border-t border-ligne bg-papier px-7 py-4">{pied}</div>}
      </div>
    </div>
  )
}

export function Champ({ label, children, aide, className = '' }: { label: string; children: ReactNode; aide?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[12px] font-medium text-encre-2">{label}</span>
      {children}
      {aide && <span className="mt-1 block text-[11.5px] text-gris-clair">{aide}</span>}
    </label>
  )
}

export const INPUT =
  'w-full rounded-lg border border-ligne bg-papier px-3 py-2 text-[13px] outline-none transition placeholder:text-gris-clair focus:border-or focus:bg-white disabled:text-gris'

export function Section({ titre, children, action }: { titre: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ligne bg-white">
      <div className="flex items-center justify-between border-b border-ligne px-6 py-4">
        <h2 className="font-display text-[18px] font-medium">{titre}</h2>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}

export function Libelle({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-[12px] font-medium text-gris">{children}</div>
}

export function Puce({ actif, onClick, children, compte }: { actif: boolean; onClick: () => void; children: ReactNode; compte?: number }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${
        actif ? 'border-or/50 bg-or-pale text-encre' : 'border-ligne bg-white text-gris hover:border-ligne-forte hover:text-encre'
      }`}
    >
      {children}
      {compte !== undefined && (
        <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${actif ? 'bg-white text-or' : 'bg-ivoire'}`}>{compte}</span>
      )}
    </button>
  )
}
