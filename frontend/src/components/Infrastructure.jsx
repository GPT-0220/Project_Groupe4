import { useState, useEffect } from 'react'
import { Server, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Infrastructure() {
  const [capteurs, setCapteurs] = useState([])
  const [capteursInactifs, setCapteursInactifs] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    fetchInfrastructure()
  }, [])

  const fetchInfrastructure = async () => {
    setLoading(true)
    try {
      const [capteursRes, inactifsRes] = await Promise.all([
        fetch('/api/capteurs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('/api/capteurs/status/inactifs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])
      
      const capteursData = await capteursRes.json()
      const inactifsData = await inactifsRes.json()
      
      setCapteurs(capteursData)
      setCapteursInactifs(inactifsData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const capteursActifs = capteurs.filter(c => c.actif)
  const capteursInactifsTotal = capteurs.filter(c => !c.actif)
  const capteursSansReleve = capteursInactifs

  const getStatistiquesParBatiment = () => {
    const stats = {}
    capteurs.forEach(capteur => {
      if (!stats[capteur.batiment]) {
        stats[capteur.batiment] = {
          total: 0,
          actifs: 0,
          inactifs: 0,
          parType: {}
        }
      }
      stats[capteur.batiment].total++
      if (capteur.actif) {
        stats[capteur.batiment].actifs++
      } else {
        stats[capteur.batiment].inactifs++
      }
      
      if (!stats[capteur.batiment].parType[capteur.type]) {
        stats[capteur.batiment].parType[capteur.type] = 0
      }
      stats[capteur.batiment].parType[capteur.type]++
    })
    return stats
  }

  const statsParBatiment = getStatistiquesParBatiment()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Surveillance de l'Infrastructure</h1>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total capteurs</p>
                  <p className="text-3xl font-bold text-gray-800">{capteurs.length}</p>
                </div>
                <Server className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Capteurs actifs</p>
                  <p className="text-3xl font-bold text-green-600">{capteursActifs.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Capteurs inactifs</p>
                  <p className="text-3xl font-bold text-red-600">{capteursInactifsTotal.length}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sans récent relevé</p>
                  <p className="text-3xl font-bold text-orange-600">{capteursSansReleve.length}</p>
                </div>
                <Clock className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Statistiques par bâtiment</h2>
              
              <div className="space-y-4">
                {Object.entries(statsParBatiment).map(([batiment, stats]) => (
                  <div key={batiment} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">{batiment}</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-gray-800 ml-1">{stats.total}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Actifs:</span>
                        <span className="font-semibold text-green-600 ml-1">{stats.actifs}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Inactifs:</span>
                        <span className="font-semibold text-red-600 ml-1">{stats.inactifs}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Par type:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(stats.parType).map(([type, count]) => (
                          <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {type}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Capteurs sans récent relevé</h2>
              
              {capteursSansReleve.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {capteursSansReleve.map((capteur) => (
                    <div key={capteur.capteur_id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{capteur.nom}</h3>
                          <p className="text-sm text-gray-600">{capteur.type}</p>
                        </div>
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{capteur.batiment} - Étage {capteur.etage} - {capteur.salle}</p>
                        <p className="mt-1">Installé le: {new Date(capteur.date_installation).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>Tous les capteurs actifs ont envoyé des relevés récents</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Liste complète des capteurs</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bâtiment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seuil</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {capteurs.map((capteur) => (
                    <tr key={capteur.capteur_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {capteur.capteur_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {capteur.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {capteur.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {capteur.batiment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {capteur.etage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {capteur.salle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {capteur.seuil_alerte}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          capteur.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {capteur.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Infrastructure
