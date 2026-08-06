import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/AuthContext'
import { OnboardingProvider } from '@/lib/OnboardingContext'
import { CreativesProvider } from '@/lib/CreativesContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

import { Login } from '@/pages/auth/Login'
import { Signup } from '@/pages/auth/Signup'
import { Onboarding } from '@/pages/onboarding/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { CreativeLibrary } from '@/pages/creatives/CreativeLibrary'
import { CreativeDetail } from '@/pages/creatives/CreativeDetail'
import { Campaigns } from '@/pages/Campaigns'
import { Analytics } from '@/pages/Analytics'
import { Audiences } from '@/pages/Audiences'
import { TestingLab } from '@/pages/TestingLab'
import { AIAssistant } from '@/pages/AIAssistant'
import { Budget } from '@/pages/Budget'
import { Reports } from '@/pages/Reports'
import { Compliance } from '@/pages/Compliance'
import { KnowledgeBase } from '@/pages/KnowledgeBase'
import { Settings } from '@/pages/settings/Settings'

// When built as a standalone preview file (opened via file://), a hash-based
// router is required since there's no server to handle deep links.
const Router = import.meta.env.VITE_PREVIEW === 'true' ? HashRouter : BrowserRouter

function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <CreativesProvider>
        <Router>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: '#18181F',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#F0EEF8',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/creatives" element={<CreativeLibrary />} />
              <Route path="/creatives/:id" element={<CreativeDetail />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/audiences" element={<Audiences />} />
              <Route path="/testing-lab" element={<TestingLab />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        </CreativesProvider>
      </OnboardingProvider>
    </AuthProvider>
  )
}

export default App
