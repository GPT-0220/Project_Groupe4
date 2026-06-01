import { useState, useEffect } from 'react'
import { Calendar, Search } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'

function Historique() {
  const [capteurs, setCapteurs] = useState([])
  const [selectedCapteur, setSelectedCapteur] = useState('')
  const [historique, setHistorique] = useState([])
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    fetchCapteurs()
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

  const fetchHistorique = async () => {
    if (!selectedCapteur) return
    
    setLoading(true)
    try {
      let url = `/api/releves/capteur/${selectedCapteur}`
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
      setHistorique(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getValeur = (donnees, type) => {
    switch(type) {
      case 'Thermique': return donnees.temperature_c ? `${donnees.temperature_c.toFixed(1)}°C` : 'N/A'
      case 'Électrique': return donnees.kwh ? `${donnees.kwh.toFixed(1)} kWh` : 'N/A'
      case 'Humidité': return donnees.humidite_pourcent ? `${donnees.humidite_pourcent.toFixed(1)}%` : 'N/A'
      case 'Vibration': return donnees.vibration_mm_s ? `${donnees.vibration_mm_s.toFixed(2)} mm/s` : 'N/A'
      default: return 'N/A'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Historique des relevés</h1>
      
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
                  {capteur.nom} ({capteur.type}) - {capteur.batiment}
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
              onClick={fetchHistorique}
              disabled={!selectedCapteur}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Rechercher</span>
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : historique.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Résultats ({historique.length} relevés)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capteur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Données complètes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historique.map((releve) => (
                  <tr key={releve._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(releve.date_releve), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {releve.capteur_info?.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {releve.capteur_info?.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {getValeur(releve.donnees, releve.capteur_info?.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <pre className="text-xs">{JSON.stringify(releve.donnees, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          Sélectionnez un capteur pour voir son historique
        </div>
      )}
    </div>
  )
}

export default Historique
