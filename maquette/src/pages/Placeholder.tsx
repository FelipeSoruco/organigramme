import { Hourglass, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ResetButton, RoleSwitcher, Shell } from '../components/Layout'
import { PageHeader } from '../components/ui'

export function Placeholder({ titre, phase, description }: { titre: string; phase: number; description: string }) {
  return (
    <Shell>
      <PageHeader surtitre="Espace de travail" titre={titre} />
      <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-ligne-forte bg-papier px-8 py-20 text-center">
        <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-or-pale text-or">
          <Hourglass size={22} />
        </div>
        <div className="font-display text-[22px] font-medium">Bientôt dans la maquette</div>
        <p className="mt-2 max-w-[460px] text-[14px] leading-relaxed text-gris">{description}</p>
        <div className="mt-4 rounded-full bg-ivoire px-3 py-1 text-[11.5px] font-semibold tracking-wide text-gris uppercase">
          Phase {phase}
        </div>
        <Link to="/organigramme" className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-or hover:underline">
          <Network size={14} /> Voir l’organigramme
        </Link>
      </div>
    </Shell>
  )
}

export function PortailPlaceholder() {
  return (
    <div className="flex h-full min-w-[1280px] flex-col bg-ivoire">
      <header className="relative z-[60] flex h-[68px] items-center justify-between border-b border-ligne px-10">
        <div className="font-display text-[20px] font-medium tracking-tight">
          Mon espace <span className="text-or">·</span> <span className="text-gris">collaborateur</span>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <ResetButton />
        </div>
      </header>
      <div className="grid flex-1 place-items-center">
        <div className="max-w-[520px] text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-or-pale text-or">
            <Hourglass size={22} />
          </div>
          <h1 className="font-display text-[30px] font-medium tracking-tight">Bonjour Marie</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-gris">
            Le portail collaborateur (mes informations, ma photo, mes documents, signature de mon contrat, et bientôt notes de frais
            et congés) arrive dans la phase 5 de la maquette.
          </p>
        </div>
      </div>
    </div>
  )
}
