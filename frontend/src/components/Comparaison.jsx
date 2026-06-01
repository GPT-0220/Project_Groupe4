import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { GitCompare, Building2, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Comparaison() {
  const [batiments, setBatiments] = useState([])
  const [selectedBatiment, setSelectedBatiment] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [comparaison, setComparaison] = useState([])
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  const types = ['Thermique', 'Électrique', 'Humidité', 'Vibration']

  useEffect(() => {
    fetchBatiments()
  }, [])

  const fetchBatiments = async () => {
    try {
      const response = await fetch('/api/capteurs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      const batimentsUniques = [...new Set(data.map(c => c.batiment))]
      setBatiments(batimentsUniques)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchComparaison = async () => {
    if (!selectedBatiment) return
    
    setLoading(true)
    try {
      let url = `/api/comparaison/batiment/${encodeURIComponent(selectedBatiment)}`
      const params = new URLSearchParams()
      if (dateDebut) params.append('dateDebut', dateDebut)
      if (dateFin) params.append('dateFin', dateFin)
      if (selectedType) params.append('type', selectedType)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setComparaison(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    fetchComparaison()
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Module de Comparaison</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Filtres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bâtiment</label>
            <select
              value={selectedBatiment}
              onChange={(e) => setSelectedBatiment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un bâtiment</option>
              {batiments.map(batiment => (
                <option key={batiment} value={batiment}>{batiment}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de capteur</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
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
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleFilter}
            disabled={!selectedBatiment}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Comparer</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : comparaison.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Graphique comparatif</h2>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparaison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="minimum" fill="#3b82f6" name="Minimum" />
                <Bar dataKey="moyenne" fill="#10b981" name="Moyenne" />
                <Bar dataKey="maximum" fill="#f59e0b" name="Maximum" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Détail par capteur</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capteur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emplacement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maximum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moyenne</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dépassements</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparaison.map((item) => (
                    <tr key={item.capteur_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Étage {item.etage} - {item.salle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.minimum} {getUnite(item.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.maximum} {getUnite(item.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.moyenne} {getUnite(item.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.depassements_seuil > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.depassements_seuil} ({item.taux_depassement}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          <GitCompare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Sélectionnez un bâtiment pour comparer les capteurs</p>
        </div>
      )}
    </div>
  )
}

export default Comparaison
