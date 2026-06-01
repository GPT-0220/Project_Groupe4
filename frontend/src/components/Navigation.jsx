import { Link } from 'react-router-dom'
import { Activity, History, AlertTriangle, BarChart3, GitCompare, Server, LogOut, User, Shield, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Navigation() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Activity className="w-8 h-8" />
            <span className="text-xl font-bold">SensGuinée</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-700 px-3 py-2 rounded">
              <User className="w-5 h-5" />
              <span className="text-sm">{user?.username}</span>
            </div>
            <Link to="/" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded">
              <Activity className="w-5 h-5" />
              <span>Tableau de bord</span>
            </Link>
            <Link to="/historique" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded">
              <History className="w-5 h-5" />
              <span>Historique</span>
            </Link>
            <Link to="/alertes" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded">
              <AlertTriangle className="w-5 h-5" />
              <span>Alertes</span>
            </Link>
            <Link to="/statistiques" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded">
              <BarChart3 className="w-5 h-5" />
              <span>Statistiques</span>
            </Link>
            <Link to="/comparaison" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded">
              <GitCompare className="w-5 h-5" />
              <span>Comparaison</span>
            </Link>
            <Link to="/infrastructure" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded">
              <Server className="w-5 h-5" />
              <span>Infrastructure</span>
            </Link>
            {user?.role === 'admin' && (
              <>
                <div className="border-l border-blue-500 h-6"></div>
                <Link to="/admin" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded bg-blue-700">
                  <Shield className="w-5 h-5" />
                  <span>Administration</span>
                </Link>
                <Link to="/admin/logs" className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded">
                  <FileText className="w-5 h-5" />
                  <span>Logs</span>
                </Link>
              </>
            )}
            <button
              onClick={logout}
              className="flex items-center space-x-1 hover:bg-red-600 px-3 py-2 rounded"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
