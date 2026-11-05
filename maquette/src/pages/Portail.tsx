import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  FileCheck2,
  FileSignature,
  FileText,
  Hourglass,
  Lock,
  MapPin,
  Palmtree,
  PenLine,
  Receipt,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { DocumentContrat, libelleModele, SignatureModal } from '../components/Contrat'
import { ResetButton, RoleSwitcher, useHautDePage } from '../components/Layout'
import { Avatar, Button, Champ, dateFr, EmployeurPastille, INPUT, Libelle, Modal, Progress, StatutBadge, TypeContratBadge } from '../components/ui'
import { DOCUMENTS, masquer, piecesManquantes } from '../data/dossier'
import { SERVICES } from '../data/seed'
import { getRole } from '../roles'
import { useDemo } from '../store'
import type { Contrat, InfosPersonnelles, Personne } from '../types'
import { notifier } from '../ui-store'

function useMoi() {
  const { personnes, role } = useDemo()
  const id = getRole(role).personneId
  return personnes.find((p) => p.id === id)!
}

const ONGLETS = [
  { to: '/', label: 'Accueil' },
  { to: '/mes-informations', label: 'Mes informations' },
  { to: '/mes-documents', label: 'Mes documents' },
  { to: '/mes-contrats', label: 'Mes contrats' },
]

