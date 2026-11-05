import { ArrowLeft, Check, Eye, FileCheck2, FileX2, Lock, Mail, MapPin, Phone, Plus, Search, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Historique } from '../components/Contrat'
import { Shell } from '../components/Layout'
import {
  Avatar,
  Button,
  Champ,
  dateFr,
  EmployeurPastille,
  INPUT,
  Libelle,
  Modal,
  PageHeader,
  Progress,
  Puce,
  Section,
  StatutBadge,
  TypeContratBadge,
} from '../components/ui'
import { DOCUMENTS, masquer, PIECES, piecesManquantes } from '../data/dossier'
import { SERVICES } from '../data/seed'
import { dansPerimetre, getRole, voitDonneesSensibles } from '../roles'
import { useDemo, type NouvellePersonne } from '../store'
import type { Personne, PortailStatut } from '../types'
import { notifier } from '../ui-store'

const PORTAIL: Record<PortailStatut, { libelle: string; ton: string }> = {
  non_invite: { libelle: 'Non invité·e', ton: 'bg-[#EFEDE8] text-gris' },
  invite: { libelle: 'Invitation envoyée', ton: 'bg-[#FCEFD9] text-[#8A5A0E]' },
  actif: { libelle: 'Portail activé', ton: 'bg-[#DFF1EA] text-[#1E6656]' },
}

