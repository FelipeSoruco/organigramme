import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CornerUpLeft,
  FileText,
  Lock,
  PenLine,
  Send,
  ShieldCheck,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ECHELONS, EMPLOIS, SERVICES } from '../data/seed'
import { dansPerimetre, getRole } from '../roles'
import { useDemo, type Proposition } from '../store'
import type { Contrat, Personne, Poste } from '../types'
import { ACTIONS, actionsPossibles, ETAPES_CIRCUIT, type ActionContrat } from '../workflow'
import {
  Avatar,
  Button,
  Champ,
  dateFr,
  employeur,
  EmployeurPastille,
  euros,
  INPUT,
  Libelle,
  Modal,
  StatutBadge,
  TypeContratBadge,
} from './ui'

/* ---------- Étapes du circuit ---------- */
export function CircuitStepper({ contrat }: { contrat: Contrat }) {
  if (contrat.statut === 'a_corriger' || contrat.statut === 'refuse') {
    const dernier = [...contrat.historique].reverse().find((e) => e.statut === contrat.statut)
    return (
      <div
        className={`rounded-lg px-3 py-2 text-[12px] ${
          contrat.statut === 'a_corriger' ? 'bg-[#FBE3E3]/60 text-[#9B2C2C]' : 'bg-ivoire text-gris'
        }`}
      >
        <b className="font-semibold">
          {contrat.statut === 'a_corriger' ? 'Renvoyé' : 'Refusé'} par {dernier?.auteur ?? '—'}
        </b>
        {dernier?.commentaire && <> : « {dernier.commentaire} »</>}
      </div>
    )
  }
  const idx = ETAPES_CIRCUIT.findIndex((e) => e.statut === contrat.statut)
  const fini = contrat.statut === 'actif'
  return (
    <div className="flex items-center">
      {ETAPES_CIRCUIT.map((e, i) => (
        <div key={e.statut} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full items-center">
            <div className={`h-px flex-1 ${i === 0 ? 'opacity-0' : i <= idx ? 'bg-or' : 'bg-ligne'}`} />
            <span
              className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${
                i < idx || fini ? 'bg-or text-white' : i === idx ? 'bg-white text-or ring-2 ring-or' : 'bg-ligne text-gris'
              }`}
            >
              {i < idx || fini ? '✓' : i + 1}
            </span>
            <div className={`h-px flex-1 ${i === ETAPES_CIRCUIT.length - 1 ? 'opacity-0' : i < idx ? 'bg-or' : 'bg-ligne'}`} />
          </div>
          <span className="text-[10.5px] text-gris">{e.libelle}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------- Historique ---------- */
export function Historique({ contrat }: { contrat: Contrat }) {
  return (
    <ol className="relative ml-1.5 border-l border-ligne">
      {[...contrat.historique].reverse().map((e, i) => {
        const systeme = ['Yousign', 'Silae', 'POSI', 'Reprise Organigram'].includes(e.auteur)
        return (
          <li key={i} className="relative pb-4 pl-5 last:pb-0">
            <span
              className={`absolute top-1 -left-[5px] size-[9px] rounded-full ring-2 ring-white ${
                e.statut === 'a_corriger' ? 'bg-[#C24141]' : systeme ? 'bg-gris-clair' : 'bg-or'
              }`}
            />
            <div className="text-[13px] font-medium text-encre-2">{e.action}</div>
            <div className="text-[11.5px] text-gris">
              {systeme ? <span className="font-medium">{e.auteur}</span> : e.auteur} · {dateFr(e.date)}
            </div>
            {e.commentaire && <div className="mt-1 rounded-lg bg-ivoire px-2.5 py-1.5 text-[12px] text-encre-2">« {e.commentaire} »</div>}
          </li>
        )
      })}
    </ol>
  )
}

/* ---------- Aperçu du document ---------- */
const MODELE: Record<Poste['typeContrat'], string> = {
  CDI: 'Contrat de travail à durée indéterminée',
  CDD: 'Contrat de travail à durée déterminée d’usage',
  STAGE: 'Convention de stage',
  PRESTATION: 'Contrat de prestation de services',
}

export function DocumentContrat({ contrat, poste, personne }: { contrat: Contrat; poste: Poste; personne: Personne }) {
  const emp = employeur(poste.employeurId)
  const ech = ECHELONS.find((e) => e.id === contrat.echelonId)
  const signeDir = ['signe_direction', 'actif'].includes(contrat.statut)
  const signeCol = contrat.statut === 'actif'
  const ne = personne.civilite === 'Mme' ? 'née' : 'né'
  return (
    <div className="mx-auto max-w-[620px] rounded-sm border border-ligne bg-white px-12 py-10 font-serif text-[13px] leading-[1.7] text-encre-2 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="font-sans text-[15px] font-bold tracking-wide" style={{ color: emp.couleur }}>
            {emp.nom}
          </div>
          <div className="font-sans text-[10.5px] text-gris">Adresse de démonstration · 75000 Paris</div>
        </div>
        <div className="rounded bg-ivoire px-2 py-1 font-sans text-[10px] font-semibold tracking-wide text-gris uppercase">
          Modèle de démonstration
        </div>
      </div>
      <h3 className="mb-6 text-center font-display text-[19px] font-medium">{MODELE[poste.typeContrat]}</h3>
      <p>
        Entre <b>{emp.nom}</b>, représentée par sa Déléguée générale, ci-après « l’employeur »,
      </p>
      <p>
        et <b>{personne.civilite} {personne.prenom} {personne.nom}</b>
        {personne.infos.dateNaissance && (
          <>
            , {ne} le {dateFr(personne.infos.dateNaissance)}
            {personne.infos.lieuNaissance && ` à ${personne.infos.lieuNaissance}`}
          </>
        )}
        , demeurant à {personne.ville}, ci-après « le salarié »,
      </p>
      <p className="mt-3">il a été convenu ce qui suit.</p>
      <h4 className="mt-5 font-sans text-[11px] font-bold tracking-[0.12em] uppercase">Article 1 — Engagement</h4>
      <p>
        {personne.civilite} {personne.nom} est {personne.civilite === 'Mme' ? 'engagée' : 'engagé'} en qualité de <b>{poste.intitule}</b> (
        {EMPLOIS.find((e) => e.id === poste.emploiId)?.libelle}) au sein du service{' '}
        {SERVICES.find((s) => s.id === poste.serviceId)?.nom}.
      </p>
      <h4 className="mt-5 font-sans text-[11px] font-bold tracking-[0.12em] uppercase">Article 2 — Durée</h4>
      <p>
        Le présent contrat prend effet le <b>{dateFr(contrat.dateDebut)}</b>
        {contrat.dateFin ? (
          <>
            {' '}
            et prend fin le <b>{dateFr(contrat.dateFin)}</b>.
          </>
        ) : (
          ' pour une durée indéterminée.'
        )}
      </p>
      <h4 className="mt-5 font-sans text-[11px] font-bold tracking-[0.12em] uppercase">Article 3 — Rémunération</h4>
      <p>
        {poste.typeContrat === 'STAGE' ? 'Une gratification mensuelle' : poste.typeContrat === 'PRESTATION' ? 'Un forfait' : 'Une rémunération brute mensuelle'}{' '}
        de <b>{euros(contrat.salaire)}</b>
        {ech && <> correspondant à l’échelon {ech.code} ({ech.libelle})</>}.
      </p>
      <p className="mt-5 text-[11.5px] text-gris italic">[…] Clauses complètes du modèle « {MODELE[poste.typeContrat]} » paramétré dans l’Administration.</p>
      <div className="mt-8 grid grid-cols-2 gap-6 font-sans text-[11.5px]">
        {[
          { qui: 'Pour l’employeur', nom: 'Hélène Vasseur', ok: signeDir },
          { qui: 'Le salarié', nom: `${personne.prenom} ${personne.nom}`, ok: signeCol },
        ].map((s) => (
          <div key={s.qui} className="rounded-lg border border-ligne p-3">
            <div className="text-gris">{s.qui}</div>
            <div className="font-medium">{s.nom}</div>
            <div className={`mt-2 flex h-9 items-center gap-1.5 ${s.ok ? 'text-[#1E6656]' : 'text-gris-clair'}`}>
              {s.ok ? (
                <>
                  <ShieldCheck size={15} /> Signé électroniquement · Yousign
                </>
              ) : (
                'En attente de signature'
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Signature (Yousign simulé) ---------- */
export function SignatureModal({
  contrat,
  poste,
  personne,
  signataire,
  telephone,
  onClose,
  onSigne,
}: {
  contrat: Contrat
  poste: Poste
  personne: Personne
  signataire: string
  telephone: string
  onClose: () => void
  onSigne: () => void
}) {
  const [etape, setEtape] = useState<'lecture' | 'code'>('lecture')
  const [lu, setLu] = useState(false)
  const [code, setCode] = useState('')
  return (
    <Modal
      surtitre="Signature électronique · Yousign"
      titre={`Signature de ${signataire}`}
      onClose={onClose}
      largeur={760}
      pied={
        etape === 'lecture' ? (
          <>
            <label className="mr-auto flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={lu} onChange={(e) => setLu(e.target.checked)} className="size-4 accent-[#b08a3e]" />
              J’ai lu le document et j’accepte de le signer électroniquement
            </label>
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="or" icon={<PenLine size={15} />} disabled={!lu} onClick={() => setEtape('code')}>
              Signer
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setEtape('lecture')}>
              Retour
            </Button>
            <Button variant="or" icon={<ShieldCheck size={15} />} disabled={code.length !== 6} onClick={onSigne}>
              Confirmer la signature
            </Button>
          </>
        )
      }
    >
      {etape === 'lecture' ? (
        <div className="-mx-7 -my-6 bg-ivoire px-7 py-6">
          <DocumentContrat contrat={contrat} poste={poste} personne={personne} />
        </div>
      ) : (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-or-pale text-or">
            <ShieldCheck size={22} />
          </div>
          <div className="text-[15px] font-medium">Un code de sécurité a été envoyé par SMS</div>
          <div className="mt-1 text-[13px] text-gris">au {telephone.replace(/\d(?=.{3})/g, '•')}</div>
          <input
            autoFocus
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            className="mx-auto mt-5 block w-[200px] rounded-xl border border-ligne bg-papier py-3 text-center text-[22px] tracking-[0.5em] tabular-nums outline-none focus:border-or"
          />
          <button onClick={() => setCode('123456')} className="mt-3 text-[12px] text-or hover:underline">
            Maquette : remplir avec le code de démonstration
          </button>
        </div>
      )}
    </Modal>
  )
}

/* ---------- Proposition d’embauche / correction ---------- */
export function PropositionModal({
  poste,
  contrat,
  personneId: personneFixe,
  onClose,
}: {
  poste: Poste
  /** En mode correction */
  contrat?: Contrat
  personneId?: string
  onClose: () => void
}) {
  const { personnes, postes, proposer, agir, creerPersonne } = useDemo()
  const correction = !!contrat
  const [personneId, setPersonneId] = useState(contrat?.personneId ?? personneFixe ?? '')
  const [nouvelle, setNouvelle] = useState(false)
  const [np, setNp] = useState({ civilite: 'Mme' as Personne['civilite'], prenom: '', nom: '', email: '' })
  const [dateDebut, setDateDebut] = useState(contrat?.dateDebut ?? poste.dateDebut)
  const [dateFin, setDateFin] = useState(contrat?.dateFin ?? poste.dateFin ?? '')
  const [echelonId, setEchelonId] = useState(contrat?.echelonId ?? poste.echelonId ?? '')
  const [salaire, setSalaire] = useState(contrat?.salaire ?? poste.salaire)
  const [commentaire, setCommentaire] = useState('')

  const vivier = useMemo(() => {
    const occupes = new Set(postes.filter((p) => p.annee === poste.annee && p.personneId && p.id !== poste.id).map((p) => p.personneId))
    return personnes.filter((p) => !occupes.has(p.id)).sort((a, b) => a.nom.localeCompare(b.nom))
  }, [personnes, postes, poste])

  const valide = (nouvelle ? np.prenom && np.nom && np.email.includes('@') : personneId) && dateDebut && salaire > 0

  const envoyer = () => {
    let pid = personneId
    if (nouvelle) pid = creerPersonne({ ...np, telephone: '06 00 00 00 00', ville: 'Cannes' }, true)
    const p: Proposition = {
      posteId: poste.id,
      personneId: pid,
      dateDebut,
      dateFin: dateFin || null,
      echelonId: echelonId || null,
      salaire,
      commentaire,
    }
    if (correction) agir(contrat!.id, 'corriger', commentaire || undefined, p)
    else proposer(p)
    onClose()
  }

  return (
    <Modal
      surtitre={correction ? 'Correction du contrat' : 'Proposition d’embauche'}
      titre={poste.intitule}
      onClose={onClose}
      largeur={600}
      pied={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button icon={<Send size={15} />} disabled={!valide} onClick={envoyer}>
            {correction ? 'Renvoyer à la comptabilité' : 'Envoyer à la comptabilité'}
          </Button>
        </>
      }
    >
      <div className="mb-5 flex items-center gap-2 text-[12.5px] text-gris">
        <TypeContratBadge tc={poste.typeContrat} />
        <EmployeurPastille id={poste.employeurId} />
        <span>· {SERVICES.find((s) => s.id === poste.serviceId)?.nom}</span>
      </div>

      {correction && (
        <div className="mb-5">
          <CircuitStepper contrat={contrat!} />
        </div>
      )}

      <Libelle>Personne</Libelle>
      {!nouvelle ? (
        <div className="flex gap-2">
          <select
            value={personneId}
            disabled={correction || !!personneFixe}
            onChange={(e) => setPersonneId(e.target.value)}
            className={INPUT}
          >
            <option value="">Choisir dans le vivier…</option>
            {vivier.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prenom} {p.nom} · {p.ville} · dossier {p.completude} %
              </option>
            ))}
          </select>
          {!correction && !personneFixe && (
            <Button variant="secondary" icon={<UserPlus size={15} />} onClick={() => setNouvelle(true)} className="shrink-0">
              Nouvelle
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-ligne bg-papier p-4">
          <div className="grid grid-cols-[90px_1fr_1fr] gap-3">
            <Champ label="Civilité">
              <select value={np.civilite} onChange={(e) => setNp({ ...np, civilite: e.target.value as Personne['civilite'] })} className={INPUT}>
                <option>Mme</option>
                <option>M.</option>
              </select>
            </Champ>
            <Champ label="Prénom">
              <input value={np.prenom} onChange={(e) => setNp({ ...np, prenom: e.target.value })} className={INPUT} />
            </Champ>
            <Champ label="Nom">
              <input value={np.nom} onChange={(e) => setNp({ ...np, nom: e.target.value })} className={INPUT} />
            </Champ>
          </div>
          <Champ label="E-mail" className="mt-3" aide="Une invitation au portail lui sera envoyée pour compléter son dossier.">
            <input value={np.email} onChange={(e) => setNp({ ...np, email: e.target.value })} placeholder="prenom.nom@exemple.fr" className={INPUT} />
          </Champ>
          <button onClick={() => setNouvelle(false)} className="mt-3 text-[12px] text-gris hover:text-encre">
            ← Choisir plutôt dans le vivier
          </button>
        </div>
      )}

      <div className="mt-6">
        <Libelle>Conditions</Libelle>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Champ label="Début">
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className={INPUT} />
        </Champ>
        <Champ label="Fin">
          <input
            type="date"
            value={dateFin}
            disabled={poste.typeContrat === 'CDI'}
            onChange={(e) => setDateFin(e.target.value)}
            className={INPUT}
          />
        </Champ>
        {poste.typeContrat !== 'PRESTATION' && (
          <Champ label="Échelon">
            <select
              value={echelonId}
              onChange={(e) => {
                setEchelonId(e.target.value)
                const b = ECHELONS.find((x) => x.id === e.target.value)
                if (b) setSalaire(b.salaireBase)
              }}
              className={INPUT}
            >
              {ECHELONS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code} · {e.libelle} ({euros(e.salaireBase)})
                </option>
              ))}
            </select>
          </Champ>
        )}
        <Champ label={poste.typeContrat === 'PRESTATION' ? 'Forfait (€)' : poste.typeContrat === 'STAGE' ? 'Gratification (€ / mois)' : 'Brut mensuel (€)'}>
          <input type="number" value={salaire} onChange={(e) => setSalaire(Number(e.target.value))} className={INPUT} />
        </Champ>
      </div>
      <Champ label={correction ? 'Réponse à la remarque' : 'Commentaire pour la comptabilité'} className="mt-3">
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={2}
          placeholder={correction ? 'Ex. : échelon corrigé en E3.' : 'Facultatif'}
          className={INPUT}
        />
      </Champ>
    </Modal>
  )
}

/* ---------- Fiche contrat ---------- */
export function ContratDrawer({ contrat, onClose }: { contrat: Contrat; onClose: () => void }) {
  const { postes, personnes, role: roleId, agir } = useDemo()
  const role = getRole(roleId)
  const poste = postes.find((p) => p.id === contrat.posteId)!
  const personne = personnes.find((p) => p.id === contrat.personneId)!
  const [motif, setMotif] = useState<ActionContrat | null>(null)
  const [texte, setTexte] = useState('')
  const [apercu, setApercu] = useState(false)
  const [signer, setSigner] = useState(false)
  const [corriger, setCorriger] = useState(false)
  const actions = actionsPossibles(role, contrat)
  const voit = dansPerimetre(role, poste)
  const ech = ECHELONS.find((e) => e.id === contrat.echelonId)

  const lancer = (a: ActionContrat) => {
    if (ACTIONS[a].motif) return setMotif(a)
    if (a === 'signer_direction') return setSigner(true)
    if (a === 'corriger') return setCorriger(true)
    agir(contrat.id, a)
  }

  return (
    <>
      <aside className="anim-drawer fixed top-[68px] right-0 bottom-0 z-40 flex w-[460px] flex-col border-l border-ligne bg-white shadow-2xl shadow-encre/10">
        <div className="flex items-start justify-between gap-4 border-b border-ligne px-7 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <Avatar personne={personne} size={46} />
            <div>
              <h2 className="font-display text-[22px] leading-tight font-medium tracking-tight">
                {personne.prenom} {personne.nom}
              </h2>
              <div className="mt-0.5 text-[13px] text-gris">{poste.intitule}</div>
            </div>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-gris hover:bg-ivoire hover:text-encre">
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TypeContratBadge tc={poste.typeContrat} />
              <EmployeurPastille id={poste.employeurId} />
            </div>
            <StatutBadge statut={contrat.statut} />
          </div>
          <CircuitStepper contrat={contrat} />

          {actions.length > 0 && !motif && (
            <div className="mt-5 rounded-2xl border border-or/40 bg-or-pale/40 p-4">
              <div className="mb-3 text-[12.5px] font-medium text-encre-2">
                {contrat.statut === 'signe_direction' ? 'En attente de la signature du collaborateur' : 'À vous de traiter ce contrat'}
              </div>
              <div className="flex flex-wrap gap-2">
                {actions.map((a) => (
                  <Button
                    key={a}
                    variant={a === 'renvoyer' || a === 'refuser' || a === 'relancer' ? 'secondary' : 'primary'}
                    icon={
                      a === 'renvoyer' ? <CornerUpLeft size={15} /> : a === 'refuser' ? <XCircle size={15} /> : a === 'relancer' ? <Send size={15} /> : a === 'signer_direction' ? <PenLine size={15} /> : <CheckCircle2 size={15} />
                    }
                    onClick={() => lancer(a)}
                  >
                    {ACTIONS[a].libelle}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {motif && (
            <div className="anim-fade mt-5 rounded-2xl border border-ligne p-4">
              <Champ label={motif === 'refuser' ? 'Motif du refus' : 'Que faut-il corriger ?'}>
                <textarea autoFocus rows={3} value={texte} onChange={(e) => setTexte(e.target.value)} className={INPUT} />
              </Champ>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setMotif(null)}>
                  Annuler
                </Button>
                <Button
                  disabled={!texte.trim()}
                  onClick={() => {
                    agir(contrat.id, motif, texte.trim())
                    setMotif(null)
                    setTexte('')
                  }}
                >
                  {ACTIONS[motif].libelle}
                </Button>
              </div>
            </div>
          )}

          <button
            onClick={() => setApercu(true)}
            className="mt-5 flex w-full items-center gap-3 rounded-xl border border-ligne bg-papier p-3 text-left transition hover:border-ligne-forte"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-ivoire text-or">
              <FileText size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-medium">{MODELE[poste.typeContrat]}</span>
              <span className="block text-[11.5px] text-gris">Généré depuis le modèle · aperçu</span>
            </span>
            <ArrowRight size={15} className="text-gris" />
          </button>

          <div className="mt-6">
            <Libelle>Conditions</Libelle>
          </div>
          <div className="divide-y divide-ligne/70 text-[13px]">
            <div className="flex justify-between py-2.5">
              <span className="text-gris">Période</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CalendarDays size={13} className="text-gris" />
                {dateFr(contrat.dateDebut)} → {contrat.dateFin ? dateFr(contrat.dateFin) : 'indéterminée'}
              </span>
            </div>
            {voit ? (
              <>
                <div className="flex justify-between py-2.5">
                  <span className="text-gris">Échelon</span>
                  <span className="font-medium">{ech ? `${ech.code} · ${ech.libelle}` : 'Hors grille'}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-gris">Rémunération</span>
                  <span className="font-medium">{euros(contrat.salaire)}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 py-2.5 text-gris">
                <Lock size={14} /> Rémunération confidentielle
              </div>
            )}
            <div className="flex justify-between py-2.5">
              <span className="text-gris">Proposé par</span>
              <span className="font-medium">{getRole(contrat.proposePar).personne}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-gris">Dossier du collaborateur</span>
              <Link to={`/personnes/${personne.id}`} className="font-medium text-or hover:underline">
                {personne.completude} % · voir la fiche
              </Link>
            </div>
          </div>

          <div className="mt-7">
            <Libelle>Historique</Libelle>
          </div>
          <Historique contrat={contrat} />
        </div>
      </aside>

      {apercu && (
        <Modal surtitre="Aperçu" titre={MODELE[poste.typeContrat]} onClose={() => setApercu(false)} largeur={760}>
          <div className="-mx-7 -my-6 bg-ivoire px-7 py-6">
            <DocumentContrat contrat={contrat} poste={poste} personne={personne} />
          </div>
        </Modal>
      )}
      {signer && (
        <SignatureModal
          contrat={contrat}
          poste={poste}
          personne={personne}
          signataire={role.personne}
          telephone="06 00 00 00 42"
          onClose={() => setSigner(false)}
          onSigne={() => {
            agir(contrat.id, 'signer_direction')
            setSigner(false)
          }}
        />
      )}
      {corriger && <PropositionModal poste={poste} contrat={contrat} onClose={() => setCorriger(false)} />}
    </>
  )
}

export const libelleModele = (tc: Poste['typeContrat']) => MODELE[tc]