function PortailLayout() {
  const moi = useMoi()
  const main = useHautDePage()
  const contrats = useDemo((s) => s.contrats)
  const aSigner = contrats.filter((c) => c.personneId === moi.id && c.statut === 'signe_direction').length
  return (
    <div className="flex h-full min-w-[1280px] flex-col bg-ivoire">
      <header className="relative z-[60] shrink-0 border-b border-ligne bg-papier">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-10">
          <div className="font-display text-[20px] font-medium tracking-tight">
            Mon espace <span className="text-or">·</span> <span className="text-gris">collaborateur</span>
          </div>
          <div className="flex items-center gap-3">
            <RoleSwitcher />
            <ResetButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1180px] items-center gap-1 px-10">
          {ONGLETS.map((o) => (
            <NavLink
              key={o.to}
              to={o.to}
              end
              className={({ isActive }) =>
                `relative px-3 pt-1 pb-3 text-[13.5px] font-medium transition ${
                  isActive ? 'text-encre after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-or' : 'text-gris hover:text-encre'
                }`
              }
            >
              {o.label}
              {o.to === '/mes-contrats' && aSigner > 0 && (
                <span className="ml-1.5 rounded-full bg-or px-1.5 text-[10.5px] font-semibold text-white">{aSigner}</span>
              )}
            </NavLink>
          ))}
          <span className="mx-2 h-4 w-px bg-ligne" />
          {[
            { to: '/notes-de-frais', label: 'Notes de frais' },
            { to: '/conges', label: 'Congés' },
          ].map((o) => (
            <NavLink
              key={o.to}
              to={o.to}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-3 pt-1 pb-3 text-[13.5px] transition ${
                  isActive ? 'text-encre after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-or' : 'text-gris-clair hover:text-gris'
                }`
              }
            >
              {o.label}
              <span className="rounded-full bg-ivoire px-1.5 py-px text-[10px] font-semibold tracking-wide text-gris uppercase">Bientôt</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <main ref={main} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1180px] px-10 py-9">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function Carte({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-ligne bg-white p-6 ${className}`}>{children}</div>
}

/* ---------- Accueil ---------- */
function Accueil() {
  const moi = useMoi()
  const { postes, contrats, personnes, annee } = useDemo()
  const [signer, setSigner] = useState<Contrat | null>(null)
  const mesContrats = contrats.filter((c) => c.personneId === moi.id)
  const aSigner = mesContrats.find((c) => c.statut === 'signe_direction')
  const poste = postes.find((p) => p.personneId === moi.id && p.annee === annee) ?? postes.find((p) => p.personneId === moi.id)
  const resp = poste && postes.find((p) => p.id === poste.parentId)
  const respPers = resp && personnes.find((p) => p.id === resp.personneId)
  const manquantes = piecesManquantes(moi)

  return (
    <>
      <div className="flex items-center gap-5">
        <Avatar personne={moi} size={64} />
        <div>
          <h1 className="font-display text-[34px] leading-tight font-medium tracking-tight">Bonjour {moi.prenom}</h1>
          {poste && (
            <div className="mt-1 flex items-center gap-3 text-[14px] text-gris">
              {poste.intitule} <EmployeurPastille id={poste.employeurId} />
            </div>
          )}
        </div>
      </div>

      {aSigner && poste && (
        <div className="anim-fade mt-8 flex items-center gap-6 rounded-2xl bg-nuit p-6 text-white">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-or-clair">
            <FileSignature size={22} />
          </div>
          <div className="flex-1">
            <div className="font-display text-[21px] font-medium">Votre contrat est prêt à être signé</div>
            <div className="mt-1 text-[13px] text-white/55">
              {libelleModele(postes.find((p) => p.id === aSigner.posteId)!.typeContrat)} · {dateFr(aSigner.dateDebut)} →{' '}
              {dateFr(aSigner.dateFin)} · déjà signé par la direction
            </div>
          </div>
          <Button variant="or" icon={<PenLine size={15} />} onClick={() => setSigner(aSigner)}>
            Lire et signer
          </Button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-[1.3fr_1fr] gap-6">
        <Carte>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[19px] font-medium">Mon dossier</h2>
            <span className="text-[13px] font-semibold tabular-nums">{moi.completude} %</span>
          </div>
          <div className="mt-3">
            <Progress value={moi.completude} />
          </div>
          {manquantes.length === 0 ? (
            <p className="mt-5 flex items-center gap-2 text-[13px] text-[#1E6656]">
              <Check size={15} /> Votre dossier est complet. Merci !
            </p>
          ) : (
            <>
              <p className="mt-4 text-[13px] text-gris">Il nous manque encore :</p>
              <ul className="mt-2 space-y-1.5">
                {manquantes.map((m) => (
                  <li key={m.id}>
                    <Link
                      to={m.ou === 'infos' ? '/mes-informations' : '/mes-documents'}
                      className="flex items-center justify-between rounded-lg bg-ivoire px-3 py-2 text-[13px] hover:bg-or-pale/60"
                    >
                      {m.libelle}
                      <ArrowRight size={14} className="text-or" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Carte>

        {poste && (
          <Carte>
            <h2 className="font-display text-[19px] font-medium">Mon poste {poste.annee}</h2>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-center gap-2">
                <TypeContratBadge tc={poste.typeContrat} />
                <span className="font-medium">{poste.intitule}</span>
              </div>
              <div className="flex items-center gap-2 text-gris">
                <CalendarDays size={14} /> {dateFr(poste.dateDebut)} → {poste.dateFin ? dateFr(poste.dateFin) : 'indéterminée'}
              </div>
              <div className="flex items-center gap-2 text-gris">
                <MapPin size={14} /> {SERVICES.find((s) => s.id === poste.serviceId)?.nom} · Cannes
              </div>
              {respPers && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-ivoire p-3">
                  <Avatar personne={respPers} size={34} />
                  <div>
                    <div className="text-[11.5px] text-gris">Votre responsable</div>
                    <div className="font-medium">
                      {respPers.prenom} {respPers.nom} · {resp!.intitule}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Carte>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        {[
          { to: '/notes-de-frais', icon: Receipt, t: 'Notes de frais', d: 'Photographiez vos justificatifs, suivez vos remboursements.' },
          { to: '/conges', icon: Palmtree, t: 'Congés', d: 'Demandez vos congés et consultez votre solde.' },
        ].map((x) => (
          <Link key={x.to} to={x.to} className="flex items-center gap-4 rounded-2xl border border-dashed border-ligne-forte bg-papier p-5 hover:border-or/60">
            <span className="grid size-11 place-items-center rounded-xl bg-ivoire text-gris">
              <x.icon size={19} />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 text-[14px] font-medium">
                {x.t}
                <span className="rounded-full bg-ivoire px-1.5 py-px text-[10px] font-semibold tracking-wide text-gris uppercase">Bientôt</span>
              </span>
              <span className="text-[12.5px] text-gris">{x.d}</span>
            </span>
          </Link>
        ))}
      </div>
      {signer && <SignerContrat contrat={signer} moi={moi} onClose={() => setSigner(null)} />}
    </>
  )
}

function SignerContrat({ contrat, moi, onClose }: { contrat: Contrat; moi: Personne; onClose: () => void }) {
  const { postes, agir } = useDemo()
  const poste = postes.find((p) => p.id === contrat.posteId)!
  return (
    <SignatureModal
      contrat={contrat}
      poste={poste}
      personne={moi}
      signataire={`${moi.prenom} ${moi.nom}`}
      telephone={moi.telephone}
      onClose={onClose}
      onSigne={() => {
        agir(contrat.id, 'signer_collaborateur')
        onClose()
      }}
    />
  )
}

/* ---------- Mes informations ---------- */
function reduirePhoto(fichier: File): Promise<string> {
  return new Promise((ok, ko) => {
    const img = new Image()
    img.onload = () => {
      const t = 240
      const c = document.createElement('canvas')
      c.width = c.height = t
      const s = Math.min(img.width, img.height)
      c.getContext('2d')!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, t, t)
      URL.revokeObjectURL(img.src)
      ok(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = ko
    img.src = URL.createObjectURL(fichier)
  })
}

function MesInformations() {
  const moi = useMoi()
  const majInfos = useDemo((s) => s.majInfos)
  const [f, setF] = useState<InfosPersonnelles>(moi.infos)
  const [modifie, setModifie] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)
  const set = (k: keyof InfosPersonnelles, v: string) => {
    setF((x) => ({ ...x, [k]: v }))
    setModifie(true)
  }
  const champ = (k: keyof InfosPersonnelles, label: string, props: { placeholder?: string; type?: string; aide?: string } = {}) => (
    <Champ label={label} aide={props.aide}>
      <input type={props.type ?? 'text'} value={f[k] ?? ''} placeholder={props.placeholder} onChange={(e) => set(k, e.target.value)} className={INPUT} />
    </Champ>
  )
  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-[32px] font-medium tracking-tight">Mes informations</h1>
          <p className="mt-1 text-[13.5px] text-gris">Ces informations servent à établir votre contrat, votre paie et votre accréditation.</p>
        </div>
        <Button
          disabled={!modifie}
          icon={<Check size={15} />}
          onClick={() => {
            majInfos(moi.id, f)
            setModifie(false)
            notifier('Informations enregistrées', 'Le service RH est informé de la mise à jour')
          }}
        >
          Enregistrer
        </Button>
      </div>

      <div className="mt-7 grid grid-cols-[300px_1fr] gap-6">
        <Carte className="text-center">
          <div className="relative mx-auto w-fit">
            <Avatar personne={{ ...moi, infos: f }} size={132} />
            <button
              onClick={() => photoRef.current?.click()}
              className="absolute right-1 bottom-1 grid size-9 place-items-center rounded-full bg-encre text-white shadow-lg hover:bg-encre-2"
            >
              <Camera size={16} />
            </button>
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const url = await reduirePhoto(file)
              setF((x) => ({ ...x, photo: url }))
              majInfos(moi.id, { photo: url })
              notifier('Photo enregistrée', 'Elle sera utilisée pour votre badge d’accréditation')
            }}
          />
          <div className="mt-4 text-[15px] font-semibold">
            {moi.prenom} {moi.nom}
          </div>
          <div className="text-[12.5px] text-gris">{moi.email}</div>
          <p className="mt-4 rounded-xl bg-ivoire p-3 text-left text-[11.5px] leading-relaxed text-gris">
            Photo de face, fond clair : elle figurera sur votre badge. Nom, prénom et e-mail sont gérés par le service RH.
          </p>
        </Carte>

        <div className="space-y-6">
          <Carte>
            <Libelle>Coordonnées</Libelle>
            <div className="grid grid-cols-[2fr_1fr] gap-3">
              {champ('adresse', 'Adresse', { placeholder: 'N° et rue' })}
              {champ('codePostal', 'Code postal')}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Champ label="Ville">
                <input value={moi.ville} disabled className={INPUT} />
              </Champ>
              <Champ label="Téléphone">
                <input value={moi.telephone} disabled className={INPUT} />
              </Champ>
            </div>
          </Carte>
          <Carte>
            <Libelle>État civil</Libelle>
            <div className="grid grid-cols-3 gap-3">
              {champ('dateNaissance', 'Date de naissance', { type: 'date' })}
              {champ('lieuNaissance', 'Lieu de naissance')}
              {champ('nationalite', 'Nationalité')}
            </div>
          </Carte>
          <Carte>
            <div className="mb-2 flex items-center justify-between">
              <Libelle>Paie</Libelle>
              <span className="mb-2 flex items-center gap-1.5 text-[11.5px] text-gris">
                <Lock size={12} /> Visible uniquement par la comptabilité & paie
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {champ('nir', 'N° de sécurité sociale', { placeholder: '1 23 45 67 890 123 45', aide: moi.infos.nir ? `Enregistré : ${masquer(moi.infos.nir)}` : undefined })}
              {champ('iban', 'IBAN', { placeholder: 'FR76 …', aide: moi.infos.iban ? `Enregistré : ${masquer(moi.infos.iban)}` : undefined })}
            </div>
          </Carte>
          <Carte>
            <Libelle>Festival</Libelle>
            <div className="grid grid-cols-3 gap-3">
              {champ('urgenceNom', 'Contact d’urgence')}
              {champ('urgenceTel', 'Téléphone du contact')}
              <Champ label="Taille de tenue">
                <select value={f.tenue ?? ''} onChange={(e) => set('tenue', e.target.value)} className={INPUT}>
                  <option value="">—</option>
                  {['XS', 'S', 'M', 'L', 'XL'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Champ>
            </div>
          </Carte>
        </div>
      </div>
    </>
  )
}

/* ---------- Mes documents ---------- */
function MesDocuments() {
  const moi = useMoi()
  const { deposerDocument, contrats, postes } = useDemo()
  const refs = useRef<Record<string, HTMLInputElement | null>>({})
  const [voir, setVoir] = useState<Contrat | null>(null)
  const signes = contrats.filter((c) => c.personneId === moi.id && c.statut === 'actif')
  return (
    <>
      <h1 className="font-display text-[32px] font-medium tracking-tight">Mes documents</h1>
      <p className="mt-1 text-[13.5px] text-gris">Déposez vos pièces justificatives : PDF ou photo, 10 Mo maximum.</p>

      <div className="mt-7 grid grid-cols-2 gap-4">
        {DOCUMENTS.map((d) => {
          const doc = moi.documents[d.id]
          return (
            <div key={d.id} className={`flex items-center gap-4 rounded-2xl border p-5 ${doc ? 'border-ligne bg-white' : 'border-dashed border-ligne-forte bg-papier'}`}>
              <span className={`grid size-11 place-items-center rounded-xl ${doc ? 'bg-[#DFF1EA] text-[#1E6656]' : 'bg-ivoire text-gris'}`}>
                {doc ? <FileCheck2 size={19} /> : <Upload size={19} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium">{d.libelle}</div>
                <div className="truncate text-[12px] text-gris">{doc ? `${doc.fichier} · ${dateFr(doc.date)}` : d.aide}</div>
              </div>
              <input
                ref={(el) => {
                  refs.current[d.id] = el
                }}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  // Maquette : seul le nom du fichier est conservé, pas son contenu.
                  deposerDocument(moi.id, d.id, file.name)
                  notifier('Document déposé', d.libelle)
                  e.target.value = ''
                }}
              />
              {doc ? (
                <button onClick={() => deposerDocument(moi.id, d.id, null)} className="grid size-8 place-items-center rounded-lg text-gris hover:bg-ivoire hover:text-[#9B2C2C]" title="Supprimer">
                  <Trash2 size={15} />
                </button>
              ) : (
                <Button variant="secondary" onClick={() => refs.current[d.id]?.click()} className="!py-1.5 !text-[12.5px]">
                  Déposer
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <h2 className="font-display mt-10 text-[21px] font-medium">Documents de l’employeur</h2>
      <div className="mt-4 space-y-2">
        {signes.map((c) => {
          const p = postes.find((x) => x.id === c.posteId)!
          return (
            <button key={c.id} onClick={() => setVoir(c)} className="flex w-full items-center gap-4 rounded-2xl border border-ligne bg-white p-4 text-left hover:border-ligne-forte">
              <FileText size={19} className="text-or" />
              <span className="flex-1">
                <span className="block text-[13.5px] font-medium">
                  {libelleModele(p.typeContrat)} · {p.annee}
                </span>
                <span className="block text-[12px] text-gris">Signé électroniquement · {p.intitule}</span>
              </span>
              <ArrowRight size={15} className="text-gris" />
            </button>
          )
        })}
        <div className="flex items-center gap-4 rounded-2xl border border-dashed border-ligne-forte bg-papier p-4 text-gris">
          <Hourglass size={17} />
          <span className="text-[13px]">Bulletins de salaire et attestations · bientôt disponibles ici</span>
        </div>
      </div>
      {voir && <VoirContrat contrat={voir} moi={moi} onClose={() => setVoir(null)} />}
    </>
  )
}

function VoirContrat({ contrat, moi, onClose }: { contrat: Contrat; moi: Personne; onClose: () => void }) {
  const poste = useDemo((s) => s.postes.find((p) => p.id === contrat.posteId))!
  return (
    <Modal surtitre="Mon contrat" titre={libelleModele(poste.typeContrat)} onClose={onClose} largeur={760}>
      <div className="-mx-7 -my-6 bg-ivoire px-7 py-6">
        <DocumentContrat contrat={contrat} poste={poste} personne={moi} />
      </div>
    </Modal>
  )
}

/* ---------- Mes contrats ---------- */
function MesContrats() {
  const moi = useMoi()
  const { contrats, postes } = useDemo()
  const [signer, setSigner] = useState<Contrat | null>(null)
  const [voir, setVoir] = useState<Contrat | null>(null)
  const miens = contrats.filter((c) => c.personneId === moi.id && c.statut !== 'refuse').reverse()
  return (
    <>
      <h1 className="font-display text-[32px] font-medium tracking-tight">Mes contrats</h1>
      <div className="mt-7 space-y-3">
        {miens.map((c) => {
          const p = postes.find((x) => x.id === c.posteId)!
          const visible = ['signe_direction', 'actif'].includes(c.statut)
          return (
            <div key={c.id} className="flex items-center gap-5 rounded-2xl border border-ligne bg-white p-5">
              <div className="w-14 font-display text-[22px] font-medium text-gris tabular-nums">{p.annee}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <TypeContratBadge tc={p.typeContrat} />
                  <span className="text-[14.5px] font-medium">{p.intitule}</span>
                </div>
                <div className="mt-1 text-[12.5px] text-gris">
                  {libelleModele(p.typeContrat)} · {dateFr(c.dateDebut)} → {c.dateFin ? dateFr(c.dateFin) : 'indéterminée'}
                </div>
              </div>
              {c.statut === 'signe_direction' ? (
                <Button variant="or" icon={<PenLine size={15} />} onClick={() => setSigner(c)}>
                  Lire et signer
                </Button>
              ) : visible ? (
                <>
                  <StatutBadge statut={c.statut} />
                  <Button variant="secondary" onClick={() => setVoir(c)}>
                    Voir
                  </Button>
                </>
              ) : (
                <span className="text-[12.5px] text-gris">En préparation par le service RH</span>
              )}
            </div>
          )
        })}
        {miens.length === 0 && <p className="text-[13px] text-gris">Aucun contrat pour le moment.</p>}
      </div>
      {signer && <SignerContrat contrat={signer} moi={moi} onClose={() => setSigner(null)} />}
      {voir && <VoirContrat contrat={voir} moi={moi} onClose={() => setVoir(null)} />}
    </>
  )
}

/* ---------- Bientôt ---------- */
function Bientot({ titre, icone: Icone, texte, points }: { titre: string; icone: typeof Receipt; texte: string; points: string[] }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-ligne-forte bg-papier px-8 py-16 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-or-pale text-or">
        <Icone size={22} />
      </div>
      <div className="font-display text-[26px] font-medium">{titre}</div>
      <p className="mt-2 max-w-[480px] text-[14px] leading-relaxed text-gris">{texte}</p>
      <ul className="mt-5 space-y-1.5 text-left text-[13px] text-encre-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <Check size={14} className="text-or" /> {p}
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-full bg-ivoire px-3 py-1 text-[11.5px] font-semibold tracking-wide text-gris uppercase">Prochaine version</div>
    </div>
  )
}

export function Portail() {
  return (
    <Routes>
      <Route element={<PortailLayout />}>
        <Route index element={<Accueil />} />
        <Route path="/mes-informations" element={<MesInformations />} />
        <Route path="/mes-documents" element={<MesDocuments />} />
        <Route path="/mes-contrats" element={<MesContrats />} />
        <Route
          path="/notes-de-frais"
          element={
            <Bientot
              titre="Notes de frais"
              icone={Receipt}
              texte="Déclarez vos frais pendant le festival ; la comptabilité valide et le remboursement part avec la paie (Silae)."
              points={['Photo du justificatif depuis le téléphone', 'Validation par le responsable puis la comptabilité', 'Remboursement sur le bulletin de salaire']}
            />
          }
        />
        <Route
          path="/conges"
          element={
            <Bientot
              titre="Congés"
              icone={Palmtree}
              texte="Demandez vos congés, suivez leur validation et consultez votre solde."
              points={['Demande en quelques clics', 'Validation par votre responsable', 'Solde et historique à jour']}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
