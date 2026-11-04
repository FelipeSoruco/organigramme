import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Organigramme } from './pages/Organigramme'
import { Placeholder, PortailPlaceholder } from './pages/Placeholder'
import { useDemo } from './store'

const A_VENIR: [string, string, number, string][] = [
  ['/postes', 'Postes', 3, 'Liste des postes de l’exercice, filtres par service, employeur et type de contrat, création et modification.'],
  ['/personnes', 'Personnes', 3, 'Fiches, état de complétude du dossier, invitation au portail collaborateur et historique des contrats.'],
  ['/contrats', 'Contrats', 4, 'Circuit complet : proposition, validation comptabilité, validation et signature direction, signature collaborateur.'],
  ['/transmissions', 'Transmissions', 6, 'Journal des envois vers Silae et POSI, avec gestion des erreurs et relance.'],
  ['/rapports', 'Rapports', 6, 'Extractions par service, employeur, type de contrat et période ; export Excel.'],
  ['/admin/referentiels', 'Référentiels', 6, 'Employeurs, services, emplois, échelons, formules, modèles de contrat et types d’accréditation POSI.'],
  ['/admin/droits', 'Utilisateurs & droits', 6, 'Rôles et périmètres : par service, par population (ex. tous les stagiaires), ou global.'],
  ['/admin/connecteurs', 'Connecteurs', 6, 'Paramétrage de Yousign, Silae et POSI.'],
]

export default function App() {
  const role = useDemo((s) => s.role)
  if (role === 'collaborateur') return <PortailPlaceholder />
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/organigramme" element={<Organigramme />} />
          {A_VENIR.map(([path, titre, phase, description]) => (
            <Route key={path} path={path} element={<Placeholder titre={titre} phase={phase} description={description} />} />
          ))}
        </Route>
      </Routes>
    </HashRouter>
  )
}
