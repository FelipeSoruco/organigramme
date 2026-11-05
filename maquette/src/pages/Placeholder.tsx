import { Hourglass, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/Layout'
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
