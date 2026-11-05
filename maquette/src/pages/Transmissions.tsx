import { AlertTriangle, Check, ChevronDown, FileUp, RefreshCw, Send } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/Layout'
import { Avatar, Button, dateFr, PageHeader, Puce } from '../components/ui'
import { dansPerimetre, getRole } from '../roles'
import { useDemo } from '../store'
import { SYSTEMES } from '../transmissions'
import type { Systeme, Transmission } from '../types'

type Filtre = 'tous' | 'erreur' | Systeme

export function SystemeBadge({ systeme }: { systeme: Systeme }) {
  const s = SYSTEMES[systeme]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: s.fond, color: s.couleur }}>
      {s.nom}
    </span>
  )
}

export function TransmissionStatut({ t }: { t: Transmission }) {
  return t.statut === 'erreur' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FBE3E3] px-2 py-0.5 whitespace-nowrap text-[11px] font-medium text-[#9B2C2C]">
      <AlertTriangle size={11} /> En erreur
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#DFF1EA] px-2 py-0.5 whitespace-nowrap text-[11px] font-medium text-[#1E6656]">
      <Check size={11} strokeWidth={3} /> Envoyé
    </span>
  )
}

export function Transmissions() {
  const { transmissions, contrats, postes, personnes, annee, role: roleId, renvoyerTransmission, inviter } = useDemo()
  const role = getRole(roleId)
  const peutAgir = role.id === 'compta' || role.id === 'admin'
  const [filtre, setFiltre] = useState<Filtre>(() => (transmissions.some((t) => t.statut === 'erreur') ? 'erreur' : 'tous'))
  const [ouvert, setOuvert] = useState<string | null>(null)

  const visibles = useMemo(() => {
    const ps = new Map(postes.filter((p) => p.annee === annee).map((p) => [p.id, p]))
    const cs = new Map(contrats.map((c) => [c.id, c]))
    return transmissions.filter((t) => {
      const p = ps.get(cs.get(t.contratId)?.posteId ?? '')
      return p && dansPerimetre(role, p)
    })
  }, [transmissions, contrats, postes, annee, role])

  const tests: Record<Filtre, (t: Transmission) => boolean> = {
    tous: () => true,
    erreur: (t) => t.statut === 'erreur',
    silae: (t) => t.systeme === 'silae',
    posi: (t) => t.systeme === 'posi',
  }
  const liste = visibles.filter(tests[filtre])
  const erreurs = visibles.filter(tests.erreur).length
  const pers = new Map(personnes.map((p) => [p.id, p]))

  return (
    <Shell>
      <PageHeader surtitre={`Exercice ${annee}`} titre="Transmissions" />
      <p className="mt-1 max-w-[760px] text-[13.5px] text-gris">
        Quand un contrat est signé par le collaborateur, la plateforme envoie automatiquement le salarié et son contrat à{' '}
        <b className="text-encre">Silae</b> (paie) et la demande de badge à <b className="text-encre">POSI</b> (accréditations). Si un envoi
        échoue, il apparaît ici avec la cause et peut être relancé.
      </p>

      <div className="mt-7 grid grid-cols-4 gap-4">
        {[
          { l: 'Envois', v: visibles.length, s: 'depuis le début de l’exercice' },
          { l: 'En erreur', v: erreurs, s: erreurs ? 'à corriger puis relancer' : 'tout est passé', alerte: erreurs > 0 },
          { l: 'Silae · paie', v: visibles.filter(tests.silae).length, s: 'salariés et contrats' },
          { l: 'POSI · accréditations', v: visibles.filter(tests.posi).length, s: 'demandes de badge' },
        ].map((k) => (
          <div key={k.l} className={`rounded-2xl border p-5 ${k.alerte ? 'border-[#F0C9C9] bg-[#FDF3F3]' : 'border-ligne bg-white'}`}>
            <div className={`text-[12.5px] ${k.alerte ? 'text-[#9B2C2C]' : 'text-gris'}`}>{k.l}</div>
            <div className={`font-display mt-2 text-[36px] leading-none font-medium tabular-nums ${k.alerte ? 'text-[#9B2C2C]' : ''}`}>{k.v}</div>
            <div className="mt-2 text-[12px] text-gris-clair">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {(
          [
            ['erreur', 'En erreur'],
            ['tous', 'Tous les envois'],
            ['silae', 'Silae'],
            ['posi', 'POSI'],
          ] as [Filtre, string][]
        ).map(([id, l]) => (
          <Puce key={id} actif={filtre === id} onClick={() => setFiltre(id)} compte={visibles.filter(tests[id]).length}>
            {l}
          </Puce>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ligne bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-ligne bg-papier text-[11px] tracking-[0.08em] text-gris uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-3 py-3 font-semibold">Système</th>
              <th className="px-3 py-3 font-semibold">Collaborateur</th>
              <th className="px-3 py-3 font-semibold">Objet</th>
              <th className="px-3 py-3 font-semibold">Statut</th>
              <th className="w-10 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {liste.map((t) => {
              const p = pers.get(t.personneId)!
              const est = ouvert === t.id
              const dossier = t.cause && t.cause !== 'technique'
              return (
                <Fragment key={t.id}>
                  <tr
                    onClick={() => setOuvert(est ? null : t.id)}
                    className={`cursor-pointer border-b border-ligne/70 transition hover:bg-papier ${t.statut === 'erreur' ? 'bg-[#FDF6F6]' : ''}`}
                  >
                    <td className="px-5 py-3 text-[12.5px] whitespace-nowrap text-gris tabular-nums">{dateFr(t.tentatives.at(-1)?.date ?? t.date)}</td>
                    <td className="px-3 py-3">
                      <SystemeBadge systeme={t.systeme} />
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-3">
                        <Avatar personne={p} size={30} />
                        <span className="font-medium">
                          {p.prenom} {p.nom}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div>{t.objet}</div>
                      {t.statut === 'erreur' && <div className="mt-0.5 text-[12px] text-[#9B2C2C]">{t.message}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <TransmissionStatut t={t} />
                    </td>
                    <td className="px-5 py-3 text-gris-clair">
                      <ChevronDown size={16} className={`transition ${est ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  {est && (
                    <tr className="border-b border-ligne/70 bg-papier">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="anim-fade grid grid-cols-[1fr_auto] gap-6">
                          <div>
                            <div className="mb-2 text-[12px] font-medium text-gris">Tentatives</div>
                            <ol className="space-y-1.5 text-[12.5px]">
                              {t.tentatives.map((x, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className={`mt-1 size-2 shrink-0 rounded-full ${x.resultat === 'ok' ? 'bg-[#2E8B7A]' : 'bg-[#C24141]'}`} />
                                  <span>
                                    {dateFr(x.date)} · {x.auteur} · {x.resultat === 'ok' ? 'accepté' : 'rejeté'}
                                    {x.message && <span className="block text-gris">{x.message}</span>}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {t.statut === 'erreur' && peutAgir && (
                              <>
                                <Button icon={<RefreshCw size={14} />} onClick={() => renvoyerTransmission(t.id)}>
                                  Relancer l’envoi
                                </Button>
                                {dossier && (
                                  <div className="flex gap-2">
                                    <Button variant="secondary" icon={<Send size={14} />} onClick={() => inviter(p.id)}>
                                      Relancer la personne
                                    </Button>
                                    <Link to={`/personnes/${p.id}`}>
                                      <Button variant="secondary" icon={<FileUp size={14} />}>
                                        Compléter le dossier
                                      </Button>
                                    </Link>
                                  </div>
                                )}
                              </>
                            )}
                            <Link to={`/contrats?c=${t.contratId}`} className="text-[12px] font-medium text-or hover:underline">
                              Ouvrir le contrat →
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        {liste.length === 0 && (
          <div className="px-6 py-12 text-center text-[13px] text-gris">
            {filtre === 'erreur' ? 'Aucun envoi en erreur. Tout est bien parti vers Silae et POSI.' : 'Aucun envoi pour le moment.'}
          </div>
        )}
      </div>
    </Shell>
  )
}

