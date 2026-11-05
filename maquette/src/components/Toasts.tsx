import { CheckCircle2, X } from 'lucide-react'
import { useToasts } from '../ui-store'

export function Toasts() {
  const { toasts, fermer } = useToasts()
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="anim-fade pointer-events-auto flex min-w-[340px] items-start gap-3 rounded-xl bg-nuit px-4 py-3 text-white shadow-2xl shadow-encre/30"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-or-clair" />
          <div className="flex-1">
            <div className="text-[13.5px] font-medium">{t.texte}</div>
            {t.detail && <div className="mt-0.5 text-[12px] text-white/55">{t.detail}</div>}
          </div>
          <button onClick={() => fermer(t.id)} className="text-white/40 hover:text-white">
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}
