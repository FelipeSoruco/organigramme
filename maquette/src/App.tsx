import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Toasts } from './components/Toasts'
import { Connecteurs, Droits, Referentiels } from './pages/Admin'
import { Contrats } from './pages/Contrats'
import { Dashboard } from './pages/Dashboard'
import { Organigramme } from './pages/Organigramme'
import { PersonneFiche, Personnes } from './pages/Personnes'
import { Portail } from './pages/Portail'
import { Postes } from './pages/Postes'
import { Rapports } from './pages/Rapports'
import { Transmissions } from './pages/Transmissions'
import { useDemo } from './store'

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
            <Route path="/transmissions" element={<Transmissions />} />
            <Route path="/rapports" element={<Rapports />} />
            <Route path="/admin/referentiels" element={<Referentiels />} />
            <Route path="/admin/droits" element={<Droits />} />
            <Route path="/admin/connecteurs" element={<Connecteurs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
      <Toasts />
    </HashRouter>
  )
}
