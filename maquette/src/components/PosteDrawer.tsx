import { ArrowRight, BadgeCheck, CalendarDays, FileSignature, Lock, Mail, MapPin, Search, UserMinus, UserPlus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { ACCREDITATIONS, ECHELONS, EMPLOIS, SERVICES } from '../data/seed'
import { dansPerimetre, getRole, peutProposer } from '../roles'
import { useDemo } from '../store'
import type { Poste } from '../types'
import { contratDuPoste } from '../workflow'
import { CircuitStepper, PropositionModal } from './Contrat'
import { Avatar, Button, dateFr, EmployeurPastille, euros, Progress, StatutBadge, STATUTS, TypeContratBadge } from './ui'

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ligne/70 py-2.5 text-[13px] last:border-0">
      <span className="text-gris">{label}</span>
      <span className="text-right font-medium text-encre-2">{children}</span>
    </div>
  )
}

export function PosteDrawer({ poste, onClose }: { poste: Poste; onClose: () => void }) {
  const { personnes, postes, contrats, role: roleId, affecter } = useDemo()
  const role = getRole(roleId)
  const [choisir, setChoisir] = useState(false)
  const [q, setQ] = useState('')
  const [proposer, setProposer] = useState(false)

  const personne = personnes.find((p) => p.id === poste.personneId)
  const contrat = contratDuPoste(contrats, poste.id)
  const parent = postes.find((p) => p.id === poste.parentId)
  const parentPers = personnes.find((p) => p.id === parent?.personneId)
  const voitDetails = dansPerimetre(role, poste)
  const echelon = ECHELONS.find((e) => e.id === poste.echelonId)

  const disponibles = useMemo(() => {
    const occupes = new Set(postes.filter((p) => p.annee === poste.annee && p.personneId).map((p) => p.personneId))
    return personnes
      .filter((p) => !occupes.has(p.id))
      .filter((p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(q.toLowerCase()))
  }, [personnes, postes, poste.annee, q])

  const proposable = peutProposer(role, poste)

  return (
    <aside className="anim-drawer fixed top-[68px] right-0 bottom-0 z-40 flex w-[440px] flex-col border-l border-ligne bg-white shadow-2xl shadow-encre/10">
      <div className="flex items-start justify-between gap-4 border-b border-ligne px-7 pt-6 pb-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <TypeContratBadge tc={poste.typeContrat} />
            <EmployeurPastille id={poste.employeurId} />
          </div>
          <h2 className="font-display text-[23px] leading-tight font-medium tracking-tight">{poste.intitule}</h2>
          <div className="mt-1 text-[13px] text-gris">
            {SERVICES.find((s) => s.id === poste.serviceId)?.nom} · Exercice {poste.annee}
          </div>
        </div>
        <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-gris hover:bg-ivoire hover:text-encre">
          <X size={17} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
        {/* Occupant */}
        <div className="mb-2 text-[12px] font-medium text-gris">Titulaire</div>
        {personne ? (
          <div className="rounded-2xl border border-ligne bg-papier p-4">
            <div className="flex items-center gap-3">
              <Avatar personne={personne} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold">
                  {personne.prenom} {personne.nom}
                </div>
                <div className="flex items-center gap-3 text-[12px] text-gris">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {personne.ville}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <Mail size={12} />
                    {personne.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[12px]">
                <span className="text-gris">Dossier complété par la personne</span>
                <span className="font-semibold tabular-nums">{personne.completude} %</span>
              </div>
              <Progress value={personne.completude} />
            </div>
            {contrat && (
              <div className="mt-4 border-t border-ligne pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] text-gris">Contrat</span>
                  <StatutBadge statut={contrat.statut} />
                </div>
                <CircuitStepper contrat={contrat} />
                <Link
                  to={`/contrats?c=${contrat.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-or hover:underline"
                >
                  Voir le contrat et son historique <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-or/50 bg-or-pale/40 p-5 text-center">
            <div className="mx-auto mb-2 grid size-10 place-items-center rounded-full bg-white text-or">
              <UserPlus size={18} />
            </div>
            <div className="text-[14px] font-medium">Poste à pourvoir</div>
            <div className="mt-0.5 text-[12.5px] text-gris">Aucune personne affectée pour {poste.annee}.</div>
          </div>
        )}

        {/* Affectation */}
        {role.peutEditer && !choisir && (
          <div className="mt-3 flex gap-2">
            {personne ? (
              <Button variant="secondary" icon={<UserMinus size={15} />} onClick={() => affecter(poste.id, null)} className="flex-1">
                Libérer le poste
              </Button>
            ) : (
              <Button variant="primary" icon={<UserPlus size={15} />} onClick={() => setChoisir(true)} className="flex-1">
                Affecter une personne
              </Button>
            )}
          </div>
        )}
        {choisir && (
          <div className="anim-fade mt-3 rounded-2xl border border-ligne p-2">
            <div className="relative mb-1">
              <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gris-clair" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher dans le vivier…"
                className="w-full rounded-lg bg-ivoire py-2 pr-3 pl-8 text-[13px] outline-none"
              />
            </div>
            <div className="max-h-[220px] overflow-y-auto">
              {disponibles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    affecter(poste.id, p.id)
                    setChoisir(false)
                    setQ('')
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-ivoire"
                >
                  <Avatar personne={p} size={28} />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">
                      {p.prenom} {p.nom}
                    </div>
                    <div className="text-[11.5px] text-gris">
                      {p.ville} · dossier {p.completude} %
                    </div>
                  </div>
                </button>
              ))}
              {disponibles.length === 0 && <div className="px-2 py-4 text-center text-[12.5px] text-gris">Personne de disponible.</div>}
            </div>
            <button onClick={() => setChoisir(false)} className="mt-1 w-full rounded-lg py-1.5 text-[12px] text-gris hover:text-encre">
              Annuler
            </button>
          </div>
        )}
        {proposable && !choisir && (!personne || !contrat) && (
          <div className="mt-2">
            <Button
              variant={personne ? 'primary' : role.peutEditer ? 'or' : 'primary'}
              icon={<FileSignature size={15} />}
              className="w-full"
              onClick={() => setProposer(true)}
            >
              {personne ? 'Préparer le contrat' : 'Proposer une embauche'}
            </Button>
          </div>
        )}
        {proposer && <PropositionModal poste={poste} personneId={personne?.id} onClose={() => setProposer(false)} />}

        {/* Détails */}
        <div className="mt-7 mb-1 text-[12px] font-medium text-gris">Le poste</div>
        <Ligne label="Rattaché à">
          {parent ? (
            <>
              {parent.intitule}
              {parentPers && <span className="block text-[11.5px] font-normal text-gris">{parentPers.prenom} {parentPers.nom}</span>}
            </>
          ) : (
            '—'
          )}
        </Ligne>
        <Ligne label="Emploi">{EMPLOIS.find((e) => e.id === poste.emploiId)?.libelle}</Ligne>
        <Ligne label="Période">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} className="text-gris" />
            {dateFr(poste.dateDebut)} → {poste.dateFin ? dateFr(poste.dateFin) : 'indéterminée'}
          </span>
        </Ligne>
        <Ligne label="Accréditation POSI">
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck size={14} className="text-or" />
            {ACCREDITATIONS.find((a) => a.id === poste.accreditationId)?.libelle}
          </span>
        </Ligne>

        <div className="mt-7 mb-1 text-[12px] font-medium text-gris">Rémunération</div>
        {voitDetails ? (
          <>
            <Ligne label="Échelon">{echelon ? `${echelon.code} · ${echelon.libelle}` : 'Hors grille'}</Ligne>
            <Ligne label={poste.typeContrat === 'PRESTATION' ? 'Forfait' : poste.typeContrat === 'STAGE' ? 'Gratification mensuelle' : 'Brut mensuel'}>
              {euros(poste.salaire)}
            </Ligne>
            {contrat && <Ligne label="Statut du contrat">{STATUTS[contrat.statut].libelle}</Ligne>}
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-ivoire px-4 py-3.5 text-[12.5px] text-gris">
            <Lock size={16} className="shrink-0 text-gris-clair" />
            Informations confidentielles : ce poste est hors de votre périmètre.
          </div>
        )}
      </div>
    </aside>
  )
}
