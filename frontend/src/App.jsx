import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import LoginPage          from './pages/auth/LoginPage'
import DashboardPage      from './pages/dashboard/DashboardPage'
import DocumentsPage      from './pages/documents/DocumentsPage'
import DocumentDetailPage from './pages/documents/DocumentDetailPage'
import DocumentTypesPage  from './pages/document-types/DocumentTypesPage'
import StatisticsPage          from './pages/statistics/StatisticsPage'
import FicheDepouillementPage  from './pages/fiche/FicheDepouillementPage'

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index             element={<DashboardPage />} />
            <Route path="documents"  element={<DocumentsPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />
            <Route path="document-types" element={<DocumentTypesPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="fiche"      element={<FicheDepouillementPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  )
}