export function PortailBadge({ statut }: { statut: PortailStatut }) {
  const s = PORTAIL[statut]
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.ton}`}>{s.libelle}</span>
}

type Filtre = 'tous' | 'incomplets' | 'non_invites' | 'vivier'

/** Les rôles restreints voient les personnes de leur périmètre et le vivier (sans poste cette année). */
function usePersonnesVisibles() {
  const { personnes, postes, annee, role: roleId } = useDemo()
  const role = getRole(roleId)
  return useMemo(() => {
    const posteDe = new Map(postes.filter((p) => p.annee === annee && p.personneId).map((p) => [p.personneId!, p]))
    const visibles = personnes.filter((p) => {
      const poste = posteDe.get(p.id)
      return !poste || dansPerimetre(role, poste)
    })
    return { visibles, posteDe, role }
  }, [personnes, postes, annee, role])
}

export function Personnes() {
  const { inviter, annee } = useDemo()
  const { visibles, posteDe, role } = usePersonnesVisibles()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [creer, setCreer] = useState(false)

  const base = visibles.filter((p) => `${p.prenom} ${p.nom} ${p.ville}`.toLowerCase().includes(q.toLowerCase()))
  const tests: Record<Filtre, (p: Personne) => boolean> = {
    tous: () => true,
    incomplets: (p) => p.completude < 100,
    non_invites: (p) => p.portail !== 'actif',
    vivier: (p) => !posteDe.has(p.id),
  }
  const liste = base.filter(tests[filtre]).sort((a, b) => a.nom.localeCompare(b.nom))
  const relancables = base.filter((p) => p.completude < 100 && p.portail !== 'non_invite')

  return (
    <Shell>
      <PageHeader surtitre={`Exercice ${annee}`} titre="Personnes">
        {role.peutEditer && relancables.length > 0 && (
          <Button
            variant="secondary"
            icon={<Send size={15} />}
            onClick={() => notifier(`${relancables.length} relances envoyées`, 'Chaque personne reçoit la liste des pièces manquantes')}
          >
            Relancer les dossiers incomplets
          </Button>
        )}
        {role.peutEditer && (
          <Button icon={<Plus size={15} />} onClick={() => setCreer(true)}>
            Nouvelle personne
          </Button>
        )}
      </PageHeader>

      <div className="mt-7 flex items-center gap-2">
        <div className="relative mr-2">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-gris-clair" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom ou ville…"
            className="w-[240px] rounded-lg border border-ligne bg-papier py-2 pr-3 pl-9 text-[13px] outline-none focus:border-or"
          />
        </div>
        {(
          [
            ['tous', 'Toutes'],
            ['incomplets', 'Dossier incomplet'],
            ['non_invites', 'Portail non activé'],
            ['vivier', `Sans poste en ${annee}`],
          ] as [Filtre, string][]
        ).map(([k, l]) => (
          <Puce key={k} actif={filtre === k} onClick={() => setFiltre(k)} compte={base.filter(tests[k]).length}>
            {l}
          </Puce>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ligne bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-ligne bg-papier text-[11px] tracking-[0.08em] text-gris uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Personne</th>
              <th className="px-3 py-3 font-semibold">Poste {annee}</th>
              <th className="w-[190px] px-3 py-3 font-semibold">Dossier</th>
              <th className="px-3 py-3 font-semibold">Portail</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {liste.map((p) => {
              const poste = posteDe.get(p.id)
              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/personnes/${p.id}`)}
                  className="cursor-pointer border-b border-ligne/70 transition last:border-0 hover:bg-papier"
                >
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <Avatar personne={p} size={34} />
                      <span>
                        <span className="block font-medium">
                          {p.prenom} {p.nom}
                        </span>
                        <span className="block text-[12px] text-gris">{p.ville}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {poste ? (
                      <>
                        <div>{poste.intitule}</div>
                        <EmployeurPastille id={poste.employeurId} />
                      </>
                    ) : (
                      <span className="text-[12.5px] text-gris-clair">Vivier · sans poste</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="mb-1 text-[12px] font-medium tabular-nums">{p.completude} %</div>
                    <Progress value={p.completude} />
                  </td>
                  <td className="px-3 py-3">
                    <PortailBadge statut={p.portail} />
                  </td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {role.peutEditer && p.portail !== 'actif' && (
                      <Button variant="secondary" icon={<Mail size={14} />} onClick={() => inviter(p.id)} className="!px-2.5 !py-1.5 !text-[12px]">
                        {p.portail === 'non_invite' ? 'Inviter au portail' : 'Renvoyer'}
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {liste.length === 0 && <div className="px-6 py-12 text-center text-[13px] text-gris">Aucune personne ne correspond.</div>}
      </div>
      {creer && <NouvellePersonneModal onClose={() => setCreer(false)} onCree={(id) => navigate(`/personnes/${id}`)} />}
    </Shell>
  )
}

function NouvellePersonneModal({ onClose, onCree }: { onClose: () => void; onCree: (id: string) => void }) {
  const creerPersonne = useDemo((s) => s.creerPersonne)
  const [f, setF] = useState<NouvellePersonne>({ civilite: 'Mme', prenom: '', nom: '', email: '', telephone: '', ville: '' })
  const [inv, setInv] = useState(true)
  const ok = f.prenom.trim() && f.nom.trim() && f.email.includes('@')
  return (
    <Modal
      surtitre="Vivier"
      titre="Nouvelle personne"
      onClose={onClose}
      pied={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            disabled={!ok}
            onClick={() => {
              const id = creerPersonne(f, inv)
              onClose()
              onCree(id)
            }}
          >
            Créer
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[90px_1fr_1fr] gap-3">
        <Champ label="Civilité">
          <select value={f.civilite} onChange={(e) => setF({ ...f, civilite: e.target.value as Personne['civilite'] })} className={INPUT}>
            <option>Mme</option>
            <option>M.</option>
          </select>
        </Champ>
        <Champ label="Prénom">
          <input autoFocus value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} className={INPUT} />
        </Champ>
        <Champ label="Nom">
          <input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} className={INPUT} />
        </Champ>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Champ label="E-mail" className="col-span-2">
          <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="prenom.nom@exemple.fr" className={INPUT} />
        </Champ>
        <Champ label="Téléphone">
          <input value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} className={INPUT} />
        </Champ>
        <Champ label="Ville">
          <input value={f.ville} onChange={(e) => setF({ ...f, ville: e.target.value })} className={INPUT} />
        </Champ>
      </div>
      <label className="mt-5 flex items-start gap-3 rounded-xl bg-ivoire p-4 text-[13px]">
        <input type="checkbox" checked={inv} onChange={(e) => setInv(e.target.checked)} className="mt-0.5 size-4 accent-[#b08a3e]" />
        <span>
          <b className="font-medium">Inviter au portail collaborateur</b>
          <span className="block text-[12px] text-gris">
            La personne reçoit un e-mail pour créer son accès et compléter elle-même son dossier (pièces, IBAN, photo…).
          </span>
        </span>
      </label>
    </Modal>
  )
}

