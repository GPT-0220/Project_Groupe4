import { useState, useEffect } from 'react'
import { AlertTriangle, Calendar, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'

function Alertes() {
  const [alertes, setAlertes] = useState([])
  const [resume, setResume] = useState([])
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    fetchAlertes()
    fetchResume()
  }, [])

  const fetchAlertes = async () => {
    setLoading(true)
    try {
      let url = '/api/alertes'
      const params = new URLSearchParams()
      if (dateDebut) params.append('dateDebut', dateDebut)
      if (dateFin) params.append('dateFin', dateFin)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setAlertes(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResume = async () => {
    try {
      let url = '/api/alertes/resume'
      const params = new URLSearchParams()
      if (dateDebut) params.append('dateDebut', dateDebut)
      if (dateFin) params.append('dateFin', dateFin)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setResume(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleFilter = () => {
    fetchAlertes()
    fetchResume()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Système d'Alertes</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Filtres temporels</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="datetime-local"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="datetime-local"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filtrer</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Résumé par capteur</h2>
          
          {resume.length > 0 ? (
            <div className="space-y-3">
              {resume.map((item) => (
                <div key={item.capteur_id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.nom}</h3>
                      <p className="text-sm text-gray-600">{item.type} - {item.batiment}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {item.nombre_alertes} alertes
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Valeur max:</span>
                      <span className="font-semibold text-red-600 ml-1">{item.valeur_max}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Seuil:</span>
                      <span className="font-semibold text-gray-800 ml-1">{item.seuil_alerte}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Aucune alerte détectée</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Statistiques</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">{alertes.length}</div>
              <div className="text-sm text-gray-600">Total alertes</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-600">
                {alertes.filter(a => a.gravite === 'CRITIQUE').length}
              </div>
              <div className="text-sm text-gray-600">Alertes critiques</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {alertes.filter(a => a.gravite === 'WARNING').length}
              </div>
              <div className="text-sm text-gray-600">Alertes warning</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{resume.length}</div>
              <div className="text-sm text-gray-600">Capteurs concernés</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Détail des alertes</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : alertes.length > 0 ? (
          <div className="space-y-3">
            {alertes.map((alerte) => (
              <div
                key={`${alerte.capteur_id}-${alerte.date_releve}`}
                className={`p-4 rounded-lg border-2 ${
                  alerte.gravite === 'CRITIQUE' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-6 h-6 ${alerte.gravite === 'CRITIQUE' ? 'text-red-600' : 'text-orange-600'}`} />
                    <div>
                      <h3 className="font-semibold text-gray-800">{alerte.nom}</h3>
                      <p className="text-sm text-gray-600">{alerte.type} - {alerte.batiment} {alerte.etage} - {alerte.salle}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-white text-xs rounded-full ${
                    alerte.gravite === 'CRITIQUE' ? 'bg-red-500' : 'bg-orange-500'
                  }`}>
                    {alerte.gravite}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Valeur:</span>
                    <span className="font-semibold text-red-600 ml-1">{alerte.valeur_verifiee?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Seuil:</span>
                    <span className="font-semibold text-gray-800 ml-1">{alerte.seuil_alerte}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dépassement:</span>
                    <span className="font-semibold text-red-600 ml-1">
                      {((alerte.valeur_verifiee - alerte.seuil_alerte) / alerte.seuil_alerte * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-800 ml-1">
                      {format(new Date(alerte.date_releve), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Aucune alerte détectée sur cette période</p>
        )}
      </div>
    </div>
  )
}

export default Alertes
