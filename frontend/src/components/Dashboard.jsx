import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Activity, Thermometer, Zap, Droplets, Vibrate } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'

const socket = io('http://localhost:3001')

function Dashboard() {
  const [derniersReleves, setDerniersReleves] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    fetchDerniersReleves()
    
    socket.on('nouveau-releve', (nouveauReleve) => {
      setDerniersReleves(prev => {
        const updated = [...prev]
        const index = updated.findIndex(r => r.capteur_id === nouveauReleve.capteur_id)
        if (index >= 0) {
          updated[index] = nouveauReleve
        } else {
          updated.push(nouveauReleve)
        }
        return updated
      })
    })

    return () => {
      socket.off('nouveau-releve')
    }
  }, [token])

  const fetchDerniersReleves = async () => {
    try {
      const response = await fetch('/api/releves/derniers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setDerniersReleves(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type) => {
    switch(type) {
      case 'Thermique': return <Thermometer className="w-6 h-6 text-red-500" />
      case 'Électrique': return <Zap className="w-6 h-6 text-yellow-500" />
      case 'Humidité': return <Droplets className="w-6 h-6 text-blue-500" />
      case 'Vibration': return <Vibrate className="w-6 h-6 text-purple-500" />
      default: return <Activity className="w-6 h-6 text-gray-500" />
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

  const isAlerte = (releve) => {
    const valeur = getValeurNumerique(releve.donnees, releve.capteur_info?.type)
    return valeur && releve.capteur_info?.seuil_alerte && valeur > releve.capteur_info.seuil_alerte
  }

  const getValeurNumerique = (donnees, type) => {
    switch(type) {
      case 'Thermique': return donnees.temperature_c
      case 'Électrique': return donnees.kwh
      case 'Humidité': return donnees.humidite_pourcent
      case 'Vibration': return donnees.vibration_mm_s
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord en temps réel</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Derniers relevés</h2>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-600">Temps réel actif</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {derniersReleves.map((releve) => (
            <div
              key={releve.capteur_id}
              className={`p-4 rounded-lg border-2 ${
                isAlerte(releve) ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getIcon(releve.capteur_info?.type)}
                  <span className="font-semibold text-gray-800">{releve.capteur_info?.nom}</span>
                </div>
                {isAlerte(releve) && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">ALERTE</span>
                )}
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valeur:</span>
                  <span className={`font-semibold ${isAlerte(releve) ? 'text-red-600' : 'text-gray-800'}`}>
                    {getValeur(releve.donnees, releve.capteur_info?.type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seuil:</span>
                  <span className="text-gray-800">{releve.capteur_info?.seuil_alerte}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lieu:</span>
                  <span className="text-gray-800">{releve.capteur_info?.batiment} - {releve.capteur_info?.salle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernier relevé:</span>
                  <span className="text-gray-800">
                    {format(new Date(releve.date_releve), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
