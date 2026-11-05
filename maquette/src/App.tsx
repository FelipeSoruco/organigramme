import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Toasts } from './components/Toasts'
import { Contrats } from './pages/Contrats'
import { Dashboard } from './pages/Dashboard'
import { Organigramme } from './pages/Organigramme'
import { PersonneFiche, Personnes } from './pages/Personnes'
import { Placeholder } from './pages/Placeholder'
import { Portail } from './pages/Portail'
import { Postes } from './pages/Postes'
import { useDemo } from './store'

const A_VENIR: [string, string, number, string][] = [
  ['/transmissions', 'Transmissions', 6, 'Journal des envois vers Silae et POSI, avec gestion des erreurs et relance.'],
  ['/rapports', 'Rapports', 6, 'Extractions par service, employeur, type de contrat et période ; export Excel.'],
  ['/admin/referentiels', 'Référentiels', 6, 'Employeurs, services, emplois, échelons, formules, modèles de contrat et types d’accréditation POSI.'],
  ['/admin/droits', 'Utilisateurs & droits', 6, 'Rôles et périmètres : par service, par population (ex. tous les stagiaires), ou global.'],
  ['/admin/connecteurs', 'Connecteurs', 6, 'Paramétrage de Yousign, Silae et POSI.'],
]

export default function App() {
  const role = useDemo((s) => s.role)
  return (
    <HashRouter>
      {role === 'collaborateur' ? (
        <Portail />
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/organigramme" element={<Organigramme />} />
            <Route path="/postes" element={<Postes />} />
            <Route path="/personnes" element={<Personnes />} />
            <Route path="/personnes/:id" element={<PersonneFiche />} />
            <Route path="/contrats" element={<Contrats />} />
            {A_VENIR.map(([path, titre, phase, description]) => (
              <Route key={path} path={path} element={<Placeholder titre={titre} phase={phase} description={description} />} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
      <Toasts />
    </HashRouter>
  )
}