/* ---------- Fiche personne ---------- */
export function PersonneFiche() {
  const { id } = useParams()
  const { personnes, postes, contrats, inviter, role: roleId } = useDemo()
  const role = getRole(roleId)
  const p = personnes.find((x) => x.id === id)
  const [voirSensible, setVoirSensible] = useState(false)
  const [contratOuvert, setContratOuvert] = useState<string | null>(null)
  if (!p)
    return (
      <Shell>
        <p className="text-gris">Personne introuvable.</p>
      </Shell>
    )
  const sesContrats = contrats.filter((c) => c.personneId === p.id).reverse()
  const sesPostes = postes.filter((x) => x.personneId === p.id).sort((a, b) => b.annee - a.annee)
  const visible = sesPostes.length === 0 || sesPostes.some((x) => dansPerimetre(role, x))
  const sensible = voitDonneesSensibles(role)
  const manquantes = piecesManquantes(p)

  return (
    <Shell>
      <Link to="/personnes" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-gris hover:text-encre">
        <ArrowLeft size={14} /> Personnes
      </Link>
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar personne={p} size={72} />
          <div>
            <h1 className="font-display text-[32px] leading-tight font-medium tracking-tight">
              {p.civilite} {p.prenom} {p.nom}
            </h1>
            <div className="mt-1 flex items-center gap-4 text-[13px] text-gris">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {p.ville}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={13} /> {p.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} /> {p.telephone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PortailBadge statut={p.portail} />
          {role.peutEditer && p.portail !== 'actif' && (
            <Button icon={<Mail size={15} />} onClick={() => inviter(p.id)}>
              {p.portail === 'non_invite' ? 'Inviter au portail' : 'Renvoyer l’invitation'}
            </Button>
          )}
        </div>
      </div>

      {!visible ? (
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white px-6 py-5 text-[13px] text-gris ring-1 ring-ligne">
          <Lock size={16} /> Cette personne est hors de votre périmètre.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-[1.25fr_1fr] gap-6">
          <div className="space-y-6">
            <Section
              titre="Dossier"
              action={
                <span className="text-[13px] font-semibold tabular-nums">
                  {p.completude} %<span className="ml-1 font-normal text-gris">complété par la personne</span>
                </span>
              }
            >
              <Progress value={p.completude} />
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
                {PIECES.map((x) => {
                  const ok = x.fait(p)
                  return (
                    <div key={x.id} className="flex items-center gap-2.5 text-[13px]">
                      <span className={`grid size-5 place-items-center rounded-full ${ok ? 'bg-[#DFF1EA] text-[#1E6656]' : 'bg-ivoire text-gris-clair'}`}>
                        {ok ? <Check size={12} strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
                      </span>
                      <span className={ok ? '' : 'text-gris'}>{x.libelle}</span>
                    </div>
                  )
                })}
              </div>
              {manquantes.length > 0 && p.portail !== 'non_invite' && role.peutEditer && (
                <div className="mt-5 flex items-center justify-between rounded-xl bg-ivoire px-4 py-3 text-[12.5px] text-gris">
                  {manquantes.length} élément{manquantes.length > 1 ? 's' : ''} manquant{manquantes.length > 1 ? 's' : ''} · relance automatique tous les 7 jours
                  <Button
                    variant="secondary"
                    icon={<Send size={14} />}
                    className="!px-2.5 !py-1.5 !text-[12px]"
                    onClick={() => notifier('Relance envoyée', `${p.email} · ${manquantes.map((m) => m.libelle).join(', ')}`)}
                  >
                    Relancer maintenant
                  </Button>
                </div>
              )}
            </Section>

            <Section titre="Contrats et historique">
              {sesContrats.length === 0 && <p className="text-[13px] text-gris">Aucun contrat pour le moment.</p>}
              <div className="space-y-3">
                {sesContrats.map((c) => {
                  const poste = postes.find((x) => x.id === c.posteId)
                  if (!poste) return null
                  const ouvert = contratOuvert === c.id
                  return (
                    <div key={c.id} className="rounded-xl border border-ligne">
                      <button onClick={() => setContratOuvert(ouvert ? null : c.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                        <span className="w-12 text-[12px] font-semibold text-gris tabular-nums">{poste.annee}</span>
                        <span className="flex-1">
                          <span className="block text-[13px] font-medium">{poste.intitule}</span>
                          <span className="flex items-center gap-2 text-[12px] text-gris">
                            {SERVICES.find((s) => s.id === poste.serviceId)?.nom} · {dateFr(c.dateDebut)} → {c.dateFin ? dateFr(c.dateFin) : '—'}
                          </span>
                        </span>
                        <TypeContratBadge tc={poste.typeContrat} />
                        <StatutBadge statut={c.statut} court />
                      </button>
                      {ouvert && (
                        <div className="anim-fade border-t border-ligne px-4 py-4">
                          <Historique contrat={c} />
                          <Link to={`/contrats?c=${c.id}`} className="mt-4 inline-block text-[12px] font-medium text-or hover:underline">
                            Ouvrir le contrat →
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <Section
              titre="Informations personnelles"
              action={
                sensible && (
                  <button
                    onClick={() => {
                      setVoirSensible(!voirSensible)
                      if (!voirSensible) notifier('Consultation enregistrée', 'L’accès aux données sensibles est tracé (RGPD)')
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-or hover:underline"
                  >
                    <Eye size={13} /> {voirSensible ? 'Masquer' : 'Afficher les données sensibles'}
                  </button>
                )
              }
            >
              <div className="divide-y divide-ligne/70 text-[13px]">
                {(
                  [
                    ['Adresse', p.infos.adresse ? `${p.infos.adresse}, ${p.infos.codePostal ?? ''} ${p.ville}` : undefined, false],
                    ['Naissance', p.infos.dateNaissance ? `${dateFr(p.infos.dateNaissance)} · ${p.infos.lieuNaissance ?? ''}` : undefined, false],
                    ['Nationalité', p.infos.nationalite, false],
                    ['N° de sécurité sociale', p.infos.nir, true],
                    ['IBAN', p.infos.iban, true],
                    ['Contact d’urgence', p.infos.urgenceNom ? `${p.infos.urgenceNom} · ${p.infos.urgenceTel}` : undefined, false],
                  ] as [string, string | undefined, boolean][]
                ).map(([l, v, sens]) => (
                  <div key={l} className="flex justify-between gap-4 py-2.5">
                    <span className="text-gris">{l}</span>
                    <span className="text-right font-medium">
                      {!v ? (
                        <span className="font-normal text-gris-clair">Non renseigné</span>
                      ) : sens && !sensible ? (
                        <span className="inline-flex items-center gap-1.5 font-normal text-gris">
                          <Lock size={12} /> Confidentiel
                        </span>
                      ) : sens && !voirSensible ? (
                        masquer(v)
                      ) : (
                        v
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
            <Section titre="Pièces justificatives">
              <div className="space-y-2">
                {DOCUMENTS.map((d) => {
                  const doc = p.documents[d.id]
                  return (
                    <div key={d.id} className="flex items-center gap-3 rounded-xl border border-ligne px-3 py-2.5">
                      {doc ? <FileCheck2 size={17} className="text-[#2E8B7A]" /> : <FileX2 size={17} className="text-gris-clair" />}
                      <span className="flex-1">
                        <span className="block text-[13px] font-medium">{d.libelle}</span>
                        <span className="block text-[11.5px] text-gris">{doc ? `${doc.fichier} · déposé le ${dateFr(doc.date)}` : 'En attente'}</span>
                      </span>
                      {doc && sensible && (
                        <button onClick={() => notifier('Maquette', 'L’ouverture du document sera disponible dans la version réelle')} className="text-[12px] text-or hover:underline">
                          Ouvrir
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </Section>
            <div>
              <Libelle>Accès portail</Libelle>
              <p className="text-[12.5px] leading-relaxed text-gris">
                La personne complète elle-même son dossier dans le portail collaborateur. Pour le voir, choisissez le rôle{' '}
                <b className="text-encre">Collaborateur (Marie Dupont)</b> en haut à droite.
              </p>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
