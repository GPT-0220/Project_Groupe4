import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './components/Dashboard'
import Historique from './components/Historique'
import Alertes from './components/Alertes'
import Statistiques from './components/Statistiques'
import Comparaison from './components/Comparaison'
import Infrastructure from './components/Infrastructure'
import AdminDashboard from './components/AdminDashboard'
import SystemLogs from './components/SystemLogs'
import Navigation from './components/Navigation'
import Login from './components/Login'
import Register from './components/Register'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return children
}

function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-100">
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/historique" element={<Historique />} />
                      <Route path="/alertes" element={<Alertes />} />
                      <Route path="/statistiques" element={<Statistiques />} />
                      <Route path="/comparaison" element={<Comparaison />} />
                      <Route path="/infrastructure" element={<Infrastructure />} />
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/admin/logs"
                        element={
                          <AdminRoute>
                            <SystemLogs />
                          </AdminRoute>
                        }
                      />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
