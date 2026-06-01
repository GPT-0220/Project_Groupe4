import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calculator, Calendar, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Statistiques() {
  const [capteurs, setCapteurs] = useState([])
  const [selectedCapteur, setSelectedCapteur] = useState('')
  const [statistiques, setStatistiques] = useState(null)
  const [statistiquesGlobales, setStatistiquesGlobales] = useState([])
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    fetchCapteurs()
    fetchStatistiquesGlobales()
  }, [])

  const fetchCapteurs = async () => {
    try {
      const response = await fetch('/api/capteurs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setCapteurs(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchStatistiques = async () => {
    if (!selectedCapteur) return
    
    setLoading(true)
    try {
      let url = `/api/statistiques/capteur/${selectedCapteur}`
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
      setStatistiques(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistiquesGlobales = async () => {
    try {
      let url = '/api/statistiques/globales'
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
      setStatistiquesGlobales(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleFilter = () => {
    fetchStatistiques()
    fetchStatistiquesGlobales()
  }

  const getUnite = (type) => {
    switch(type) {
      case 'Thermique': return '°C'
      case 'Électrique': return 'kWh'
      case 'Humidité': return '%'
      case 'Vibration': return 'mm/s'
      default: return ''
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analyses Statistiques</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Filtres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capteur</label>
            <select
              value={selectedCapteur}
              onChange={(e) => setSelectedCapteur(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un capteur</option>
              {capteurs.map(capteur => (
                <option key={capteur.capteur_id} value={capteur.capteur_id}>
                  {capteur.nom} ({capteur.type})
                </option>
              ))}
            </select>
          </div>
          
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
              <Calculator className="w-5 h-5" />
              <span>Calculer</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Statistiques globales par type</h2>
          
          {statistiquesGlobales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistiquesGlobales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="nombre_capteurs" fill="#3b82f6" name="Nombre de capteurs" />
                <Bar dataKey="total_releves" fill="#10b981" name="Total relevés" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">Aucune donnée disponible</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Répartition par type</h2>
          
          {statistiquesGlobales.length > 0 ? (
            <div className="space-y-4">
              {statistiquesGlobales.map((stat) => (
                <div key={stat.type} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{stat.type}</h3>
                    <span className="text-sm text-gray-600">{stat.nombre_capteurs} capteurs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(stat.nombre_capteurs / capteurs.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{stat.total_releves} relevés totaux</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Aucune donnée disponible</p>
          )}
        </div>
      </div>
      
      {statistiques && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Statistiques détaillées - {capteurs.find(c => c.capteur_id === selectedCapteur)?.nom}
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {statistiques.minimum !== null ? statistiques.minimum : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Minimum</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {statistiques.maximum !== null ? statistiques.maximum : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Maximum</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {statistiques.moyenne !== null ? statistiques.moyenne : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Moyenne</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange-600">{statistiques.nombre_releves}</div>
                <div className="text-sm text-gray-600">Nombre de relevés</div>
              </div>
            </div>
          )}
          
          {statistiques.date_premier_releve && statistiques.date_dernier_releve && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Premier relevé:</span>
                  <span className="font-semibold text-gray-800 ml-2">
                    {new Date(statistiques.date_premier_releve).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Dernier relevé:</span>
                  <span className="font-semibold text-gray-800 ml-2">
                    {new Date(statistiques.date_dernier_releve).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Statistiques
