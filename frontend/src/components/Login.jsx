import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">SensGuinée</h1>
          <p className="text-gray-600 mt-2">Connexion au système de surveillance IoT</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Pas encore de compte?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              S'inscrire
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Compte de démonstration:</p>
          <p className="text-sm text-gray-800">Email: admin@senguinee.com</p>
          <p className="text-sm text-gray-800">Mot de passe: admin123</p>
        </div>
      </div>
    </div>
  )
}

export default Login
