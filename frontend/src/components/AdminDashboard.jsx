import { useState, useEffect } from 'react'
import { Users, UserPlus, Edit2, Trash2, Key, Shield, Activity, Database, Server, LogOut, Thermometer, Zap, Droplets, Vibrate, Plus, Power, PowerOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [capteurs, setCapteurs] = useState([])
  const [stats, setStats] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateCapteurModal, setShowCreateCapteurModal] = useState(false)
  const [showEditCapteurModal, setShowEditCapteurModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCapteur, setSelectedCapteur] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const { token, user: currentUser, logout } = useAuth()
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' })
  const [newCapteur, setNewCapteur] = useState({ capteur_id: '', nom: '', type: 'Thermique', batiment: 'Bâtiment A', etage: 1, salle: 'Salle 1', seuil_alerte: 50 })

  useEffect(() => {
    if (currentUser?.role !== 'admin') return
    fetchUsers()
    fetchCapteurs()
    fetchStats()
  }, [currentUser, token])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchCapteurs = async () => {
    try {
      const response = await fetch('/api/admin/capteurs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setCapteurs(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      })
      if (response.ok) {
        setShowCreateModal(false)
        setNewUser({ username: '', email: '', password: '', role: 'user' })
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: selectedUser.username, email: selectedUser.email, role: selectedUser.role })
      })
      if (response.ok) {
        setShowEditModal(false)
        setSelectedUser(null)
        fetchUsers()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Entrez le nouveau mot de passe:')
    if (!newPassword) return
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      })
      if (response.ok) {
        alert('Mot de passe réinitialisé avec succès')
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleCreateCapteur = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/capteurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCapteur)
      })
      if (response.ok) {
        setShowCreateCapteurModal(false)
        setNewCapteur({ capteur_id: '', nom: '', type: 'Thermique', batiment: 'Bâtiment A', etage: 1, salle: 'Salle 1', seuil_alerte: 50 })
        fetchCapteurs()
        fetchStats()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleUpdateCapteur = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/admin/capteurs/${selectedCapteur._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedCapteur)
      })
      if (response.ok) {
        setShowEditCapteurModal(false)
        setSelectedCapteur(null)
        fetchCapteurs()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDeleteCapteur = async (capteurId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce capteur et tous ses relevés?')) return
    try {
      const response = await fetch(`/api/admin/capteurs/${capteurId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        fetchCapteurs()
        fetchStats()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleToggleCapteur = async (capteurId) => {
    try {
      const response = await fetch(`/api/admin/capteurs/${capteurId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        fetchCapteurs()
        fetchStats()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getCapteurIcon = (type) => {
    switch (type) {
      case 'Thermique': return <Thermometer className="w-5 h-5 text-red-600" />
      case 'Électrique': return <Zap className="w-5 h-5 text-yellow-600" />
      case 'Humidité': return <Droplets className="w-5 h-5 text-blue-600" />
      case 'Vibration': return <Vibrate className="w-5 h-5 text-purple-600" />
      default: return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getCapteurTypeLabel = (type) => {
    switch (type) {
      case 'Thermique': return 'Thermique'
      case 'Électrique': return 'Électrique'
      case 'Humidité': return 'Humidité'
      case 'Vibration': return 'Vibration'
      default: return type
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Accès refusé. Droits administratifs requis.
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Administration</h1>
        <div className="flex space-x-3">
          {activeTab === 'users' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <UserPlus className="w-5 h-5" />
              <span>Nouvel utilisateur</span>
            </button>
          )}
          {activeTab === 'capteurs' && (
            <button
              onClick={() => setShowCreateCapteurModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau capteur</span>
            </button>
          )}
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 ${
            activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Utilisateurs</span>
        </button>
        <button
          onClick={() => setActiveTab('capteurs')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 ${
            activeTab === 'capteurs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span>Capteurs</span>
        </button>
      </div>

      {/* Statistiques système */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Capteurs</p>
                <p className="text-2xl font-bold">{stats.capteurs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Relevés</p>
                <p className="text-2xl font-bold">{stats.releves}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <Server className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold">{stats.activeCapteurs}/{stats.capteurs}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des utilisateurs */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Gestion des Utilisateurs</span>
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setSelectedUser(user); setShowEditModal(true) }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user._id)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Réinitialiser mot de passe"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {user.email !== 'admin@senguinee.com' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Liste des capteurs */}
      {activeTab === 'capteurs' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Gestion des Capteurs</span>
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bâtiment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seuil alerte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {capteurs.map((capteur) => (
                <tr key={capteur._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{capteur.capteur_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getCapteurIcon(capteur.type)}
                      <span className="font-medium">{capteur.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{getCapteurTypeLabel(capteur.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{capteur.batiment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{capteur.etage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{capteur.salle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{capteur.seuil_alerte}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      capteur.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {capteur.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setSelectedCapteur(capteur); setShowEditCapteurModal(true) }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleCapteur(capteur._id)}
                        className={capteur.actif ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                        title={capteur.actif ? "Désactiver" : "Activer"}
                      >
                        {capteur.actif ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteCapteur(capteur._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de création utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Créer un utilisateur</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification utilisateur */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Modifier l'utilisateur</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de création capteur */}
      {showCreateCapteurModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Créer un capteur</h3>
            <form onSubmit={handleCreateCapteur}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID du capteur</label>
                  <input
                    type="text"
                    value={newCapteur.capteur_id}
                    onChange={(e) => setNewCapteur({ ...newCapteur, capteur_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="ex: CAP-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={newCapteur.nom}
                    onChange={(e) => setNewCapteur({ ...newCapteur, nom: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="ex: Capteur Thermique A1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newCapteur.type}
                    onChange={(e) => setNewCapteur({ ...newCapteur, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="Thermique">Thermique</option>
                    <option value="Électrique">Électrique</option>
                    <option value="Humidité">Humidité</option>
                    <option value="Vibration">Vibration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bâtiment</label>
                  <select
                    value={newCapteur.batiment}
                    onChange={(e) => setNewCapteur({ ...newCapteur, batiment: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="Bâtiment A">Bâtiment A</option>
                    <option value="Bâtiment B">Bâtiment B</option>
                    <option value="Bâtiment C">Bâtiment C</option>
                    <option value="Bâtiment D">Bâtiment D</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
                    <input
                      type="number"
                      value={newCapteur.etage}
                      onChange={(e) => setNewCapteur({ ...newCapteur, etage: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                    <input
                      type="text"
                      value={newCapteur.salle}
                      onChange={(e) => setNewCapteur({ ...newCapteur, salle: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCapteur.seuil_alerte}
                    onChange={(e) => setNewCapteur({ ...newCapteur, seuil_alerte: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateCapteurModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification capteur */}
      {showEditCapteurModal && selectedCapteur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Modifier le capteur</h3>
            <form onSubmit={handleUpdateCapteur}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={selectedCapteur.nom}
                    onChange={(e) => setSelectedCapteur({ ...selectedCapteur, nom: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={selectedCapteur.type}
                    onChange={(e) => setSelectedCapteur({ ...selectedCapteur, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="Thermique">Thermique</option>
                    <option value="Électrique">Électrique</option>
                    <option value="Humidité">Humidité</option>
                    <option value="Vibration">Vibration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bâtiment</label>
                  <select
                    value={selectedCapteur.batiment}
                    onChange={(e) => setSelectedCapteur({ ...selectedCapteur, batiment: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="Bâtiment A">Bâtiment A</option>
                    <option value="Bâtiment B">Bâtiment B</option>
                    <option value="Bâtiment C">Bâtiment C</option>
                    <option value="Bâtiment D">Bâtiment D</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
                    <input
                      type="number"
                      value={selectedCapteur.etage}
                      onChange={(e) => setSelectedCapteur({ ...selectedCapteur, etage: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                    <input
                      type="text"
                      value={selectedCapteur.salle}
                      onChange={(e) => setSelectedCapteur({ ...selectedCapteur, salle: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedCapteur.seuil_alerte}
                    onChange={(e) => setSelectedCapteur({ ...selectedCapteur, seuil_alerte: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
                  <select
                    value={selectedCapteur.actif ? 'true' : 'false'}
                    onChange={(e) => setSelectedCapteur({ ...selectedCapteur, actif: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditCapteurModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
