import { useState, useEffect } from 'react'
import { Activity, Shield, AlertTriangle, Clock, RefreshCw, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const { token, user: currentUser, logout } = useAuth()

  useEffect(() => {
    if (currentUser?.role !== 'admin') return
    fetchLogs()
  }, [currentUser, token])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/logs?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Accès refusé. Droits administratifs requis.
      </div>
    )
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'USER_CREATED':
        return <Shield className="w-5 h-5 text-green-600" />
      case 'USER_DELETED':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Activity className="w-5 h-5 text-blue-600" />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'USER_CREATED':
        return 'bg-green-100 text-green-800'
      case 'USER_DELETED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Logs d'Activité Système</h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchLogs}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Historique des Actions</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">Chargement des logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Aucun log disponible</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log, index) => (
              <div key={index} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(log.timestamp).toLocaleString('fr-FR')}</span>
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      {log.details?.username && (
                        <span className="font-medium">{log.details.username}</span>
                      )}
                      {log.details?.email && (
                        <span className="text-gray-600"> ({log.details.email})</span>
                      )}
                      {log.details?.role && (
                        <span className="ml-2">
                          <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                            {log.details.role}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">Information</h3>
            <p className="text-sm text-blue-700 mt-1">
              Les logs d'activité sont actuellement limités aux créations d'utilisateurs. 
              Un système de logging complet sera implémenté pour tracer toutes les actions administratives.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemLogs
